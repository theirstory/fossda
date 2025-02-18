import VideoCard from "@/components/VideoCard";
import ThemeExplorer from "@/components/ThemeExplorer";
import { videoData } from "@/data/videos";
import { Metadata } from "next";

export default function Home() {
  const heroVideo = videoData["introduction-to-fossda"];
  const featuredVideos = [
    videoData["heather-meeker"],
    videoData["deb-goodkin"],
    videoData["bruce-perens"]
  ];

  return (
    <main className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">
          Free and Open Source Stories Digital Archive
        </h1>
        <p className="text-gray-600 max-w-3xl text-sm">
          Open source has transformed our world, not through governments or corporations, but through dedicated individuals 
          who envisioned a better way to share software. FOSSDA captures the personal stories of those who built this 
          movement, preserving their experiences for future generations who will carry open source forward into the 21st century.
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-6">
        {/* Left Column - Videos */}
        <div className="space-y-6">
          {/* Hero Video */}
          <div className="max-w-3xl">
            <h2 className="text-lg font-semibold mb-3">Introduction to FOSSDA</h2>
            <VideoCard
              {...heroVideo}
              description={heroVideo.sentence}
              className="aspect-video"
              isHero
            />
          </div>

          {/* Featured Stories */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Featured Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featuredVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  {...video}
                  description={video.sentence}
                  className="h-full"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Theme Explorer */}
        <div className="bg-white rounded-lg shadow-sm p-4 h-[calc(100vh-160px)] sticky top-4">
          <h2 className="text-lg font-semibold mb-3">Explore Themes & Connections</h2>
          <ThemeExplorer />
        </div>
      </div>
    </main>
  );
}

export const metadata: Metadata = {
  title: 'Free Open Source Stories Digital Archive',
  description: 'A digital archive of stories from the free and open source software community',
}; 