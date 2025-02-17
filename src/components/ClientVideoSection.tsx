"use client";

import VideoSection from './VideoSection';

interface ClientVideoSectionProps {
  videoId: string;
  transcriptHtml: string;
}

export function ClientVideoSection({ videoId, transcriptHtml }: ClientVideoSectionProps) {
  return (
    <VideoSection 
      videoId={videoId}
      transcriptHtml={transcriptHtml}
    />
  );
} 