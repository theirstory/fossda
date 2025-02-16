import { Button } from "@/components/ui/button";
import VideoCard from "@/components/VideoCard";
import { ChevronRight } from "lucide-react";

export default function Home() {
  const heroVideo = {
    id: "introduction-to-fossda",
    title: "Introduction to FOSSDA",
    duration: "21:33",
    thumbnail: "/thumbnails/fossda-intro.png",
    description: "An introduction to the Free and Open Source Stories Digital Archive and its mission."
  };

  const videos = [
    {
      id: "heather-meeker",
      title: "Heather Meeker",
      duration: "21:33", 
      thumbnail: "/thumbnails/heather-meeker-1.png",
      description: "From computer programmer to open source legal expert - a journey through the evolution of software licensing."
    },
    {
      id: "deborah-goodkin",
      title: "Deborah Goodkin",
      duration: "21:33",
      thumbnail: "/thumbnails/deb-goodkin.png",
      description: "Stories from the pioneers who transformed software accessibility and collaboration."
    },
    {
      id: "bruce-perens",
      title: "Bruce Perens",
      duration: "21:33",
      thumbnail: "/thumbnails/bruce-perens.png",
      description: "Exploring how open source software has transformed technology and society."
    }
  ];

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Free and Open Source Stories Digital Archive</h1>
          <p className="text-gray-600 max-w-3xl mb-8">
            Open source has transformed our world, not through governments or corporations, but through dedicated individuals 
            who envisioned a better way to share software. FOSSDA captures the personal stories of those who built this 
            movement, preserving their experiences for future generations who will carry open source forward into the 21st century.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline">Stories</Button>
          <Button variant="outline">Clips</Button>
          <Button variant="outline">Insights</Button>
          <Button variant="outline">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Two-column layout for videos */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6">
        {/* Hero Video */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Introduction to FOSSDA</h2>
          <VideoCard 
            {...heroVideo} 
            className="aspect-video"
            isHero
          />
        </div>

        {/* Featured Stories Column */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Featured Stories</h2>
          <div className="space-y-3">
            {videos.map((video) => (
              <VideoCard 
                key={video.id} 
                {...video}
                className="h-auto"
                isCompact
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
} 