"use client";

import { useEffect, useRef, useState } from 'react';
import { ChapterMetadata } from '@/types/transcript';
import { cn } from '@/lib/utils';
import { Card } from './ui/card';
import { useScripts } from "@/hooks/useScript";
import { addTimecodesToTranscript } from "@/lib/transcript";
import { MuxPlayerElement } from '@mux/mux-player-react';
import { useSearchParams } from 'next/navigation';

interface InteractiveTranscriptProps {
  transcriptHtml: string;
  chapters: ChapterMetadata[];
  videoRef: React.RefObject<MuxPlayerElement | null>;
  isPlaying: boolean;
}

const transcriptStyles = `
  .hyperaudio-lite span[data-m] {
    margin: 0 -0.25em;  /* Pull words closer together on both sides */
    padding: 0 0.25em;  /* Add padding that can be selected on both sides */
    display: inline-block;  /* Make padding selectable */
  }
`;

export default function InteractiveTranscript({
  transcriptHtml,
  chapters,
  videoRef,
  isPlaying
}: InteractiveTranscriptProps) {
  const transcriptRef = useRef<HTMLDivElement>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useScripts();
  const [processedHtml, setProcessedHtml] = useState(transcriptHtml);
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const startTime = searchParams.get('t');
  const endTime = searchParams.get('end');
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [hasScrolledToStart, setHasScrolledToStart] = useState(false);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Add effect to handle initial scroll to timestamp
  useEffect(() => {
    if (!mounted || !transcriptRef.current || !startTime) return;

    const timeMs = parseFloat(startTime) * 1000;
    const spans = Array.from(transcriptRef.current.querySelectorAll<HTMLElement>('span[data-m]'));
    
    // Find the span closest to the timestamp
    let targetSpan: HTMLElement | null = null;
    for (const span of spans) {
      const spanTime = parseInt(span.getAttribute('data-m') || '0', 10);
      if (spanTime <= timeMs) {
        targetSpan = span;
      } else {
        break;
      }
    }

    if (targetSpan && transcriptContainerRef.current) {
      // Remove any existing highlights
      spans.forEach(span => span.classList.remove('bg-yellow-100'));
      
      // Scroll the span into view
      targetSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Set scroll complete after a short delay
      setTimeout(() => {
        setHasScrolledToStart(true);
      }, 100);
    }
  }, [mounted, startTime]);

  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      setProcessedHtml(addTimecodesToTranscript(transcriptHtml, chapters));
    }
  }, [transcriptHtml, chapters, mounted]);

  // Initialize HyperaudioLite
  useEffect(() => {
    if (!scriptLoaded || !mounted || !transcriptRef.current) {
      return undefined;
    }

    // Wait for player to be ready
    const player = document.getElementById('hyperplayer') as HTMLVideoElement;
    if (!player) {
      return undefined;
    }

    const setupClickHandlers = () => {
      const spans = Array.from(transcriptRef.current?.querySelectorAll('span[data-m]') || []);
      spans.forEach(span => {
        span.addEventListener('click', () => {
          const time = parseInt(span.getAttribute('data-m') || '0', 10) / 1000;
          const videoElement = document.getElementById('hyperplayer');
          if (videoElement && 'currentTime' in videoElement) {
            (videoElement as HTMLVideoElement).currentTime = time;
            if (isPlaying) {
              (videoElement as HTMLVideoElement).play();
            }
            span.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        });
      });
    };

    // Create a MutationObserver to watch for player initialization
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-media-status') {
          const status = player.getAttribute('data-media-status');
          if (status === 'ready') {
            if (typeof HyperaudioLite === 'function') {
              new HyperaudioLite(
                "hypertranscript",
                "hyperplayer",
                false,
                true,
                false,
                false,
                false
              );
              setupClickHandlers();
            }
            observer.disconnect();
          }
        }
      });
    });

    observer.observe(player, { attributes: true });

    // Set up initial click handlers
    setupClickHandlers();

    return () => {
      observer.disconnect();
    };
  }, [scriptLoaded, mounted, isPlaying]);

  // Add timeupdate listener to scroll transcript
  useEffect(() => {
    const videoElement = document.getElementById('hyperplayer') as HTMLVideoElement;
    if (!videoElement || !transcriptRef.current || !transcriptContainerRef.current) {
      return undefined;
    }

    const handleTimeUpdate = () => {
      const currentTime = videoElement.currentTime * 1000; // Convert to ms
      const spans = Array.from(transcriptRef.current?.querySelectorAll('span[data-m]') || []);
      
      // Find the current or next span
      let currentSpan: Element | null = null;
      for (const span of spans) {
        const spanTime = parseInt(span.getAttribute('data-m') || '0', 10);
        if (spanTime <= currentTime) {
          currentSpan = span;
        } else {
          break;
        }
      }
      
      if (currentSpan && transcriptContainerRef.current) {
        const container = transcriptContainerRef.current;
        const containerRect = container.getBoundingClientRect();
        const spanRect = (currentSpan as HTMLElement).getBoundingClientRect();
        
        // Calculate the ideal position (2/3 from the top)
        const targetPosition = containerRect.height * 0.33;
        const currentOffset = spanRect.top - containerRect.top;
        const scrollAdjustment = currentOffset - targetPosition;
        
        // Smooth scroll to position
        container.scrollTo({
          top: container.scrollTop + scrollAdjustment,
          behavior: 'smooth'
        });

        // Highlight current span
        spans.forEach(span => span.classList.remove('bg-yellow-100'));
        if (currentSpan) {
          currentSpan.classList.add('bg-yellow-100');
        }
      }
    };

    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('seeking', handleTimeUpdate);
    
    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('seeking', handleTimeUpdate);
    };
  }, [mounted]);

  // Add effect to update current chapter based on video time
  useEffect(() => {
    const findVideoElement = () => document.getElementById('hyperplayer') as HTMLVideoElement;
    let mediaElement = findVideoElement();
    
    const handleTimeChange = () => {
      // Get the current video element (it might have changed)
      mediaElement = findVideoElement();
      if (!mediaElement) return;

      const currentTime = mediaElement.currentTime;
      
      // Debug log to track updates
      console.log('Time change:', {
        currentTime,
        readyState: mediaElement.readyState,
        status: mediaElement.getAttribute('data-media-status')
      });
      
      // Find the current chapter based on time
      const newChapterIndex = chapters.findIndex((chapter, index) => {
        const nextChapter = chapters[index + 1];
        const chapterEnd = nextChapter ? nextChapter.time.start : Infinity;
        return currentTime >= chapter.time.start && currentTime < chapterEnd;
      });

      // If we're before the first chapter, select the first chapter
      if (newChapterIndex === -1 && currentTime < chapters[0].time.start) {
        setCurrentChapterIndex(0);
        return;
      }
      
      // If we're after the last chapter, select the last chapter
      if (newChapterIndex === -1 && currentTime >= chapters[chapters.length - 1].time.start) {
        setCurrentChapterIndex(chapters.length - 1);
        return;
      }

      if (newChapterIndex !== -1) {
        setCurrentChapterIndex(newChapterIndex);
      }
    };

    // Create a MutationObserver to watch for player initialization/changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-media-status') {
          const status = mediaElement?.getAttribute('data-media-status');
          if (status === 'ready') {
            console.log('Video ready, setting up time tracking');
            handleTimeChange();
          }
        }
      });
    });

    const setupEventListeners = () => {
      if (!mediaElement) return;
      
      // Remove any existing listeners first
      const events = ['timeupdate', 'seeking', 'seeked', 'loadedmetadata', 'play'];
      events.forEach(event => {
        mediaElement.removeEventListener(event, handleTimeChange);
        mediaElement.addEventListener(event, handleTimeChange);
      });
      
      // Observe changes to the video element
      observer.observe(mediaElement, { attributes: true });
      
      // Initial check
      handleTimeChange();
    };

    // Set up initial listeners
    setupEventListeners();

    // Check periodically for video element and reset listeners if needed
    const checkInterval = setInterval(() => {
      const currentElement = findVideoElement();
      if (currentElement && currentElement !== mediaElement) {
        mediaElement = currentElement;
        setupEventListeners();
      }
    }, 1000);

    return () => {
      observer.disconnect();
      clearInterval(checkInterval);
      if (mediaElement) {
        const events = ['timeupdate', 'seeking', 'seeked', 'loadedmetadata', 'play'];
        events.forEach(event => mediaElement.removeEventListener(event, handleTimeChange));
      }
    };
  }, [chapters]); // Remove currentChapterIndex from dependencies

  // Handle chapter navigation
  const handleChapterClick = (time: number) => {
    if (videoRef.current) {
      // Set time directly on the video element
      const videoElement = document.getElementById('hyperplayer') as HTMLVideoElement;
      if (videoElement) {
        videoElement.currentTime = time;
        if (isPlaying) {
          videoElement.play();
        }
      }
    }
  };

  // Initialize click handlers
  useEffect(() => {
    if (!mounted || !transcriptRef.current || !videoRef.current) {
      return undefined;
    }

    const handleSpanClick = (span: HTMLElement) => {
      const time = parseInt(span.getAttribute('data-m') || '0', 10) / 1000;
      if (videoRef.current) {
        videoRef.current.currentTime = time;
        if (isPlaying) {
          videoRef.current.play().catch(console.error);
        }
        span.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    const spans = Array.from(transcriptRef.current.querySelectorAll<HTMLElement>('span[data-m]'));
    spans.forEach(span => {
      span.addEventListener('click', () => handleSpanClick(span));
    });

    return () => {
      spans.forEach(span => {
        span.removeEventListener('click', () => handleSpanClick(span));
      });
    };
  }, [mounted, isPlaying, videoRef]);

  // Update the custom text selection effect to use Selection API
  useEffect(() => {
    if (!transcriptRef.current) return;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#hypertranscript')) return;
      
      // Don't prevent default - let browser handle text selection
      setIsSelecting(true);
      setSelectionStart(e.clientY);
      setSelectionEnd(e.clientY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isSelecting) return;
      setSelectionEnd(e.clientY);
    };

    const handleMouseUp = () => {
      setIsSelecting(false);
      // Get the selection after mouse up
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        console.log('Selection range:', {
          startOffset: range.startOffset,
          endOffset: range.endOffset,
          text: range.toString()
        });
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isSelecting]);

  // Replace the URL parameters effect with this new version
  useEffect(() => {
    if (!mounted || !transcriptRef.current || !startTime || !endTime || !hasScrolledToStart) return;

    const transcriptElement = transcriptRef.current;
    const startTimeMs = parseFloat(startTime) * 1000;
    const endTimeMs = parseFloat(endTime) * 1000;
    const spans = Array.from(transcriptElement.querySelectorAll<HTMLElement>('span[data-m]'));
    
    // Clear any existing highlights and selection
    spans.forEach(span => {
      span.classList.remove('bg-yellow-100');
      span.style.backgroundColor = '';
    });
    window.getSelection()?.removeAllRanges();
    
    let firstSpan: HTMLElement | null = null;
    let lastSpan: HTMLElement | null = null;
    
    spans.forEach(span => {
      const spanTime = parseInt(span.getAttribute('data-m') || '0', 10);
      if (spanTime >= startTimeMs && spanTime < endTimeMs) {
        if (!firstSpan) {
          firstSpan = span;
        }
        lastSpan = span;
      }
    });

    if (firstSpan && lastSpan) {
      // Create a new range
      const range = document.createRange();
      range.setStartBefore(firstSpan);
      range.setEndAfter(lastSpan);

      // Create a new selection
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }

      // Scroll the first span into view
      (firstSpan as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [mounted, startTime, endTime, hasScrolledToStart]);

  // Update the renderHighlight function to only handle manual selection
  const renderHighlight = () => {
    if (!transcriptRef.current || !isSelecting || !selectionStart || !selectionEnd) return null;
    
    const transcriptRect = transcriptRef.current.getBoundingClientRect();
    
    return (
      <div
        className="absolute pointer-events-none bg-blue-500/50"
        style={{
          left: 0,
          right: 0,
          top: Math.min(selectionStart, selectionEnd) - transcriptRect.top,
          height: Math.abs(selectionEnd - selectionStart),
        }}
      />
    );
  };

  if (!mounted) {
    return <div className="h-[calc(100vh-200px)] bg-gray-100 animate-pulse" />;
  }

  return (
    <Card className="h-[calc(100vh-200px)] overflow-hidden">
      <style>{transcriptStyles}</style>
      <div className="h-full flex">
        <div className="w-64 border-r bg-gray-50 overflow-y-auto">
          {chapters.map((chapter, index) => (
            <button
              key={chapter.time.start}
              onClick={() => handleChapterClick(chapter.time.start)}
              className={cn(
                "text-left w-full p-3 hover:bg-gray-100 transition-colors border-b border-l-4",
                index === currentChapterIndex 
                  ? "bg-blue-50 border-l-blue-600" 
                  : "border-l-transparent"
              )}
            >
              <div className="text-sm font-medium">{chapter.title}</div>
              <div className="text-xs text-gray-600 mt-1">{chapter.timecode}</div>
              <div className="text-xs text-gray-500 mt-2 line-clamp-2">{chapter.synopsis}</div>
            </button>
          ))}
        </div>

        <div 
          ref={transcriptContainerRef}
          className="flex-1 overflow-y-auto p-4 relative"
        >
          <div 
            id="hypertranscript"
            ref={transcriptRef}
            className="hyperaudio-lite relative"
            dangerouslySetInnerHTML={{ __html: processedHtml }}
          />
          {renderHighlight()}
        </div>
      </div>
    </Card>
  );
}

// function formatTime(seconds: number) {
//   const minutes = Math.floor(seconds / 60);
//   const remainingSeconds = Math.floor(seconds % 60);
//   return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
// } 