import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Citation } from '@/app/api/discover/route';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
}

type SidePanelView = 'sources' | 'citation';

interface ChatState {
  messages: ChatMessage[];
  isStreaming: boolean;
  streamingStatus: string;
  activeCitation: Citation | null;
  sidePanelOpen: boolean;
  sidePanelView: SidePanelView;
  sidePanelCitations: Citation[];
  sidePanelQuery: string;
  hoveredCitationIndex: number | null;

  sendMessage: (content: string) => Promise<void>;
  setActiveCitation: (citation: Citation | null) => void;
  setHoveredCitation: (index: number | null) => void;
  showSourcesForMessage: (messageId: string) => void;
  backToSources: () => void;
  closeSidePanel: () => void;
  clearChat: () => void;
}

let abortController: AbortController | null = null;

/**
 * Filter to only referenced citations and renumber them sequentially from 1.
 * Returns the remapped text and renumbered citations.
 */
function remapCitations(text: string, allCitations: Citation[]): { text: string; citations: Citation[] } {
  // Find all referenced indices in order of first appearance
  const seen = new Set<number>();
  const ordered: number[] = [];
  for (const match of text.matchAll(/\[(\d+)\]/g)) {
    const idx = parseInt(match[1], 10);
    if (!seen.has(idx)) {
      seen.add(idx);
      ordered.push(idx);
    }
  }

  // Build old→new index map
  const indexMap = new Map<number, number>();
  ordered.forEach((oldIdx, i) => indexMap.set(oldIdx, i + 1));

  // Renumber citations in text
  const remappedText = text.replace(/\[(\d+)\]/g, (_, num) => {
    const newIdx = indexMap.get(parseInt(num, 10));
    return newIdx ? `[${newIdx}]` : `[${num}]`;
  });

  // Renumber citation objects
  const remappedCitations = ordered
    .map((oldIdx) => allCitations.find((c) => c.index === oldIdx))
    .filter((c): c is Citation => c !== undefined)
    .map((c, i) => ({ ...c, index: i + 1 }));

  return { text: remappedText, citations: remappedCitations };
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      isStreaming: false,
      streamingStatus: '',
      activeCitation: null,
      sidePanelOpen: false,
      sidePanelView: 'sources',
      sidePanelCitations: [],
      sidePanelQuery: '',
      hoveredCitationIndex: null,

      sendMessage: async (content: string) => {
        if (get().isStreaming) return;

        if (abortController) {
          abortController.abort();
        }
        abortController = new AbortController();

        const userMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'user',
          content,
        };

        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: '',
          citations: [],
        };

        set((state) => ({
          messages: [...state.messages, userMessage, assistantMessage],
          isStreaming: true,
          streamingStatus: '',
        }));

        const priorMessages = get()
          .messages.slice(0, -2)
          .map((m) => ({ role: m.role, content: m.content }));

        try {
          const response = await fetch('/api/discover', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: priorMessages, query: content }),
            signal: abortController.signal,
          });

          if (!response.ok) {
            throw new Error(`Request failed: ${response.status}`);
          }

          const reader = response.body?.getReader();
          if (!reader) throw new Error('No response stream');

          const decoder = new TextDecoder();
          let buffer = '';
          let accumulatedText = '';
          let citations: Citation[] = [];

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith('data: ')) continue;

              try {
                const data = JSON.parse(trimmed.slice(6));

                switch (data.type) {
                  case 'status':
                    set({ streamingStatus: data.content });
                    break;

                  case 'citations':
                    citations = data.citations;
                    set((state) => ({
                      messages: state.messages.map((m) =>
                        m.id === assistantMessage.id ? { ...m, citations } : m
                      ),
                    }));
                    break;

                  case 'text':
                    accumulatedText += data.content;
                    set((state) => ({
                      messages: state.messages.map((m) =>
                        m.id === assistantMessage.id
                          ? { ...m, content: accumulatedText }
                          : m
                      ),
                    }));
                    break;

                  case 'error':
                    set((state) => ({
                      messages: state.messages.map((m) =>
                        m.id === assistantMessage.id
                          ? { ...m, content: `Error: ${data.content}` }
                          : m
                      ),
                    }));
                    break;

                  case 'done':
                    break;
                }
              } catch {
                // skip malformed SSE lines
              }
            }
          }

          if (citations.length > 0) {
            // Renumber citations to sequential 1,2,3... based on order of appearance
            const { text: remappedText, citations: remappedCitations } = remapCitations(accumulatedText, citations);
            set((state) => ({
              messages: state.messages.map((m) =>
                m.id === assistantMessage.id
                  ? { ...m, content: remappedText, citations: remappedCitations }
                  : m
              ),
              sidePanelOpen: true,
              sidePanelView: 'sources',
              sidePanelCitations: remappedCitations,
              sidePanelQuery: content,
              activeCitation: null,
            }));
          }
        } catch (err) {
          if (err instanceof DOMException && err.name === 'AbortError') return;
          console.error('Chat error:', err);
          set((state) => ({
            messages: state.messages.map((m) =>
              m.id === assistantMessage.id
                ? { ...m, content: 'Sorry, something went wrong. Please try again.' }
                : m
            ),
          }));
        } finally {
          set({ isStreaming: false, streamingStatus: '' });
          abortController = null;
        }
      },

      setHoveredCitation: (index) => {
        set({ hoveredCitationIndex: index });
      },

      setActiveCitation: (citation) => {
        if (citation) {
          const state = get();
          const citations = state.sidePanelCitations.length > 0
            ? state.sidePanelCitations
            : [];
          set({
            activeCitation: citation,
            sidePanelOpen: true,
            sidePanelView: 'citation',
            sidePanelCitations: citations.length > 0 ? citations : [citation],
          });
        } else {
          set({ activeCitation: null, sidePanelView: 'sources' });
        }
      },

      showSourcesForMessage: (messageId: string) => {
        const msg = get().messages.find((m) => m.id === messageId);
        if (msg?.citations && msg.citations.length > 0) {
          const userMsg = get().messages.find(
            (m, i, arr) => m.role === 'user' && arr[i + 1]?.id === messageId
          );
          set({
            sidePanelOpen: true,
            sidePanelView: 'sources',
            sidePanelCitations: msg.citations,
            sidePanelQuery: userMsg?.content || '',
            activeCitation: null,
          });
        }
      },

      backToSources: () => {
        set({ sidePanelView: 'sources', activeCitation: null });
      },

      closeSidePanel: () => {
        set({
          sidePanelOpen: false,
          activeCitation: null,
          sidePanelView: 'sources',
          sidePanelCitations: [],
          sidePanelQuery: '',
        });
      },

      clearChat: () => {
        if (abortController) {
          abortController.abort();
          abortController = null;
        }
        set({
          messages: [],
          isStreaming: false,
          streamingStatus: '',
          activeCitation: null,
          sidePanelOpen: false,
          sidePanelView: 'sources',
          sidePanelCitations: [],
          sidePanelQuery: '',
          hoveredCitationIndex: null,
        });
      },
    }),
    {
      name: 'fossda-chat-store',
      partialize: (state) => ({
        messages: state.messages,
      }),
    }
  )
);
