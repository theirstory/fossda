"use client";

import { useState, useRef, useEffect } from "react";
import VideoPlayer from "./VideoPlayer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import InteractiveTranscript from "./InteractiveTranscript";
// import InsightsPanel from "./InsightsPanel";
import { chapterData } from '@/data/chapters';
// import { config } from '@/lib/config';
import { MuxPlayerElement } from '@mux/mux-player-react';
// import { ChapterMetadata } from "@/types/transcript";
import RelatedVideos from "./RelatedVideos";
import VideoClips from "./VideoClips";
import { useSearchParams } from 'next/navigation';
import { clips } from "@/data/clips";
import VideoChapters from "./VideoChapters";
import { Button } from "./ui/button";
import { ChevronDown, ChevronUp, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import CitationButton from "./CitationButton";

interface VideoSectionProps {
  videoId: string;
  transcriptHtml: string;
  playbackId: string;
  currentVideo: {
    id: string;
    title: string;
    duration: string;
    thumbnail: string;
    description: string;
    summary: string;
  };
}

export default function VideoSection({ videoId, transcriptHtml, playbackId, currentVideo }: VideoSectionProps) {
  const videoRef = useRef<MuxPlayerElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const searchParams = useSearchParams();
  const startTime = searchParams.get('t');
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [isChaptersOpen, setIsChaptersOpen] = useState(false);
  
  // Add error handling and fallback for chapter data
  const videoChapters = chapterData[videoId] || {
    title: currentVideo.title,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    metadata: []
  };

  // Handle initial timestamp
  useEffect(() => {
    const handleInitialTimestamp = () => {
      if (videoRef.current && startTime) {
        const timeInSeconds = parseFloat(startTime);
        if (!isNaN(timeInSeconds)) {
          videoRef.current.currentTime = timeInSeconds;
        }
      }
    };

    // Try to set timestamp immediately in case player is already ready
    handleInitialTimestamp();
  }, [startTime]);

  const handlePlayStateChange = (playing: boolean) => {
    setIsPlaying(playing);
  };

  const handleClipClick = (timestamp: number) => {
    if (videoRef.current) {
      const wasPlaying = isPlaying;
      videoRef.current.currentTime = timestamp;
      if (wasPlaying) {
        videoRef.current.play();
      }
    }
  };

  console.log('VideoSection playbackId:', {
    id: playbackId,
    length: playbackId.length,
    chars: Array.from(playbackId).map(c => c.charCodeAt(0))
  });

  // Get number of clips for this video
  const clipCount = clips.filter(clip => clip.interviewId === videoId).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-4 h-full">
      <div className="flex flex-col gap-4">
        <div className="bg-white rounded-lg shadow-lg">
          <VideoPlayer
            ref={videoRef}
            playbackId={playbackId}
            onPlayStateChange={handlePlayStateChange}
            chapters={videoChapters.metadata}
            thumbnail={currentVideo.thumbnail}
            onLoadedMetadata={() => {
              if (videoRef.current && startTime) {
                const timeInSeconds = parseFloat(startTime);
                if (!isNaN(timeInSeconds)) {
                  videoRef.current.currentTime = timeInSeconds;
                }
              }
            }}
          />
        </div>

        {/* Summary and Chapters Section - Mobile Only */}
        <div className="lg:hidden">
          <div className="flex justify-between mb-2">
            <Button
              variant="ghost"
              onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
              className="w-[48%] flex items-center justify-between p-4 rounded-lg bg-white shadow"
            >
              <span className="text-sm font-semibold text-gray-900">Summary</span>
              {isSummaryExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            <Sheet open={isChaptersOpen} onOpenChange={setIsChaptersOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-[48%] flex items-center justify-between p-4 rounded-lg bg-white shadow"
                >
                  <span className="text-sm font-semibold text-gray-900">Chapters</span>
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh]">
                <SheetHeader>
                  <SheetTitle>Chapters</SheetTitle>
                </SheetHeader>
                <div className="mt-4 h-full overflow-y-auto pb-8">
                  <VideoChapters
                    chapters={videoChapters.metadata}
                    videoRef={videoRef}
                    isPlaying={isPlaying}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className={cn(
            "overflow-hidden transition-all duration-200 bg-white rounded-lg shadow-lg",
            isSummaryExpanded ? "max-h-96" : "max-h-0"
          )}>
            <div className="p-4">
              <div className="prose prose-sm max-w-none text-gray-600">
                {currentVideo.summary}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Section - Desktop Only */}
        <div className="hidden lg:block bg-white rounded-lg shadow-lg">
          <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">
              Summary
            </h2>
            <div className="prose prose-sm max-w-none text-gray-600">
              {currentVideo.summary}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg h-full flex flex-col overflow-hidden">
        <Tabs defaultValue="transcript" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="w-full border-b flex-shrink-0 flex items-center px-2">
            <div className="flex-1" />
            <div className="flex gap-2">
              <TabsTrigger value="transcript">Transcription</TabsTrigger>
              <TabsTrigger value="clips">
                Clips ({clipCount})
              </TabsTrigger>
              <TabsTrigger value="related">Related Videos</TabsTrigger>
            </div>
            <div className="flex-1 flex justify-end">
              <CitationButton
                title={currentVideo.title}
                speaker={currentVideo.title.split(" - ")[0]}
                url={typeof window !== 'undefined' ? window.location.href : ''}
                duration={currentVideo.duration}
              />
            </div>
          </TabsList>
          <div className="flex-1 overflow-hidden">
            <TabsContent value="transcript" className="h-full overflow-auto">
              <div className="relative h-full">
                {/* Desktop Layout */}
                <div className="h-full grid grid-cols-1 lg:grid-cols-[250px,1fr]">
                  <div className="hidden lg:block h-full overflow-auto">
                    <VideoChapters
                      chapters={videoChapters.metadata}
                      videoRef={videoRef}
                      isPlaying={isPlaying}
                      className="h-full"
                    />
                  </div>
                  <InteractiveTranscript
                    transcriptHtml={transcriptHtml}
                    videoRef={videoRef}
                    isPlaying={isPlaying}
                    chapters={videoChapters.metadata}
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="clips" className="h-full overflow-auto p-4">
              <VideoClips interviewId={videoId} onClipClick={handleClipClick} />
            </TabsContent>
            <TabsContent value="related" className="h-full overflow-auto p-4">
              <RelatedVideos currentVideoId={currentVideo.id} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
} 