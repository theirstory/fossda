"use client";

import { MessageCircleQuestion } from 'lucide-react';

const STARTER_QUESTIONS = [
  "What motivated early contributors to share code freely?",
  "How did the BSD Unix project influence open source?",
  "What role did licensing play in the open source movement?",
  "How has the relationship between open source and business evolved?",
  "What challenges did women face in early open source communities?",
  "How did the internet change software collaboration?",
];

interface StarterQuestionsProps {
  onSelect: (question: string) => void;
}

export function StarterQuestions({ onSelect }: StarterQuestionsProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">Discover the Archive</h1>
          <p className="text-muted-foreground text-lg">
            Ask questions about the history of free and open source software.
            Answers are grounded in real interview transcripts with citations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {STARTER_QUESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => onSelect(q)}
              className="flex items-start gap-3 text-left p-4 rounded-lg border bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm"
            >
              <MessageCircleQuestion className="h-4 w-4 mt-0.5 shrink-0 text-blue-600" />
              <span>{q}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
