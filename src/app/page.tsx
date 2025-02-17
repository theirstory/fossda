import { Button } from "@/components/ui/button";
import VideoCard from "@/components/VideoCard";
import { ChevronRight } from "lucide-react";
import { videoData } from "@/data/videos";

export default function Home() {
  const heroVideo = videoData["introduction-to-fossda"];
  const featuredVideos = [
    videoData["heather-meeker"],
    videoData["deb-goodkin"],
    videoData["bruce-perens"]
  ];

  return (
    <main className="container mx-auto px-4 py-8 h-screen flex flex-col">
      {/* Header Section */}
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

      {/* Videos Section - with scrollable Featured Stories */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6 flex-1 min-h-0">
        {/* Hero Video */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Introduction to FOSSDA</h2>
          <VideoCard
            {...heroVideo}
            description={heroVideo.sentence}
            className="aspect-video"
            isHero
          />
        </div>

        {/* Featured Stories Column - Scrollable */}
        <div className="flex flex-col min-h-0">
          <h2 className="text-2xl font-semibold mb-4">Featured Stories</h2>
          <div className="overflow-y-auto flex-1">
            <div className="space-y-3 pr-2">
              {featuredVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  {...video}
                  description={video.sentence}
                  className="h-auto"
                  isCompact
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 