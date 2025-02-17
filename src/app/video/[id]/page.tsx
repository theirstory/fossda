import { Button } from "@/components/ui/button";
import { ChevronLeft, Share2 } from "lucide-react";
import Link from "next/link";
import VideoSection from "@/components/VideoSection";
import { promises as fs } from 'fs';
import path from 'path';
import { Suspense } from "react";
import { videoData } from "@/data/videos";
import { Metadata } from 'next';

interface PageProps {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

const PLAYBACK_IDS: Record<string, string> = {
  'introduction-to-fossda': process.env.NEXT_PUBLIC_MUX_PLAYBACK_ID!,
  'deb-goodkin': 'FjnuVlu9beaFgCNI01Bo3mkaaS89DRXWulNlcT57e8z8',
  'heather-meeker': 'BxDXf8F00tZ0201IRZ3Y8cgtxOJd02k3G00gmGzbg3KI7irM',
  'bruce-perens': 'QHwKUN1BjwkwE4SvBHYcoRLzo4cr2HHsfoCRLfLocKQ'
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const video = videoData[params.id];
  
  return {
    title: `${video.title} | Free Open Source Stories Digital Archive`,
    description: video.sentence,
  };
}

export default async function VideoPage({ params }: PageProps) {
  const videoId = params.id;
  const currentVideo = videoData[videoId];
  
  if (!currentVideo) {
    throw new Error(`Video ${params.id} not found`);
  }

  const transcriptPath = path.join(process.cwd(), 'public', 'transcripts', `${videoId}.html`);
  const transcriptHtml = await fs.readFile(transcriptPath, 'utf-8');

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="container mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">{currentVideo.title}</h1>
          </div>
          <Button variant="ghost" size="icon">
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<div>Loading...</div>}>
          <VideoSection
            videoId={videoId}
            transcriptHtml={transcriptHtml}
            playbackId={PLAYBACK_IDS[videoId]}
            currentVideo={{
              ...currentVideo,
              description: currentVideo.sentence // Map sentence to description
            }}
          />
        </Suspense>
      </main>
    </div>
  );
} 