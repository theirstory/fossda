import VideoSectionWrapper from "@/components/VideoSectionWrapper";
import { promises as fs } from 'fs';
import path from 'path';
import { videoData } from "@/data/videos"; // Fixed import path
import { Metadata } from 'next';

export default async function HeatherMeekerPage() {
  const transcriptPath = path.join(process.cwd(), 'public', 'transcripts', 'heather-meeker.html');
  const transcriptHtml = await fs.readFile(transcriptPath, 'utf-8');
  const video = videoData["heather-meeker"];

  return (
    <main className="container mx-auto px-4 py-8">
      <VideoSectionWrapper
        videoId="heather-meeker"
        transcriptHtml={transcriptHtml}
        playbackId="BxDXf8F00tZ0201IRZ3Y8cgtxOJd02k3G00gmGzbg3KI7irM"
        currentVideo={{
          ...video,
          description: video.sentence
        }}
      />
    </main>
  );
}

export const metadata: Metadata = {
  title: 'Heather Meeker | Free Open Source Stories Digital Archive',
  description: 'Interview with Heather Meeker about open source licensing and community',
}; 