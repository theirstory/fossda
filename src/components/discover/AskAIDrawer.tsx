"use client";

import { useEffect, useRef, useMemo, useCallback } from 'react';
import { useChatStore } from '@/stores/useChatStore';
import { ChatMessageUser, ChatMessageAssistant } from './ChatMessage';
import { ChatComposer } from './ChatComposer';
import { StarterQuestions } from './StarterQuestions';
import { SidePanel } from './SidePanel';
import { Sparkles, X, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function DrawerChatPanel() {
  const messages = useChatStore((s) => s.messages);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const streamingStatus = useChatStore((s) => s.streamingStatus);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const clearChat = useChatStore((s) => s.clearChat);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pairRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const hasMessages = messages.length > 0;

  const messagePairs = useMemo(() => {
    const pairs: { user: typeof messages[0]; assistant: typeof messages[0] | null }[] = [];
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (msg.role === 'user') {
        const next = messages[i + 1];
        pairs.push({
          user: msg,
          assistant: next?.role === 'assistant' ? next : null,
        });
      }
    }
    return pairs;
  }, [messages]);

  const handleNavigate = useCallback(
    (targetIndex: number) => {
      const pair = messagePairs[targetIndex];
      if (!pair) return;
      const el = pairRefs.current.get(targetIndex);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    [messagePairs]
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {!hasMessages ? (
          <StarterQuestions onSelect={sendMessage} />
        ) : (
          <div className="py-4 space-y-2">
            {messagePairs.map((pair, index) => (
              <div
                key={pair.user.id}
                ref={(el) => {
                  if (el) pairRefs.current.set(index, el);
                  else pairRefs.current.delete(index);
                }}
              >
                <ChatMessageUser
                  message={pair.user}
                  pairedAssistantId={pair.assistant?.id}
                  pairIndex={index}
                  totalPairs={messagePairs.length}
                  onNavigate={handleNavigate}
                />
                {pair.assistant && (
                  <ChatMessageAssistant message={pair.assistant} />
                )}
              </div>
            ))}

            {isStreaming && streamingStatus && (
              <div className="px-8 text-xs text-muted-foreground animate-pulse">
                {streamingStatus}
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <ChatComposer
        onSend={sendMessage}
        onClear={clearChat}
        isStreaming={isStreaming}
        hasMessages={hasMessages}
      />
    </div>
  );
}

export function AskAIDrawer() {
  const isDrawerOpen = useChatStore((s) => s.isDrawerOpen);
  const closeDrawer = useChatStore((s) => s.closeDrawer);
  const toggleDrawer = useChatStore((s) => s.toggleDrawer);
  const sidePanelOpen = useChatStore((s) => s.sidePanelOpen);
  const pathname = usePathname();

  // Don't render the drawer on the /discover page since it has its own full UI
  const isDiscoverPage = pathname === '/discover';

  // Cmd+K keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleDrawer();
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [toggleDrawer]);

  if (isDiscoverPage) return null;

  const showSources = sidePanelOpen && isDrawerOpen;

  return (
    <>
      {/* Overlay */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 transition-opacity"
          onClick={closeDrawer}
        />
      )}

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 h-full z-50 bg-white shadow-2xl border-l transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
        style={{ width: '480px', maxWidth: '100vw' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold">Discover - Ask AI</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border bg-gray-100 px-1.5 py-0.5 text-[10px] text-muted-foreground font-medium">
              ⌘K
            </kbd>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href="/discover"
              onClick={closeDrawer}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
              title="Open full Discover page"
            >
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </Link>
            <button
              type="button"
              onClick={closeDrawer}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Content area: swap between chat and sources */}
        <div className="flex flex-col h-[calc(100%-49px)] overflow-hidden">
          {showSources ? (
            <SidePanel inDrawer />
          ) : (
            <DrawerChatPanel />
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      {!isDrawerOpen && (
        <button
          type="button"
          onClick={() => toggleDrawer()}
          className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all flex items-center justify-center"
          title="Ask AI (⌘K)"
        >
          <Sparkles className="h-6 w-6" />
        </button>
      )}
    </>
  );
}
