import VideoSection from "@/components/VideoSection";
import { promises as fs } from 'fs';
import path from 'path';

export default async function BrucePerensPage() {
  const transcriptPath = path.join(process.cwd(), 'public', 'transcripts', 'bruce-perens.vtt');
  const transcriptHtml = await fs.readFile(transcriptPath, 'utf-8');

  return (
    <main className="container mx-auto px-4 py-8">
      <VideoSection 
        videoId="bruce-perens"
        transcriptHtml={transcriptHtml}
        playbackId="QHwKUN1BjwkwE4SvBHYcoRLzo4cr2HHsfoCRLfLocKQ"
        currentVideo={{
          id: "bruce-perens",
          title: "Bruce Perens",
          duration: "21:33",
          thumbnail: "/thumbnails/bruce-perens.png",
          description: "Exploring how open source software has transformed technology and society."
        }}
      />
    </main>
  );
} 