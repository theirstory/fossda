"use client";

import { useState, useRef } from "react";
import VideoPlayer from "./VideoPlayer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import InteractiveTranscript from "./InteractiveTranscript";
import InsightsPanel from "./InsightsPanel";
import chaptersData from "@/data/chapters.json";
import { config } from '@/lib/config';
import { MuxPlayerElement } from '@mux/mux-player-react';
import { ChapterMetadata } from "@/types/transcript";

interface VideoSectionProps {
  videoId: string;
  transcriptHtml: string;
}

export default function VideoSection({ videoId, transcriptHtml }: VideoSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<MuxPlayerElement>(null!);

  const handleTimeUpdate = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      if (isPlaying) {
        videoRef.current.play().catch(console.error);
      }
    }
  };

  const handlePlayStateChange = (playing: boolean) => {
    setIsPlaying(playing);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="grid grid-rows-[auto_1fr] gap-6 h-[calc(100vh-200px)]">
        <VideoPlayer
          ref={videoRef}
          playbackId={process.env.NEXT_PUBLIC_MUX_PLAYBACK_ID!}
          onPlayStateChange={handlePlayStateChange}
          isPlaying={isPlaying}
          chapters={chaptersData.metadata}
        />

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Summary
          </h2>
          <div className="text-gray-700 leading-relaxed overflow-y-auto h-[calc(100%-2rem)]">
            Heather Meeker introduces FOSSDA (Free and Open Source Software Digital Archive), 
            a project preserving the history of open source. She shares how the movement transformed 
            software accessibility, driven by individuals rather than institutions, and draws from 
            her journey from 1980s programming to open source licensing.
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Tabs defaultValue="transcript">
          <TabsList className="w-full">
            <TabsTrigger value="transcript">Transcription</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>
          <TabsContent value="transcript" className="h-[calc(100vh-200px)]">
            <InteractiveTranscript
              transcriptHtml={transcriptHtml}
              onTimeClick={handleTimeUpdate}
              isPlaying={isPlaying}
              videoRef={videoRef}
              chapters={chaptersData.metadata}
            />
          </TabsContent>
          <TabsContent value="insights">
            <InsightsPanel
              onEntityClick={handleTimeUpdate}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 