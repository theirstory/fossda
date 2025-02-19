"use client";

import { useState, useRef } from "react";
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
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<MuxPlayerElement>(null!);
  
  // Add error handling and fallback for chapter data
  const videoChapters = chapterData[videoId] || {
    title: currentVideo.title,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    metadata: []
  };

  // const handleTimeUpdate = (time: number) => {
  //   if (videoRef.current) {
  //     videoRef.current.currentTime = time;
  //     if (isPlaying) {
  //       videoRef.current.play().catch(console.error);
  //     }
  //   }
  // };

  const handlePlayStateChange = (playing: boolean) => {
    setIsPlaying(playing);
  };

  console.log('VideoSection playbackId:', {
    id: playbackId,
    length: playbackId.length,
    chars: Array.from(playbackId).map(c => c.charCodeAt(0))
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="grid grid-rows-[auto_1fr] gap-6">
        <VideoPlayer
          ref={videoRef}
          playbackId={playbackId}
          onPlayStateChange={handlePlayStateChange}
          chapters={videoChapters.metadata}
          thumbnail={currentVideo.thumbnail}
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
            <TabsTrigger value="clips">Clips</TabsTrigger>
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
            <VideoClips interviewId={videoId} />
          </TabsContent>
          <TabsContent value="related" className="max-h-[600px] overflow-y-auto">
            <RelatedVideos currentVideoId={currentVideo.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 