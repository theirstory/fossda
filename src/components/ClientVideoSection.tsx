"use client";

import VideoSection from './VideoSection';

interface ClientVideoSectionProps {
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

export function ClientVideoSection({ videoId, transcriptHtml, playbackId, currentVideo }: ClientVideoSectionProps) {
  return (
    <VideoSection 
      videoId={videoId}
      transcriptHtml={transcriptHtml}
      playbackId={playbackId}
      currentVideo={currentVideo}
    />
  );
} 