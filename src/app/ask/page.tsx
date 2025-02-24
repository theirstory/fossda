"use client";

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';

interface Quote {
  text: string;
  interviewId: string;
  title: string;
  timestamp: number;
  speaker: string;
  relevance: string;
}

interface Answer {
  text: string;
  quotes: Quote[];
}

export default function AskPage() {
  const searchParams = useSearchParams();
  const [question, setQuestion] = useState(searchParams.get('q') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuotes, setExpandedQuotes] = useState<Set<number>>(new Set());
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Focus the textarea on mount
    textareaRef.current?.focus();
    
    // If there's a question in the URL, submit it automatically
    if (searchParams.get('q')) {
      handleSubmit(new Event('submit') as unknown as React.FormEvent<HTMLFormElement>);
    }
  }, []);

  // Save state to sessionStorage when it changes
  useEffect(() => {
    if (answer) {
      sessionStorage.setItem('lastAnswer', JSON.stringify(answer));
      sessionStorage.setItem('lastQuestion', question);
    }
  }, [answer, question]);

  // Restore state from sessionStorage on mount
  useEffect(() => {
    if (!searchParams.get('q')) {
      const lastAnswer = sessionStorage.getItem('lastAnswer');
      const lastQuestion = sessionStorage.getItem('lastQuestion');
      if (lastAnswer && lastQuestion) {
        setAnswer(JSON.parse(lastAnswer));
        setQuestion(lastQuestion);
      }
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Check for Command+Enter (Mac) or Control+Enter (Windows)
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  const toggleQuote = (index: number) => {
    const newExpanded = new Set(expandedQuotes);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedQuotes(newExpanded);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setAnswer(null);

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.error || 'Failed to get answer');
        } catch {
          throw new Error(errorText || 'Failed to get answer');
        }
      }

      const data = await response.json();
      setAnswer(data);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Ask the Archive</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Ask questions about open source and receive answers with direct quotes from our interviews.
          Our AI will help you explore insights from industry pioneers.
        </p>
      </div>

      {/* Question Form */}
      <Card className="max-w-2xl mx-auto p-6 mb-8">
        <form onSubmit={handleSubmit}>
          <Textarea
            ref={textareaRef}
            value={question}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about open source... (Press ⌘+Enter to submit)"
            className="min-h-[100px] mb-4"
          />
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading || !question.trim()}
          >
            {isLoading ? 'Searching...' : 'Ask Question'}
          </Button>
        </form>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="max-w-2xl mx-auto p-6 mb-8 border-red-200 bg-red-50">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      {/* Answer Section */}
      {answer && (
        <Card className="max-w-3xl mx-auto p-6">
          <div className="prose max-w-none mb-8">
            <p>{answer.text}</p>
          </div>

          {answer.quotes.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Supporting Quotes</h3>
              <div className="space-y-4">
                {answer.quotes.map((quote, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          <h4 className="font-medium text-blue-600">
                            {quote.text.slice(0, 60)}...
                          </h4>
                        </div>
                        <div className="text-sm text-gray-500 mb-2">
                          From interview with {quote.speaker}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleQuote(index)}
                        className="ml-2"
                      >
                        {expandedQuotes.has(index) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    
                    <div className={cn(
                      "overflow-hidden transition-all duration-200",
                      expandedQuotes.has(index) ? "max-h-[500px]" : "max-h-0"
                    )}>
                      <div className="pt-2 space-y-2">
                        <p className="text-gray-700">{quote.text}</p>
                        <div className="text-sm text-gray-500">
                          <strong>Why this quote is relevant:</strong> {quote.relevance}
                        </div>
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 h-auto text-blue-600"
                          onClick={() => {
                            window.location.href = `/video/${quote.interviewId}?t=${quote.timestamp}`;
                          }}
                        >
                          View in video →
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
} 