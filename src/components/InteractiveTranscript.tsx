"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Card } from './ui/card';
import { useScripts } from "@/hooks/useScript";
import { parseTranscriptChapters, TranscriptChapter, addTimecodesToTranscript } from "@/lib/transcript";
import { ChapterMetadata } from "@/types/transcript";

interface InteractiveTranscriptProps {
  transcriptHtml: string;
  onTimeClick: (time: number) => void;
  isPlaying: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
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

  // Initialize transcript
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setProcessedHtml(addTimecodesToTranscript(transcriptHtml));
    }
  }, [transcriptHtml]);

  // Initialize hyperaudio-lite
  useEffect(() => {
    if (scriptLoaded && transcriptRef.current && videoRef.current) {
      // Initialize hyperaudio-lite
      if (typeof HyperaudioLite === 'function') {
        new HyperaudioLite(
          "hypertranscript",
          "hyperplayer",
          false,  // minimizedMode
          true,   // autoScroll
          false,  // doubleClick
          false,  // webMonetization
          true    // playOnClick
        );
      }
    }
  }, [scriptLoaded, videoRef]);

  return (
    <Card className="h-[calc(100vh-200px)] overflow-hidden">
      <div className="h-full flex">
        <div className="w-64 border-r bg-gray-50 overflow-y-auto">
          {chapters.map((chapter) => (
            <button
              key={chapter.time.start}
              onClick={() => onTimeClick(chapter.time.start)}
              className={cn(
                "text-left w-full p-3 hover:bg-gray-100 transition-colors border-b",
                (videoRef.current?.currentTime ?? 0) >= chapter.time.start && "bg-gray-100 font-medium"
              )}
            >
              <div className="text-sm font-medium">{chapter.title}</div>
              <div className="text-xs text-gray-600 mt-1">
                {chapter.timecode}
              </div>
              <div className="text-xs text-gray-500 mt-2 line-clamp-2">
                {chapter.synopsis}
              </div>
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