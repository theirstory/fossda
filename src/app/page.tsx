"use client";

// import VideoCard from "@/components/VideoCard";
import ThemeExplorer from "@/components/ThemeExplorer";
import { videoData } from "@/data/videos";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRight, Play, ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";

export default function Home() {
  const heroVideo = videoData["introduction-to-fossda"];
  const featuredVideos = [
    videoData["heather-meeker"],
    videoData["larry-augustin"],
    videoData["bruce-perens"],
    videoData["deb-goodkin"]
  ];

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftScroll(scrollLeft > 0);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      checkScroll();
      scrollContainer.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);

      return () => {
        scrollContainer.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
    return undefined;
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

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
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-semibold text-white text-shadow-lg">{heroVideo.title}</h3>
                  <p className="mt-2 text-gray-100 text-sm text-shadow-lg">{heroVideo.sentence}</p>
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

          <div className="relative">
            {/* Scroll Buttons */}
            {showLeftScroll && (
              <Button
                variant="outline"
                size="icon"
                className="absolute -left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg rounded-full"
                onClick={() => scroll('left')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            {showRightScroll && (
              <Button
                variant="outline"
                size="icon"
                className="absolute -right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg rounded-full"
                onClick={() => scroll('right')}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}

            {/* Scrollable Container */}
            <div 
              ref={scrollContainerRef}
              className="flex gap-8 overflow-x-auto pb-4 px-4 -mx-4 scrollbar-hide scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {featuredVideos.map((video) => (
                <div key={video.id} className="flex-none w-[400px]">
                  <Link href={`/video/${video.id}`}>
                    <div className="relative rounded-lg overflow-hidden shadow-lg transform transition duration-500 hover:scale-[1.02]">
                      <Image
                        src={video.thumbnail}
                        alt={video.title}
                        width={1280}
                        height={720}
                        className="w-full aspect-video object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-lg font-semibold text-white text-shadow-lg">{video.title}</h3>
                        <p className="mt-2 text-gray-100 text-sm line-clamp-2 text-shadow-lg leading-relaxed">{video.sentence}</p>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Discover All Interviews */}
          <div className="mt-12">
            <Link href="/interviews">
              <div className="bg-blue-600 rounded-lg p-8 text-white flex flex-col md:flex-row items-center justify-between hover:bg-blue-700 transition-colors">
                <div>
                  <h3 className="text-2xl font-bold">Discover All Interviews</h3>
                  <p className="text-blue-100 mt-2">
                    Explore our complete collection of interviews with open source pioneers and leaders.
                  </p>
                </div>
                <div className="flex items-center gap-2 font-medium mt-4 md:mt-0">
                  View All Interviews
                  <ChevronRight className="h-5 w-5" />
                </div>
              </div>
            </Link>
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