import VideoSection from "@/components/VideoSection";
import { promises as fs } from 'fs';
import path from 'path';
import { videoData } from "@/data/videos";
import { Metadata } from 'next';

export default async function DebGoodkinPage() {
  const transcriptPath = path.join(process.cwd(), 'public', 'transcripts', 'deb-goodkin.html');
  const transcriptHtml = await fs.readFile(transcriptPath, 'utf-8');
  const video = videoData["deb-goodkin"];

  return (
    <main className="container mx-auto px-4 py-8">
      <VideoSection
        videoId="deb-goodkin"
        transcriptHtml={transcriptHtml}
        playbackId="VwS00Yq2pI1RKqBxvhI8H5RXFUVBxokM"
        currentVideo={{
          ...video,
          description: video.sentence
        }}
      />
    </main>
  );
}

export const metadata: Metadata = {
  title: 'Deb Goodkin | Free Open Source Stories Digital Archive',
  description: 'Interview with Deb Goodkin from the FreeBSD Foundation',
}; 