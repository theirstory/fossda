"use client";

import dynamic from 'next/dynamic';
import { VideoId } from '@/data/videos';

const VideoSection = dynamic(() => import('./VideoSection'), {
  loading: () => (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="w-full aspect-video bg-gray-200 rounded-lg mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    </div>
  )
});

interface VideoSectionWrapperProps {
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

export default function VideoSectionWrapper(props: VideoSectionWrapperProps) {
  return <VideoSection {...props} />;
} 