"use client";

import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useChatStore } from '@/stores/useChatStore';
import { ChatMessageUser, ChatMessageAssistant } from './ChatMessage';
import { ChatComposer } from './ChatComposer';
import { StarterQuestions } from './StarterQuestions';

export function ChatPanel() {
  const messages = useChatStore((s) => s.messages);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const streamingStatus = useChatStore((s) => s.streamingStatus);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const clearChat = useChatStore((s) => s.clearChat);
  const showSourcesForMessage = useChatStore((s) => s.showSourcesForMessage);
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

      // Scroll to the target pair
      const el = pairRefs.current.get(targetIndex);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      // Switch sources in the side panel to the target pair's sources
      if (pair.assistant?.id) {
        showSourcesForMessage(pair.assistant.id);
      }
    },
    [messagePairs, showSourcesForMessage]
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {!hasMessages ? (
          <StarterQuestions onSelect={sendMessage} />
        ) : (
          <div className="max-w-3xl mx-auto py-4 space-y-2">
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
