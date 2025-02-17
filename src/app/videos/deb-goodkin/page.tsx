import VideoSection from "@/components/VideoSection";
import { promises as fs } from 'fs';
import path from 'path';

export default async function DebGoodkinPage() {
  const transcriptPath = path.join(process.cwd(), 'public', 'transcripts', 'deb-goodkin.html');
  const transcriptHtml = await fs.readFile(transcriptPath, 'utf-8');

  return (
    <main className="container mx-auto px-4 py-8">
      <VideoSection 
        videoId="deb-goodkin"
        transcriptHtml={transcriptHtml}
        playbackId="FjnuVlu9beaFgCNI01Bo3mkaaS89DRXWulNlcT57e8z8"
        currentVideo={{
          id: "deborah-goodkin",
          title: "Deb Goodkin",
          duration: "21:33",
          thumbnail: "/thumbnails/deb-goodkin.png",
          description: "Stories from the pioneers who transformed software accessibility and collaboration."
        }}
      />
    </main>
  );
} 