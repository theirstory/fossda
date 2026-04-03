"use client";

import { useState, useRef, useEffect } from 'react';
import { SendHorizontal, Trash2 } from 'lucide-react';

interface ChatComposerProps {
  onSend: (message: string) => void;
  onClear: () => void;
  isStreaming: boolean;
  hasMessages: boolean;
}

export function ChatComposer({ onSend, onClear, isStreaming, hasMessages }: ChatComposerProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  return (
    <div className="border-t bg-white px-4 py-3">
      <div className="max-w-3xl mx-auto space-y-2">
        {hasMessages && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClear}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gray-900 transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              Clear chat
            </button>
          </div>
        )}
        <div className="flex items-center gap-2 rounded-full border border-gray-300 bg-white pl-1 pr-1.5 py-1 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about the interviews..."
            rows={1}
            className="flex-1 resize-none bg-transparent pl-4 py-2 text-sm focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!input.trim() || isStreaming}
            className="h-9 w-9 shrink-0 flex items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <SendHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
