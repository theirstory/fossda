"use client";

import VideoSection from './VideoSection';
import { VideoId } from "@/data/videos";

interface Props {
  videoId: VideoId;
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

export default function ClientVideoSection({ videoId, transcriptHtml, playbackId, currentVideo }: Props) {
  return (
    <VideoSection 
      videoId={videoId}
      transcriptHtml={transcriptHtml}
      playbackId={playbackId}
      currentVideo={currentVideo}
    />
  );
} 