import VideoSection from "@/components/VideoSection";
import { promises as fs } from 'fs';
import path from 'path';
import { Suspense } from "react";
import { videoData } from "@/data/videos";
import { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const PLAYBACK_IDS: Record<string, string> = {
  'introduction-to-fossda': 'Tj25JqqJzvm9yUVnHhkzh4SI4OpEsMDDEwn00nuaVCqo',
  'deb-goodkin': 'FjnuVlu9beaFgCNI01Bo3mkaaS89DRXWulNlcT57e8z8',
  'heather-meeker': 'BxDXf8F00tZ0201IRZ3Y8cgtxOJd02k3G00gmGzbg3KI7irM',
  'bruce-perens': 'QHwKUN1BjwkwE4SvBHYcoRLzo4cr2HHsfoCRLfLocKQ'
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const video = videoData[resolvedParams.id];
  
  return {
    title: `${video.title} | Free Open Source Stories Digital Archive`,
    description: video.sentence,
  };
}

export default async function VideoPage({ params }: Props) {
  const resolvedParams = await params;
  const videoId = resolvedParams.id;
  const currentVideo = videoData[videoId];
  
  if (!currentVideo) {
    throw new Error(`Video ${videoId} not found`);
  }

  const transcriptPath = path.join(process.cwd(), 'public', 'transcripts', `${videoId}.html`);
  const transcriptHtml = await fs.readFile(transcriptPath, 'utf-8');

  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden bg-gray-100">
      <main className="container mx-auto px-4 py-6">
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
      </main>
    </div>
  );
} 