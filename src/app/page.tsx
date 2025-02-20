// import VideoCard from "@/components/VideoCard";
import ThemeExplorer from "@/components/ThemeExplorer";
import { videoData } from "@/data/videos";
import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRight, Play } from "lucide-react";
import Image from "next/image";

export default function Home() {
  const heroVideo = videoData["introduction-to-fossda"];
  const featuredVideos = [
    videoData["heather-meeker"],
    videoData["deb-goodkin"],
    videoData["bruce-perens"]
  ];

  return (
    <main>
      {/* Hero Section */}
      <div className="relative bg-gray-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '30px 30px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Free and Open Source Stories Digital Archive
              </h1>
              <p className="mt-6 text-xl text-gray-300 max-w-3xl">
                Preserving the personal stories of pioneers who transformed the world through open source. 
                Discover the journey from radical idea to fundamental force in modern technology.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/clips">
                  <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
                    Browse All Clips
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`/video/${heroVideo.id}`}>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="w-full sm:w-auto bg-white/10 border-white text-white hover:bg-white hover:text-gray-900 transition-colors"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Watch Introduction
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column - Featured Video */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
              <Link 
                href={`/video/${heroVideo.id}`}
                className="relative block rounded-lg overflow-hidden shadow-2xl transform transition duration-500 hover:scale-[1.01]"
              >
                <Image
                  src={heroVideo.thumbnail}
                  alt="FOSSDA Introduction"
                  width={1920}
                  height={1080}
                  className="w-full aspect-video object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-semibold text-white drop-shadow-lg">{heroVideo.title}</h3>
                  <p className="mt-2 text-gray-200 text-sm drop-shadow-lg">{heroVideo.sentence}</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Stories Section */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Featured Stories
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Explore interviews with key figures who shaped the open source movement
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredVideos.map((video) => (
              <div key={video.id} className="group">
                <Link href={`/video/${video.id}`}>
                  <div className="relative rounded-lg overflow-hidden shadow-lg transform transition duration-500 hover:scale-[1.02]">
                    <Image
                      src={video.thumbnail}
                      alt={video.title}
                      width={1280}
                      height={720}
                      className="w-full aspect-video object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-lg font-semibold text-white drop-shadow-lg">{video.title}</h3>
                      <p className="mt-2 text-gray-100 text-sm line-clamp-2 drop-shadow-lg leading-relaxed">{video.sentence}</p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Themes Section */}
      <div className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Explore Themes & Connections
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Discover how different stories connect through common themes and experiences
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-xl p-8">
            <ThemeExplorer />
          </div>
        </div>
      </div>
    </main>
  );
}

export const metadata: Metadata = {
  title: 'Free Open Source Stories Digital Archive',
  description: 'A digital archive of stories from the free and open source software community',
}; 