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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="grid grid-rows-[auto_1fr] gap-6">
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

        <div className="bg-white rounded-lg shadow p-4 max-h-[300px]">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Summary
          </h2>
          <div className="text-gray-700 leading-relaxed overflow-y-auto h-[calc(100%-2.5rem)]">
            {currentVideo.summary}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Tabs defaultValue="transcript">
          <TabsList className="w-full">
            <TabsTrigger value="transcript">Transcription</TabsTrigger>
            <TabsTrigger value="clips">
              Clips ({clipCount})
            </TabsTrigger>
            <TabsTrigger value="related">Related Videos</TabsTrigger>
          </TabsList>
          <TabsContent value="transcript" className="max-h-[600px] overflow-y-auto">
            <InteractiveTranscript
              transcriptHtml={transcriptHtml}
              isPlaying={isPlaying}
              videoRef={videoRef}
              chapters={videoChapters.metadata}
            />
          </TabsContent>
          <TabsContent value="clips" className="max-h-[600px] overflow-y-auto">
            <VideoClips interviewId={videoId} onClipClick={handleClipClick} />
          </TabsContent>
          <TabsContent value="related" className="max-h-[600px] overflow-y-auto">
            <RelatedVideos currentVideoId={currentVideo.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 