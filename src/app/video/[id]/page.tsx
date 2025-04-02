import VideoSection from "@/components/VideoSection";
import { promises as fs } from 'fs';
import path from 'path';
import { Suspense } from "react";
import { videoData, VideoId } from "@/data/videos";
import { Metadata } from 'next';
import { PLAYBACK_IDS } from "@/config/playback-ids";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const videoId = resolvedParams.id as VideoId;
  const video = videoData[videoId];
  
  return {
    title: `${video.title} | Free Open Source Stories Digital Archive`,
    description: video.sentence,
  };
}

export default async function VideoPage({ params }: Props) {
  const resolvedParams = await params;
  const videoId = resolvedParams.id as VideoId;
  const currentVideo = videoData[videoId];
  
  if (!currentVideo) {
    throw new Error(`Video ${videoId} not found`);
  }

  // Map video IDs to transcript filenames
  const idMapping: Record<VideoId, string> = {
    "introduction-to-fossda": "introduction-to-fossda",
    "tristan-nitot": "tristan-nitot",
    "deb-goodkin": "deb-goodkin",
    "heather-meeker": "heather-meeker",
    "bruce-perens": "bruce-perens",
    "larry-augustin": "larry-augustin",
    "roger-dannenberg": "roger-dannenberg",
    "bart-decrem": "bart-decrem",
    "lawrence-rosen": "lawrence-rosen",
    "jon-maddog-hall": "jon-maddog-hall",
    "tony-wasserman": "tony-wasserman",
    "joshua-gay-fossda": "joshua-gay-fossda"
  };

  const transcriptFilename = idMapping[videoId] || videoId;
  const transcriptPath = path.join(process.cwd(), 'public', 'transcripts', `${transcriptFilename}.html`);
  const transcriptHtml = await fs.readFile(transcriptPath, 'utf-8');

  return (
    <main className="h-[calc(100vh-64px)] flex flex-col overflow-hidden">
      {/* Hero Section - Ultra Compact */}
      <div className="relative bg-gray-900 flex-shrink-0">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '30px 30px'
          }} />
        </div>

        <div className="relative max-w-[1920px] mx-auto px-2 py-3">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl mb-2">
              {currentVideo.title}
            </h1>
            <p className="text-sm text-gray-300">
              {currentVideo.sentence}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-gray-50 flex-1 overflow-hidden">
        <div className="max-w-[1920px] h-full mx-auto px-4 py-2">
          <Suspense fallback={<div>Loading...</div>}>
            <VideoSection
              videoId={videoId}
              transcriptHtml={transcriptHtml}
              playbackId={PLAYBACK_IDS[videoId]}
              currentVideo={{
                ...currentVideo,
                description: currentVideo.sentence
              }}
            />
          </Suspense>
        </div>
      </div>
    </main>
  );
} 