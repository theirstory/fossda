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
    <main className="container mx-auto px-4">
      <div className="pt-6 grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold mb-2">
              Free and Open Source Stories Digital Archive
            </h1>
            <p className="text-gray-600 text-sm mb-3">
              Open source has transformed our world, not through governments or corporations, but through dedicated individuals 
              who envisioned a better way to share software. FOSSDA captures the personal stories of those who built this 
              movement, preserving their experiences for future generations who will carry open source forward into the 21st century.
            </p>
          </div>

          {/* Two Column Layout for Video and Featured Stories */}
          <div className="space-y-6">
            {/* Hero Video */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Introduction to FOSSDA</h2>
              <div className="max-w-2xl">
                <VideoCard
                  {...heroVideo}
                  description={heroVideo.sentence}
                  className="aspect-video"
                  isHero
                />
              </div>
            </div>

            {/* Featured Stories */}
            <div className="mt-2">
              <h2 className="text-lg font-semibold mb-2">Featured Stories</h2>
              <div className="grid grid-cols-3 gap-4">
                {featuredVideos.map((video) => (
                  <VideoCard
                    key={video.id}
                    {...video}
                    description={video.sentence}
                    className="h-auto"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Theme Explorer */}
        <div className="bg-white rounded-lg shadow-sm p-4 sticky top-[72px]">
          <h2 className="text-xl font-semibold mb-3">Explore Themes & Connections</h2>
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