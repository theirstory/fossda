"use client";

import { useState, useRef } from "react";
import VideoPlayer from "./VideoPlayer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import InteractiveTranscript from "./InteractiveTranscript";
import InsightsPanel from "./InsightsPanel";
import chaptersData from "@/data/chapters.json";

interface VideoSectionProps {
  videoId: string;
  transcriptHtml: string;
}

export default function VideoSection({ videoId, transcriptHtml }: VideoSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

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
      <div>
        <VideoPlayer
          ref={videoRef}
          videoUrl={`/videos/${videoId}.mp4`}
          onPlayStateChange={handlePlayStateChange}
          isPlaying={isPlaying}
        />
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