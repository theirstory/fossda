"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Markdown from 'marked-react';
import { videoData, VideoId } from "@/data/videos";

interface Quote {
  text: string;
  interviewId: VideoId;
  title: string;
  timestamp: number;
  speaker: string;
  relevance: string;
}

interface QuoteGroups {
  cited: Quote[];
  uncited: Quote[];
}

// Function to save state to localStorage
const saveState = (question: string, answer: string, quotes: QuoteGroups) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('lastQuestion', question);
    localStorage.setItem('lastAnswer', answer);
    localStorage.setItem('lastQuotes', JSON.stringify(quotes));
  }
};

// Function to load state from localStorage
const loadState = () => {
  if (typeof window !== 'undefined') {
    return {
      question: localStorage.getItem('lastQuestion') || '',
      answer: localStorage.getItem('lastAnswer') || '',
      quotes: JSON.parse(localStorage.getItem('lastQuotes') || '{"cited":[],"uncited":[]}'),
    };
  }
  return { question: '', answer: '', quotes: { cited: [], uncited: [] } };
};

export default function AskPage() {
  const searchParams = useSearchParams();
  const initialState = loadState();
  const [question, setQuestion] = useState(searchParams.get('q') || initialState.question);
  const [displayedQuestion, setDisplayedQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamedAnswer, setStreamedAnswer] = useState(initialState.answer);
  const [quotes, setQuotes] = useState<QuoteGroups>(initialState.quotes);
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastProcessedTimestamp = useRef<string | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
    transform?: string;
    marginLeft?: string;
  }>({
    top: '50%',
    left: '100%',
    transform: 'translateY(-50%)',
    marginLeft: '0.5rem'
  });

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement> | null, overrideQuestion?: string) => {
    if (e) e.preventDefault();
    const queryQuestion = overrideQuestion || question;
    if (!queryQuestion.trim() || isLoading) return;

    // Clear all states before starting a new query
    setStreamedAnswer('');
    setQuotes({ cited: [], uncited: [] });
    setDisplayedQuestion(queryQuestion);
    setError(null);
    setIsLoading(true);
    setIsStreaming(true);

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: queryQuestion }),
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

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Failed to get response stream');

      const decoder = new TextDecoder();
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          // Process any remaining data in the buffer
          if (buffer) {
            try {
              const data = JSON.parse(buffer);
              if (data.type === 'content') {
                setStreamedAnswer(prev => prev + data.content);
              } else if (data.type === 'quotes') {
                setQuotes(data.quotes);
              }
            } catch (e) {
              console.error('Error parsing final chunk:', e);
            }
          }
          setIsStreaming(false);
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        
        // Split on newlines, keeping any partial line in the buffer
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep the last partial line

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              if (data.type === 'content') {
                setStreamedAnswer(prev => prev + data.content);
              } else if (data.type === 'quotes') {
                setQuotes(data.quotes);
              }
            } catch (e) {
              console.error('Error parsing chunk:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, [question, isLoading]);

  useEffect(() => {
    // Focus the input on mount
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    // If there's a question in the URL, trigger the search
    const urlQuestion = searchParams.get('q');
    const timestamp = searchParams.get('t');
    
    if (urlQuestion && timestamp !== lastProcessedTimestamp.current) {
      // Update the last processed timestamp
      lastProcessedTimestamp.current = timestamp;
      
      // Cancel any existing request
      if (isStreaming) {
        setIsStreaming(false);
      }
      
      // Clear all states first
      setStreamedAnswer('');
      setQuotes({ cited: [], uncited: [] });
      setError(null);
      setIsLoading(false);
      
      // Set both question and displayedQuestion
      setQuestion(urlQuestion);
      setDisplayedQuestion(urlQuestion);
      
      // Start new request
      handleSubmit(null, urlQuestion);
    }
  }, [searchParams, handleSubmit, isStreaming]);

  useEffect(() => {
    // Save state whenever it changes
    saveState(question, streamedAnswer, quotes);
  }, [question, streamedAnswer, quotes]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  const renderQuoteCard = (quote: Quote, index: number, isCited: boolean = true) => {
    const video = videoData[quote.interviewId as VideoId];
    if (!video) return null;

    return (
      <Card key={quote.interviewId + index} className="overflow-hidden">
        <div className="flex h-32">
          {/* Thumbnail Section */}
          <Link 
            href={`/video/${quote.interviewId}?t=${Math.floor(quote.timestamp)}`}
            className="relative w-48 flex-shrink-0 group"
          >
            <Image
              src={video.thumbnail}
              alt={quote.title}
              fill
              className="object-cover"
            />
            {isCited && (
              <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                [{index + 1}]
              </div>
            )}
          </Link>
          
          {/* Content Section */}
          <div className="flex-1 p-4">
            <div className="flex flex-col justify-between h-full">
              <div>
                <Link 
                  href={`/video/${quote.interviewId}?t=${Math.floor(quote.timestamp)}`}
                  className="group"
                >
                  <h4 className="font-medium text-base mb-1 group-hover:text-blue-600 transition-colors">
                    {quote.speaker}
                  </h4>
                </Link>
                
                <div className="text-sm text-gray-600">
                  {quote.title}
                </div>
              </div>

              <div className="text-sm text-gray-700 line-clamp-2 font-serif">
                {quote.text}
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const renderAnswerWithCitations = (text: string | undefined, quotes: QuoteGroups) => {
    if (!text) return null;
    
    // Don't remove the heading anymore since we want to display it
    const paragraphs = text.split(/\n\n+/);
    
    // Keep track of used citations to ensure proper numbering
    const citationMap = new Map<string, number>();
    let nextCitationNumber = 1;

    return paragraphs.map((paragraph, paragraphIndex) => {
      // Find all citations in this paragraph to map them
      const citations = Array.from(paragraph.matchAll(/\[(\d+)\]/g));
      citations.forEach(([citation]) => {
        if (!citationMap.has(citation)) {
          citationMap.set(citation, nextCitationNumber++);
        }
      });

      // Replace each citation with a marker we can split on
      let processedParagraph = paragraph;
      citations.forEach(([citation]) => {
        const mappedNumber = citationMap.get(citation);
        const quote = quotes.cited[mappedNumber! - 1];
        if (quote) {
          processedParagraph = processedParagraph.replace(
            citation,
            `__CITATION_SPLIT_${mappedNumber}__`
          );
        }
      });

      // Split the paragraph into text and citations
      const parts = processedParagraph.split(/__CITATION_SPLIT_\d+__/);
      const renderedParts = parts.map((part, index) => {
        // If this isn't the last part, add a citation after it
        const result = [];
        if (part.trim()) {
          result.push(
            <span key={`text-${paragraphIndex}-${index}`}>
              <Markdown>{part}</Markdown>
            </span>
          );
        }
        
        if (index < parts.length - 1) {
          const citationNumber = index + 1;
          const quote = quotes.cited[citationNumber - 1];
          if (quote) {
            result.push(
              <span key={`citation-${paragraphIndex}-${index}`} className="inline">
                <span
                  className="relative group"
                  onMouseEnter={(e) => handleMouseEnter(e)}
                >
                  <Link
                    href={`/video/${quote.interviewId}?t=${Math.floor(quote.timestamp)}`}
                    className="inline-block"
                  >
                    <span className="text-blue-600 hover:text-blue-800 cursor-pointer font-medium">
                      [{citationNumber}]
                    </span>
                  </Link>
                  
                  {/* Citation Hover Card */}
                  <div 
                    className="absolute hidden group-hover:block w-96 z-50"
                    style={popoverPosition}
                  >
                    <Card className="hover-card overflow-hidden shadow-lg">
                      <Link 
                        href={`/video/${quote.interviewId}?t=${Math.floor(quote.timestamp)}`}
                        className="block relative w-full h-48 group"
                      >
                        <Image
                          src={videoData[quote.interviewId].thumbnail}
                          alt={quote.title}
                          width={640}
                          height={360}
                          className="w-full h-full object-cover transition-opacity group-hover:opacity-90"
                        />
                      </Link>
                      <div className="p-4">
                        <h4 className="font-medium text-base mb-1">{quote.speaker}</h4>
                        <div className="text-sm text-gray-600 mb-2">{quote.title}</div>
                        <p className="text-sm text-gray-700 font-serif">{quote.text}</p>
                      </div>
                    </Card>
                  </div>
                </span>
              </span>
            );
          }
        }
        
        return result;
      });

      // Wrap each paragraph in a div with margin
      return (
        <div key={`p-${paragraphIndex}`} className="mb-4">
          {renderedParts.flat()}
        </div>
      );
    });
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
    const citation = e.currentTarget;
    const citationRect = citation.getBoundingClientRect();
    const card = citation.querySelector('.hover-card') as HTMLElement;
    if (!card) return;

    // Calculate available space
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const cardWidth = 384; // w-96 = 24rem = 384px
    const cardHeight = card.offsetHeight || 400; // Estimate height if not rendered

    // Calculate space available on each side
    const spaceRight = viewportWidth - citationRect.right;
    const spaceLeft = citationRect.left;
    const spaceAbove = citationRect.top;
    const spaceBelow = viewportHeight - citationRect.bottom;

    let newPosition = {};

    // Try to position to the right first
    if (spaceRight >= cardWidth) {
      // Enough space on the right
      newPosition = {
        left: '100%',
        right: 'auto',
        marginLeft: '0.5rem',
        marginRight: '0'
      };
    } else if (spaceLeft >= cardWidth) {
      // Try the left side
      newPosition = {
        right: '100%',
        left: 'auto',
        marginRight: '0.5rem',
        marginLeft: '0'
      };
    } else {
      // Not enough horizontal space, try above or below
      if (spaceAbove > spaceBelow) {
        newPosition = {
          bottom: '100%',
          top: 'auto',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '0.5rem',
          marginLeft: '0'
        };
      } else {
        newPosition = {
          top: '100%',
          bottom: 'auto',
          left: '50%',
          transform: 'translateX(-50%)',
          marginTop: '0.5rem',
          marginLeft: '0'
        };
      }
    }

    // Vertical centering for left/right positions
    if (newPosition.hasOwnProperty('left') && !newPosition.hasOwnProperty('top') && !newPosition.hasOwnProperty('bottom')) {
      const idealTop = citationRect.top + (citationRect.height / 2) - (cardHeight / 2);
      
      if (idealTop < 0) {
        // Too high, align to top
        newPosition = {
          ...newPosition,
          top: '0',
          transform: 'none'
        };
      } else if (idealTop + cardHeight > viewportHeight) {
        // Too low, align to bottom
        newPosition = {
          ...newPosition,
          bottom: '0',
          transform: 'none'
        };
      } else {
        // Center vertically
        newPosition = {
          ...newPosition,
          top: '50%',
          transform: 'translateY(-50%)'
        };
      }
    }

    setPopoverPosition(newPosition);
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
      <Card className="max-w-2xl mx-auto p-4 mb-8">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <Input
            ref={inputRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about open source..."
            className="flex-1 h-10"
          />
          <Button 
            type="submit" 
            disabled={isLoading || !question.trim()}
          >
            {isLoading ? 'Searching...' : 'Ask'}
          </Button>
        </form>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="max-w-4xl mx-auto p-6 mb-8 border-red-200 bg-red-50">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      {/* Answer Section */}
      {(streamedAnswer || quotes.cited.length > 0 || quotes.uncited.length > 0) && (
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Answer Column */}
          <Card className="p-6 h-fit">
            <div className={`prose prose-lg max-w-none transition-opacity duration-200 ${isStreaming ? 'opacity-90' : 'opacity-100'}`}>
              <h1 className="text-2xl font-bold mb-4">{displayedQuestion}</h1>
              <div className="font-serif leading-relaxed">
                {renderAnswerWithCitations(streamedAnswer, quotes)}
              </div>
            </div>
          </Card>

          {/* Quotes Column */}
          <div className={`space-y-6 transition-opacity duration-200 ${isStreaming ? 'opacity-80' : 'opacity-100'}`}>
            {/* Supporting Quotes */}
            {quotes.cited.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold px-2">Supporting Quotes</h3>
                <div className="space-y-4">
                  {quotes.cited.map((quote, index) => renderQuoteCard(quote, index))}
                </div>
              </div>
            )}

            {/* Additional Quotes */}
            {quotes.uncited.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold px-2">Additional Quotes</h3>
                <div className="space-y-4">
                  {quotes.uncited.map((quote, index) => renderQuoteCard(quote, index, false))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 