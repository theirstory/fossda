import VideoSection from "@/components/VideoSection";
import { promises as fs } from 'fs';
import path from 'path';
import { videoData } from "@/data/videos";

export default async function BrucePerensPage() {
  const transcriptPath = path.join(process.cwd(), 'public', 'transcripts', 'bruce-perens.html');
  const transcriptHtml = await fs.readFile(transcriptPath, 'utf-8');
  const video = videoData["bruce-perens"];

  return (
    <main className="container mx-auto px-4 py-8">
      <VideoSection
        videoId="bruce-perens"
        transcriptHtml={transcriptHtml}
        playbackId="QHwKUN1BjwkwE4SvBHYcoRLzo4cr2HHsfoCRLfLocKQ"
        currentVideo={{
          ...video,
          description: video.sentence
        }}
      />
    </main>
  );
} 