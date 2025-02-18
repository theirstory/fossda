import { clips } from "@/data/clips";
import { themes } from "@/data/themes";
import { videoData } from "@/data/videos";
import ClipsGrid from "@/components/ClipsGrid";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Clips | Free Open Source Stories Digital Archive',
  description: 'Browse and filter clips from the FOSSDA interviews',
};

function ClipsPage() {
  // Get unique interviewees from clips
  const interviewees = Array.from(new Set(clips.map(clip => clip.interviewId)))
    .map(id => ({
      id,
      title: videoData[id].title
    }));

  return (
    <main className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Browse Clips</h1>
        <p className="text-gray-600">
          Browse and filter key moments from the FOSSDA interviews
        </p>
      </div>

      <ClipsGrid 
        clips={clips}
        interviewees={interviewees}
        themes={themes}
      />
    </main>
  );
}

export default ClipsPage; 