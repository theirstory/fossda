"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Card } from './ui/card';
import { useScripts } from "@/hooks/useScript";
import { parseTranscriptChapters, TranscriptChapter, addTimecodesToTranscript } from "@/lib/transcript";
import { ChapterMetadata } from "@/types/transcript";
import { MuxPlayerElement } from '@mux/mux-player-react';

interface InteractiveTranscriptProps {
  transcriptHtml: string;
  onTimeClick: (time: number) => void;
  isPlaying: boolean;
  videoRef: React.RefObject<MuxPlayerElement>;
  chapters: ChapterMetadata[];
}

export default function InteractiveTranscript({
  transcriptHtml,
  onTimeClick,
  isPlaying,
  videoRef,
  chapters
}: InteractiveTranscriptProps) {
  const transcriptRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useScripts();
  const [processedHtml, setProcessedHtml] = useState(transcriptHtml);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      setProcessedHtml(addTimecodesToTranscript(transcriptHtml));
    }
  }, [transcriptHtml, mounted]);

  // Initialize HyperaudioLite
  useEffect(() => {
    if (scriptLoaded && mounted && transcriptRef.current && videoRef.current && document.getElementById('hyperplayer')) {
      if (typeof HyperaudioLite === 'function') {
        new HyperaudioLite(
          "hypertranscript",
          "hyperplayer",
          false,  // minimizedMode
          true,   // autoScroll
          false,  // doubleClick
          false,  // webMonetization
          false   // playOnClick
        );

        // Add click handler to transcript spans
        const spans = transcriptRef.current.querySelectorAll('span[data-m]');
        spans.forEach(span => {
          span.addEventListener('click', () => {
            const time = parseInt(span.getAttribute('data-m') || '0', 10) / 1000;
            // Set time directly on the video element
            const videoElement = document.getElementById('hyperplayer') as HTMLVideoElement;
            if (videoElement) {
              videoElement.currentTime = time;
              if (isPlaying) {
                videoElement.play();
              }
              // Scroll the clicked word into view
              span.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          });
        });
      }
    }
  }, [scriptLoaded, videoRef, mounted, isPlaying]);

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

  if (!mounted) {
    return <div className="h-[calc(100vh-200px)] bg-gray-100 animate-pulse" />;
  }

  return (
    <Card className="h-[calc(100vh-200px)] overflow-hidden">
      <div className="h-full flex">
        <div className="w-64 border-r bg-gray-50 overflow-y-auto">
          {chapters.map((chapter) => (
            <button
              key={chapter.time.start}
              onClick={() => handleChapterClick(chapter.time.start)}
              className={cn(
                "text-left w-full p-3 hover:bg-gray-100 transition-colors border-b",
                (videoRef.current?.currentTime ?? 0) >= chapter.time.start && "bg-gray-100 font-medium"
              )}
            >
              <div className="text-sm font-medium">{chapter.title}</div>
              <div className="text-xs text-gray-600 mt-1">{chapter.timecode}</div>
              <div className="text-xs text-gray-500 mt-2 line-clamp-2">{chapter.synopsis}</div>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div 
            id="hypertranscript"
            ref={transcriptRef}
            className="hyperaudio-lite"
            dangerouslySetInnerHTML={{ __html: processedHtml }}
          />
        </div>
      </div>
    </Card>
  );
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
} 