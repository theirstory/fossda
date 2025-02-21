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

        <div className="bg-white rounded-lg shadow-lg p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">
            Summary
          </h2>
          <div className="prose prose-sm max-w-none text-gray-600">
            {currentVideo.summary}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg h-full flex flex-col overflow-hidden">
        <Tabs defaultValue="transcript" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="w-full border-b flex-shrink-0">
            <TabsTrigger value="transcript">Transcription</TabsTrigger>
            <TabsTrigger value="clips">
              Clips ({clipCount})
            </TabsTrigger>
            <TabsTrigger value="related">Related Videos</TabsTrigger>
          </TabsList>
          <div className="flex-1 overflow-hidden">
            <TabsContent value="transcript" className="h-full overflow-auto">
              <div className="grid grid-cols-[250px,1fr] h-full gap-4">
                <VideoChapters
                  chapters={videoChapters.metadata}
                  videoRef={videoRef}
                  isPlaying={isPlaying}
                />
                <InteractiveTranscript
                  transcriptHtml={transcriptHtml}
                  videoRef={videoRef}
                  isPlaying={isPlaying}
                />
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