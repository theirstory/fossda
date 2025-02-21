import { clips } from "@/data/clips";
import { videoData } from "@/data/videos";
import { themes } from "@/data/themes";
import { Metadata } from "next";
import ClipsPageClient from "./client";

export const metadata: Metadata = {
  title: 'Browse Clips | Free Open Source Stories Digital Archive',
  description: 'Explore curated clips from interviews with open source pioneers',
};

export default function ClipsPage() {
  const interviewees = Object.values(videoData).map(video => ({
    id: video.id,
    title: video.title,
  }));

  return (
    <main>
      {/* Hero Section - Reduced height */}
      <div className="relative bg-gray-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '30px 30px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Browse Interview Clips
            </h1>
            <p className="mt-3 text-lg text-gray-300 max-w-2xl mx-auto">
              Explore key moments from our interviews, organized by theme and speaker. 
              Each clip captures unique insights into the open source movement.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <ClipsPageClient 
            clips={clips}
            interviewees={interviewees}
            themes={themes}
          />
        </div>
      </div>
    </main>
  );
} 