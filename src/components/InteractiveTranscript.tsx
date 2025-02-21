"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { Card } from './ui/card';
import { useScripts } from "@/hooks/useScript";
import { addTimecodesToTranscript } from "@/lib/transcript";
import { MuxPlayerElement } from '@mux/mux-player-react';
import { useSearchParams } from 'next/navigation';

interface InteractiveTranscriptProps {
  transcriptHtml: string;
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
      setProcessedHtml(addTimecodesToTranscript(transcriptHtml));
    }
  }, [transcriptHtml, mounted]);

  // Create a stable click handler using useCallback
  const handleSpanClick = useCallback((event: Event) => {
    const span = event.target as HTMLElement;
    if (!span.hasAttribute('data-m')) return;

    const time = parseInt(span.getAttribute('data-m') || '0', 10) / 1000;
    const videoElement = document.getElementById('hyperplayer') as HTMLVideoElement;
    if (videoElement) {
      videoElement.currentTime = time;
      if (isPlaying) {
        videoElement.play().catch(console.error);
      }
      span.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isPlaying]);

  // Initialize HyperaudioLite and click handlers
  useEffect(() => {
    if (!scriptLoaded || !mounted || !transcriptRef.current) {
      return undefined;
    }

    // Wait for player to be ready
    const player = document.getElementById('hyperplayer') as HTMLVideoElement;
    if (!player) {
      return undefined;
    }

    const transcriptElement = transcriptRef.current;

    // Add click handler to the transcript container (using event delegation)
    transcriptElement.addEventListener('click', handleSpanClick);

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
            }
            observer.disconnect();
          }
        }
      });
    });

    observer.observe(player, { attributes: true });

    // Cleanup function
    return () => {
      observer.disconnect();
      transcriptElement.removeEventListener('click', handleSpanClick);
    };
  }, [scriptLoaded, mounted, handleSpanClick]);

  // Update the timeupdate listener to use videoRef
  useEffect(() => {
    const muxPlayer = videoRef.current;
    if (!muxPlayer || !transcriptRef.current || !transcriptContainerRef.current) {
      return undefined;
    }

    // Get the underlying video element
    const videoElement = document.getElementById('hyperplayer') as HTMLVideoElement;
    if (!videoElement) {
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
  }, [mounted, videoRef]);

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
      <div 
        ref={transcriptContainerRef}
        className="h-full overflow-y-auto p-4 relative"
      >
        <div 
          id="hypertranscript"
          ref={transcriptRef}
          className="hyperaudio-lite relative"
          dangerouslySetInnerHTML={{ __html: processedHtml }}
        />
        {renderHighlight()}
      </div>
    </Card>
  );
}

// function formatTime(seconds: number) {
//   const minutes = Math.floor(seconds / 60);
//   const remainingSeconds = Math.floor(seconds % 60);
//   return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
// } 