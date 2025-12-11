"use client";

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// import { useSearchParams } from 'next/navigation'; // Reserved for future use
import Image from 'next/image';
import Link from 'next/link';
import Markdown from 'marked-react';
import { marked } from 'marked';
import { videoData, VideoId } from "@/data/videos";
import { askElysiaStream, checkElysiaHealth, formatElysiaResponse, ElysiaObject } from '@/lib/elysia';
import { Send, Loader2 } from 'lucide-react';

// ElysiaObject is imported from '@/lib/elysia'

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  objects?: ElysiaObject[];
  timestamp: Date;
}

export default function AskFormElysia() {
  // const searchParams = useSearchParams(); // Reserved for future use
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingSeconds, setThinkingSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [elysiaStatus, setElysiaStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
  const [useLLMFormatting] = useState(true); // Enable LLM formatting by default
  const [isFormatting, setIsFormatting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
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

  // Check Elysia health on mount
  useEffect(() => {
    checkElysiaHealth().then((health) => {
      if (health.status === 'ok' && health.elysia_initialized) {
        setElysiaStatus('available');
      } else {
        setElysiaStatus('unavailable');
        setError('Elysia API server is not available. Please start it with: npm run elysia:server');
      }
    }).catch(() => {
      setElysiaStatus('unavailable');
      setError('Elysia API server is not available. Please start it with: npm run elysia:server');
    });
  }, []);

  // Load messages from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMessages = localStorage.getItem('elysiaMessages');
      if (savedMessages) {
        try {
          const parsed = JSON.parse(savedMessages);
          setMessages(parsed.map((msg: Message & { timestamp: string }) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })));
        } catch (e) {
          console.error('Error loading messages:', e);
        }
      }
    }
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      localStorage.setItem('elysiaMessages', JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Counter for thinking time and progressive status messages
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isLoading || isFormatting) {
      setThinkingSeconds(0);
      interval = setInterval(() => {
        setThinkingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setThinkingSeconds(0);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isLoading, isFormatting]);


  // Get progressive status message based on elapsed time
  const getStatusMessage = (seconds: number): string => {
    if (seconds < 5) {
      return "Analyzing your question...";
    } else if (seconds < 15) {
      return "Querying the archive...";
    } else if (seconds < 30) {
      return "Retrieving relevant excerpts...";
    } else if (seconds < 45) {
      return "Synthesizing insights...";
    } else if (seconds < 60) {
      return "Refining the response...";
    } else {
      return "Almost there, finalizing...";
    }
  };

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Convert Elysia objects to quote format
  const convertToQuotes = (objects: ElysiaObject[]) => {
    return objects.map((obj) => {
      const videoTitle = obj.interviewTitle || videoData[obj.interviewId as VideoId]?.title || 'Unknown Speaker';
      const speaker = videoTitle.split(' - ')[0];
      
      return {
        text: obj.text || '',
        interviewId: (obj.interviewId as VideoId) || '',
        title: obj.chapterTitle || '',
        timestamp: obj.timestamp || 0,
        speaker,
        thumbnail: obj.thumbnail || videoData[obj.interviewId as VideoId]?.thumbnail || '',
      };
    }).filter(quote => quote.text && quote.interviewId);
  };

  // Extract citations from text and match to objects
  const extractCitations = (text: string, objects: ElysiaObject[]) => {
    const quotes = convertToQuotes(objects);
    if (quotes.length === 0) return { text, citations: [], allQuotes: [] };

    // Try to find citations in format [1], [2], etc.
    const citationPattern = /\[(\d+)\]/g;
    const citations: Array<{ index: number; position: number; quote: typeof quotes[0] }> = [];
    let match;

    while ((match = citationPattern.exec(text)) !== null) {
      const citationNum = parseInt(match[1]);
      const quoteIndex = citationNum - 1;
      if (quoteIndex >= 0 && quoteIndex < quotes.length) {
        citations.push({
          index: citationNum,
          position: match.index,
          quote: quotes[quoteIndex]
        });
      }
    }

    // Get cited quote indices
    const citedIndices = new Set(citations.map(c => c.index - 1));
    
    // Separate cited and uncited quotes
    const citedQuotes = quotes.filter((_, idx) => citedIndices.has(idx));
    const uncitedQuotes = quotes.filter((_, idx) => !citedIndices.has(idx));

    return { 
      text, 
      citations: citations.sort((a, b) => a.position - b.position),
      allQuotes: quotes,
      citedQuotes,
      uncitedQuotes
    };
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading || elysiaStatus !== 'available') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    const question = input.trim();
    setInput('');
    setError(null);
    setIsLoading(true);

    // Create assistant message placeholder for streaming
    const assistantMessageId = `assistant-${Date.now()}`;
    
    // Add both user and assistant messages in a single update to prevent duplicates
    setMessages(prev => {
      // Check if there's already an empty assistant message at the end (prevent duplicates)
      const lastMessage = prev[prev.length - 1];
      if (lastMessage && lastMessage.role === 'assistant' && !lastMessage.content) {
        // Remove the empty assistant message if it exists
        return [...prev.slice(0, -1), userMessage, {
          id: assistantMessageId,
          role: 'assistant' as const,
          content: '',
          objects: [],
          timestamp: new Date()
        }];
      }
      
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        objects: [],
        timestamp: new Date()
      };
      return [...prev, userMessage, assistantMessage];
    });

    try {
      let accumulatedContent = '';
      let accumulatedObjects: ElysiaObject[] = [];
      let finalResponseReceived = false;

      await askElysiaStream(question, ['Transcript'], (data) => {
        if (data.type === 'status' && data.message) {
          // Update status message (could show in UI if desired)
          console.log('Status:', data.message);
        } else if (data.type === 'content' && data.content) {
          // Only accumulate if we haven't received final response yet
          if (!finalResponseReceived) {
            accumulatedContent += data.content;
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMessageId 
                ? { ...msg, content: accumulatedContent }
                : msg
            ));
          }
        } else if (data.type === 'objects' && data.count !== undefined) {
          // Track object count
          console.log('Objects found:', data.count);
        } else if (data.type === 'response') {
          // Final response received - use this as the definitive content
          // Only update if we haven't already set this content
          if (!finalResponseReceived) {
            finalResponseReceived = true;
            const rawContent = data.response || accumulatedContent;
            accumulatedObjects = data.objects || [];
            
            // If LLM formatting is enabled, format the response asynchronously
            if (useLLMFormatting && rawContent) {
              setIsFormatting(true);
              setIsLoading(false); // Elysia streaming is done, now formatting
              
              // Format asynchronously (can't use await in callback)
              formatElysiaResponse(rawContent, question, (formattedContent) => {
                // Update message with formatted content as it streams
                setMessages(prev => prev.map(msg => {
                  if (msg.id === assistantMessageId) {
                    return { 
                      ...msg, 
                      content: formattedContent,
                      objects: accumulatedObjects
                    };
                  }
                  return msg;
                }));
              }).then(() => {
                setIsFormatting(false);
              }).catch((formatError) => {
                console.error('Formatting error:', formatError);
                setIsFormatting(false);
                // Fall back to raw content if formatting fails
                setMessages(prev => prev.map(msg => {
                  if (msg.id === assistantMessageId) {
                    return { 
                      ...msg, 
                      content: rawContent,
                      objects: accumulatedObjects
                    };
                  }
                  return msg;
                }));
              });
            } else {
              // Use raw content without formatting
              setMessages(prev => prev.map(msg => {
                if (msg.id === assistantMessageId) {
                  // Check if content is different to avoid unnecessary updates
                  if (msg.content !== rawContent || JSON.stringify(msg.objects) !== JSON.stringify(accumulatedObjects)) {
                    return { 
                      ...msg, 
                      content: rawContent,
                      objects: accumulatedObjects
                    };
                  }
                }
                return msg;
              }));
            }
          }
        } else if (data.type === 'error') {
          throw new Error(data.error || 'Unknown error');
        } else if (data.type === 'done') {
          // Streaming complete - wait for formatting to finish if in progress
          if (!isFormatting) {
            setIsLoading(false);
          }
        }
      });
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setIsLoading(false);
      setIsFormatting(false);
      
      // Remove the assistant message if there was an error
      setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  // Configure marked for better markdown rendering
  useEffect(() => {
    marked.setOptions({
      breaks: true,
      gfm: true,
    });
  }, []);

  // Format Elysia responses to be more readable with proper markdown (fallback when LLM formatting is disabled)
  const formatElysiaResponseLegacy = (text: string): string => {
    if (!text) return text;
    
    // If text already has markdown formatting (headers, lists), return as-is
    if (text.includes('##') || text.includes('###') || text.includes('- ') || text.includes('* ') || text.match(/^\d+\.\s/m)) {
      return text;
    }
    
    // Split into sentences first to better understand structure
    const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 10);
    
    // Group sentences into logical paragraphs
    const paragraphs: string[] = [];
    let currentPara: string[] = [];
    
    for (const sentence of sentences) {
      // Start new paragraph for certain patterns
      if (/^(For example|Similarly|Moreover|Furthermore|Additionally|Specifically|In particular|Notably|The archive|This archive|Among|From)/i.test(sentence)) {
        if (currentPara.length > 0) {
          paragraphs.push(currentPara.join(' '));
          currentPara = [];
        }
      }
      currentPara.push(sentence);
      
      // End paragraph after 3-4 sentences or if sentence ends with certain patterns
      if (currentPara.length >= 3 || /(demonstrates|reflects|shows|reveals|exemplifies|illustrates)\.$/i.test(sentence)) {
        paragraphs.push(currentPara.join(' '));
        currentPara = [];
      }
    }
    if (currentPara.length > 0) {
      paragraphs.push(currentPara.join(' '));
    }
    
    // Format each paragraph
    const formatted: string[] = [];
    
    for (let i = 0; i < paragraphs.length; i++) {
      const para = paragraphs[i].trim();
      if (para.length < 30) continue;
      
      // Check for person/story introductions - make them headers
      const personMatch = para.match(/^(Jon "Maddog" Hall|Larry Augustin|Lawrence Rosen|Richard Stallman|Maddog)(\s+(recalls|recounts|describes|reflects|details|explains))?/i);
      if (personMatch) {
        const personName = personMatch[0];
        const rest = para.substring(personName.length).trim();
        formatted.push(`\n## ${personName}\n\n${rest}\n`);
        continue;
      }
      
      // Check for "For example" - make it a subheading
      if (/^For example/i.test(para)) {
        formatted.push(`\n### ${para}\n`);
        continue;
      }
      
      // Check for lists (contains "such as" or "including")
      if (para.includes('such as') || para.includes('including')) {
        const listMatch = para.match(/^(.+?)(?:such as|including):\s*(.+)$/i);
        if (listMatch) {
          const intro = listMatch[1].trim();
          const items = listMatch[2]
            .split(/(?:,\s*and\s+|\s+and\s+)/)
            .map(item => item.replace(/^[,\s]+|[,\s]+$/g, '').trim())
            .filter(item => item.length > 0);
          
          if (items.length > 1) {
            formatted.push(`\n${intro}:\n\n`);
            items.forEach(item => {
              formatted.push(`- ${item}\n`);
            });
            formatted.push('');
            continue;
          }
        }
      }
      
      // Regular paragraph - add emphasis to key terms
      const formattedPara = para
        // Bold important technical terms
        .replace(/\b(open source|Linux|software|technology|development|programming|computing|hardware|software)\b/gi, '**$1**')
        // Italicize descriptive/qualifying terms
        .replace(/\b(unique|exclusive|rare|distinctive|firsthand|personal|historical|significant|important)\b/gi, '*$1*')
        // Bold project/company names
        .replace(/\b(Red Flag Linux|Nova Linux|SourceForge|DARPA|ARPANET|Free Software Foundation|Open Source Initiative|OSI)\b/gi, '**$1**');
      
      formatted.push(formattedPara + '\n\n');
    }
    
    return formatted.join('');
  };

  const renderMessageWithCitations = (message: Message) => {
    if (message.role === 'user') {
      // Allow markdown in user messages too
      return (
        <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:mt-0 prose-p:my-2">
          <Markdown>{message.content}</Markdown>
        </div>
      );
    }

    // Format the text first to improve readability
    // If LLM formatting is enabled, the content is already formatted; otherwise use legacy formatting
    const formattedText = message.content && !useLLMFormatting 
      ? formatElysiaResponseLegacy(message.content) 
      : message.content;
    const { text, citations, uncitedQuotes } = extractCitations(formattedText, message.objects || []);

    // Render text with citations
    let renderedText: React.ReactNode[] = [];
    
    if (citations.length === 0) {
      // No citations found, just render markdown
      renderedText.push(
        <Markdown key="content">{text}</Markdown>
      );
    } else {
      // Split text by citations and render with links
      const parts: Array<{ text: string; citation?: typeof citations[0] }> = [];
      let lastIndex = 0;

      citations.forEach((citation) => {
        const pattern = new RegExp(`\\[${citation.index}\\]`, 'g');
        const match = pattern.exec(text);
        
        if (match) {
          // Add text before citation
          if (match.index > lastIndex) {
            parts.push({ text: text.substring(lastIndex, match.index) });
          }
          // Add citation
          parts.push({ text: '', citation });
          lastIndex = match.index + match[0].length;
        }
      });

      // Add remaining text
      if (lastIndex < text.length) {
        parts.push({ text: text.substring(lastIndex) });
      }

      renderedText = parts.map((part, index) => (
        <span key={index}>
          {part.citation ? (
            <span 
              className="relative group inline-block"
              onMouseEnter={handleMouseEnter}
            >
              <Link
                href={`/video/${part.citation.quote.interviewId}?t=${Math.floor(part.citation.quote.timestamp)}`}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer font-medium underline decoration-2 underline-offset-2"
              >
                [{part.citation.index}]
              </Link>
              
              {/* Citation Hover Card */}
              <div 
                className="absolute hidden group-hover:block w-96 z-50"
                style={popoverPosition}
              >
                <Card className="hover-card overflow-hidden shadow-lg bg-white dark:bg-gray-800">
                  <Link 
                    href={`/video/${part.citation.quote.interviewId}?t=${Math.floor(part.citation.quote.timestamp)}`}
                    className="block relative w-full h-48 group"
                  >
                    <Image
                      src={videoData[part.citation.quote.interviewId].thumbnail}
                      alt={part.citation.quote.title}
                      width={640}
                      height={360}
                      className="w-full h-full object-cover transition-opacity group-hover:opacity-90"
                    />
                  </Link>
                  <div className="p-4">
                    <h4 className="font-medium text-base mb-1">{part.citation.quote.speaker}</h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{part.citation.quote.title}</div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-serif">{part.citation.quote.text}</p>
                  </div>
                </Card>
              </div>
            </span>
          ) : (
            <Markdown>{part.text}</Markdown>
          )}
        </span>
      ));
    }

    return (
      <div className="space-y-4">
        <div className="prose prose-lg max-w-none dark:prose-invert
          prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-headings:scroll-mt-20
          prose-h1:text-3xl prose-h1:mt-0 prose-h1:mb-6 prose-h1:font-bold prose-h1:leading-tight
          prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:font-semibold prose-h2:leading-tight prose-h2:border-b prose-h2:border-gray-200 dark:prose-h2:border-gray-700 prose-h2:pb-2
          prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-h3:font-semibold prose-h3:leading-snug
          prose-h4:text-lg prose-h4:mt-5 prose-h4:mb-2 prose-h4:font-medium
          prose-p:my-4 prose-p:leading-8 prose-p:text-gray-800 dark:prose-p:text-gray-200 prose-p:text-base
          prose-ul:my-5 prose-ul:pl-6 prose-ul:space-y-3 prose-ul:list-disc
          prose-ol:my-5 prose-ol:pl-6 prose-ol:space-y-3 prose-ol:list-decimal
          prose-li:my-2 prose-li:leading-7 prose-li:text-gray-800 dark:prose-li:text-gray-200 prose-li:pl-2
          prose-strong:font-bold prose-strong:text-gray-900 dark:prose-strong:text-gray-100
          prose-em:italic prose-em:text-gray-700 dark:prose-em:text-gray-300
          prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:before:content-[''] prose-code:after:content-['']
          prose-pre:my-5 prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-gray-700 prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto
          prose-pre code:bg-transparent prose-pre code:p-0 prose-pre code:text-sm
          prose-blockquote:border-l-4 prose-blockquote:border-blue-500 dark:prose-blockquote:border-blue-400 prose-blockquote:pl-5 prose-blockquote:pr-4 prose-blockquote:italic prose-blockquote:my-5 prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20
          prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-a:font-medium
          prose-hr:my-8 prose-hr:border-gray-300 dark:prose-hr:border-gray-600
          prose-table:my-5 prose-table:w-full prose-table:border-collapse
          prose-th:border prose-th:border-gray-300 dark:prose-th:border-gray-600 prose-th:bg-gray-50 dark:prose-th:bg-gray-800 prose-th:px-4 prose-th:py-3 prose-th:text-left prose-th:font-semibold
          prose-td:border prose-td:border-gray-300 dark:prose-td:border-gray-600 prose-td:px-4 prose-td:py-3">
          {renderedText}
        </div>
        
        {/* Show uncited quotes as sources if any */}
        {uncitedQuotes && uncitedQuotes.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Additional Sources:</p>
            <div className="space-y-2">
              {uncitedQuotes.slice(0, 3).map((quote, idx) => (
                <Link
                  key={idx}
                  href={`/video/${quote.interviewId}?t=${Math.floor(quote.timestamp)}`}
                  className="block text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                >
                  {quote.speaker} - {quote.title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
    const citation = e.currentTarget;
    const citationRect = citation.getBoundingClientRect();
    const card = citation.querySelector('.hover-card') as HTMLElement;
    if (!card) return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const cardWidth = 384;
    const cardHeight = card.offsetHeight || 400;

    const spaceRight = viewportWidth - citationRect.right;
    const spaceLeft = citationRect.left;
    const spaceAbove = citationRect.top;
    const spaceBelow = viewportHeight - citationRect.bottom;

    let newPosition = {};

    if (spaceRight >= cardWidth) {
      newPosition = {
        left: '100%',
        right: 'auto',
        marginLeft: '0.5rem',
        marginRight: '0'
      };
    } else if (spaceLeft >= cardWidth) {
      newPosition = {
        right: '100%',
        left: 'auto',
        marginRight: '0.5rem',
        marginLeft: '0'
      };
    } else {
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

    if (newPosition.hasOwnProperty('left') && !newPosition.hasOwnProperty('top') && !newPosition.hasOwnProperty('bottom')) {
      const idealTop = citationRect.top + (citationRect.height / 2) - (cardHeight / 2);
      
      if (idealTop < 0) {
        newPosition = { ...newPosition, top: '0', transform: 'none' };
      } else if (idealTop + cardHeight > viewportHeight) {
        newPosition = { ...newPosition, bottom: '0', transform: 'none' };
      } else {
        newPosition = { ...newPosition, top: '50%', transform: 'translateY(-50%)' };
      }
    }

    setPopoverPosition(newPosition);
  };

  const clearChat = () => {
    setMessages([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('elysiaMessages');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto bg-white dark:bg-gray-900">
      {/* Header - only show when there are messages */}
      {messages.length > 0 && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h1 className="text-xl font-semibold">Ask the Archive (Elysia)</h1>
            {elysiaStatus === 'available' && (
              <p className="text-xs text-green-600 dark:text-green-400">✅ Connected</p>
            )}
            {elysiaStatus === 'unavailable' && (
              <p className="text-xs text-red-500 dark:text-red-400">⚠️ Elysia server not running</p>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={clearChat}>
            Clear Chat
          </Button>
        </div>
      )}

      {/* Messages or Empty State */}
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center px-4 pt-32">
          <div className="text-center w-full max-w-2xl mb-6">
            <h2 className="text-2xl font-semibold mb-3 dark:text-gray-100">What&apos;s on your mind today?</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Ask questions about open source interviews using Elysia&apos;s agentic framework.
            </p>
          </div>
          
          {/* Input positioned where the text was */}
          <div className="w-full max-w-2xl">
            <form onSubmit={handleSubmit} className="relative">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                className="w-full pr-12 py-6 text-base rounded-2xl border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-700"
                disabled={elysiaStatus !== 'available' || isLoading}
              />
              <Button 
                type="submit" 
                disabled={!input.trim() || elysiaStatus !== 'available' || isLoading}
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : (
                  <Send className="w-5 h-5 text-white" />
                )}
              </Button>
            </form>
            {elysiaStatus === 'available' && (
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                Elysia can make mistakes. Check important info.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {messages.map((message) => {
            // Don't render empty assistant messages when loading (they'll be shown as loading indicator)
            if (message.role === 'assistant' && !message.content && isLoading) {
              return null;
            }
            
            return (
              <div
                key={message.id}
                className={`flex gap-4 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 dark:text-blue-400 text-sm font-bold">AI</span>
                  </div>
                )}
                
                <div
                  className={`max-w-[85%] rounded-2xl p-4 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-gray-100 dark:bg-gray-800 rounded-bl-sm'
                  }`}
                >
                  {renderMessageWithCitations(message)}
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-700 dark:text-gray-300 text-sm font-bold">You</span>
                  </div>
                )}
              </div>
            );
          })}

          {(isLoading || isFormatting) && (() => {
            // Only show loading indicator if the last message is an empty assistant message or we're formatting
            const lastMessage = messages[messages.length - 1];
            const shouldShowLoading = !lastMessage || 
              (lastMessage.role === 'assistant' && !lastMessage.content) ||
              isFormatting;
            
            if (!shouldShowLoading) return null;
            
            const statusText = isFormatting 
              ? 'Formatting response...' 
              : getStatusMessage(thinkingSeconds);
            
            return (
              <div className="flex gap-4 justify-start">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 dark:text-blue-400 text-sm font-bold">AI</span>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {statusText}
                      </span>
                    </div>
                    {!isFormatting && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex gap-1">
                          <div className={`w-1.5 h-1.5 rounded-full ${thinkingSeconds >= 0 ? 'bg-blue-500' : 'bg-gray-300'}`} />
                          <div className={`w-1.5 h-1.5 rounded-full ${thinkingSeconds >= 5 ? 'bg-blue-500' : 'bg-gray-300'}`} />
                          <div className={`w-1.5 h-1.5 rounded-full ${thinkingSeconds >= 15 ? 'bg-blue-500' : 'bg-gray-300'}`} />
                          <div className={`w-1.5 h-1.5 rounded-full ${thinkingSeconds >= 30 ? 'bg-blue-500' : 'bg-gray-300'}`} />
                          <div className={`w-1.5 h-1.5 rounded-full ${thinkingSeconds >= 45 ? 'bg-blue-500' : 'bg-gray-300'}`} />
                        </div>
                        <span>{thinkingSeconds}s</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Input - only show at bottom when there are messages */}
      {messages.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 pb-6">
          <form onSubmit={handleSubmit} className="relative">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              className="w-full pr-12 py-6 text-base rounded-2xl border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-700"
              disabled={elysiaStatus !== 'available' || isLoading}
            />
            <Button 
              type="submit" 
              disabled={!input.trim() || elysiaStatus !== 'available' || isLoading}
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              ) : (
                <Send className="w-5 h-5 text-white" />
              )}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
