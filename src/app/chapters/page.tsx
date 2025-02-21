"use client";

import { videoData } from "@/data/videos";
import { chapterData } from "@/data/chapters";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { Clock, Search, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { ChapterMetadata } from "@/types/transcript";

export default function ChaptersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Group chapters by interview
  const groupedChapters = Object.entries(chapterData).map(([videoId, chapterInfo]) => ({
    id: videoId,
    title: videoData[videoId].title,
    thumbnail: videoData[videoId].thumbnail,
    duration: videoData[videoId].duration,
    chapters: chapterInfo.metadata.map((chapter, index) => ({
      ...chapter,
      interviewId: videoId,
      chapterIndex: index
    }))
  }));

  // Filter chapters based on search
  const filteredGroups = searchQuery
    ? groupedChapters.map(group => ({
        ...group,
        chapters: group.chapters.filter(chapter =>
          chapter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          chapter.synopsis?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(group => group.chapters.length > 0)
    : groupedChapters;

  return (
    <main>
      {/* Hero Section */}
      <div className="relative bg-gray-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '30px 30px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Interview Chapters
            </h1>
            <p className="mt-4 text-xl text-gray-300 max-w-3xl mx-auto">
              Browse through all interview segments and chapters. Find specific topics and moments across our entire archive.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
          <Input 
            placeholder="Search chapters by title or content..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Chapters by Interview */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {filteredGroups.map((group) => (
              <div key={group.id} className="space-y-6">
                {/* Interview Header */}
                <div className="flex items-center gap-6">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={group.thumbnail}
                      alt={group.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {group.title}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <Clock className="h-4 w-4" />
                      {group.duration}
                      <span className="mx-2">•</span>
                      {group.chapters.length} chapters
                    </div>
                  </div>
                </div>

                {/* Chapters Timeline */}
                <div className="grid grid-cols-1 gap-4">
                  {group.chapters.map((chapter, index) => (
                    <Link 
                      key={`${group.id}-${index}`}
                      href={`/video/${group.id}?t=${chapter.time.start}`}
                      className="block"
                    >
                      <Card className="overflow-hidden hover:shadow-lg transition-all hover:bg-gray-50 group">
                        <div className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-24 text-sm text-gray-500 pt-1">
                              {chapter.timecode}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {chapter.title}
                              </h3>
                              <p className="text-gray-600 mt-1 line-clamp-2">
                                {chapter.synopsis}
                              </p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
} 