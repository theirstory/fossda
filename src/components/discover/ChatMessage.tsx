"use client";

import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { CitationChip } from './CitationChip';
import type { ChatMessage as ChatMessageType } from '@/stores/useChatStore';
import type { Citation } from '@/app/api/discover/route';
import { useChatStore } from '@/stores/useChatStore';
import { ChevronUp, ChevronDown, List } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
  pairedAssistantId?: string;
}

interface ChatMessageUserProps extends ChatMessageProps {
  pairIndex: number;
  totalPairs: number;
  onNavigate: (targetIndex: number) => void;
}

function renderContentWithCitations(content: string, citations: Citation[]) {
  const parts = content.split(/(\[\d+\])/g);

  return parts.map((part, i) => {
    const match = part.match(/^\[(\d+)\]$/);
    if (match) {
      const index = parseInt(match[1], 10);
      return <CitationChip key={i} index={index} citations={citations} />;
    }
    return (
      <ReactMarkdown
        key={i}
        rehypePlugins={[rehypeRaw]}
        components={{
          p: ({ children }) => <span>{children}</span>,
        }}
      >
        {part}
      </ReactMarkdown>
    );
  });
}

export function ChatMessageUser({
  message,
  pairedAssistantId,
  pairIndex,
  totalPairs,
  onNavigate,
}: ChatMessageUserProps) {
  const showSourcesForMessage = useChatStore((s) => s.showSourcesForMessage);
  const messages = useChatStore((s) => s.messages);

  const assistantMsg = pairedAssistantId
    ? messages.find((m) => m.id === pairedAssistantId)
    : null;
  const sourceCount = assistantMsg?.citations?.length || 0;

  const canGoUp = pairIndex > 0;
  const canGoDown = pairIndex < totalPairs - 1;

  return (
    <div className="bg-blue-600 text-white rounded-lg mx-4 px-3 py-3 flex items-center gap-2 sticky top-0 z-10">
      <div className="flex flex-col shrink-0">
        <button
          type="button"
          onClick={() => canGoUp && onNavigate(pairIndex - 1)}
          disabled={!canGoUp}
          className="p-0 disabled:opacity-30 hover:opacity-80 transition-opacity"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => canGoDown && onNavigate(pairIndex + 1)}
          disabled={!canGoDown}
          className="p-0 disabled:opacity-30 hover:opacity-80 transition-opacity"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
      <span className="flex-1 text-sm font-medium">{message.content}</span>
      {sourceCount > 0 && (
        <button
          type="button"
          onClick={() => pairedAssistantId && showSourcesForMessage(pairedAssistantId)}
          className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 transition-colors rounded-full px-3 py-1 text-xs font-medium shrink-0"
        >
          <List className="h-3 w-3" />
          {sourceCount} sources
        </button>
      )}
    </div>
  );
}

export function ChatMessageAssistant({ message }: ChatMessageProps) {
  const citations = useMemo(() => message.citations || [], [message.citations]);

  const renderedContent = useMemo(() => {
    if (!message.content) return null;

    const paragraphs = message.content.split(/\n\n+/);
    return paragraphs.map((paragraph, pi) => {
      const lines = paragraph.split(/\n/);
      return (
        <div key={pi} className="mb-4 last:mb-0">
          {lines.map((line, li) => (
            <span key={li}>
              {li > 0 && <br />}
              {renderContentWithCitations(line, citations)}
            </span>
          ))}
        </div>
      );
    });
  }, [message.content, citations]);

  return (
    <div className="px-8 py-2">
      <div className="text-sm prose prose-sm prose-gray max-w-none [&>div]:leading-relaxed [&_h2]:text-base [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-2 [&_h3]:text-sm [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-1">
        {message.content ? (
          renderedContent
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground py-2">
            <div className="flex gap-1">
              <span className="animate-bounce [animation-delay:0ms]">.</span>
              <span className="animate-bounce [animation-delay:150ms]">.</span>
              <span className="animate-bounce [animation-delay:300ms]">.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
