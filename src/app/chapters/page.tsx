"use client";

import { videoData } from "@/data/videos";
import { chapterData } from "@/data/chapters";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { Clock, Search, ChevronRight, X, ChevronLeft } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ChaptersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInterviews, setSelectedInterviews] = useState<string[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  // Filter chapters based on search and selected interviews
  const filteredGroups = groupedChapters
    .filter(group => selectedInterviews.length === 0 || selectedInterviews.includes(group.id))
    .map(group => ({
      ...group,
      chapters: group.chapters.filter(chapter =>
        searchQuery
          ? chapter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            chapter.synopsis?.toLowerCase().includes(searchQuery.toLowerCase())
          : true
      )
    }))
    .filter(group => group.chapters.length > 0);

  // Available interviews for selection
  const availableInterviews = groupedChapters
    .filter(group => !selectedInterviews.includes(group.id));

  // Check scroll position
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const checkScroll = () => {
      const hasOverflow = container.scrollWidth > container.clientWidth;
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(hasOverflow && container.scrollLeft < container.scrollWidth - container.clientWidth);
    };

    checkScroll();
    container.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);

    return () => {
      container.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [filteredGroups]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const scrollAmount = 400; // One column width
    const targetScroll = container.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  };

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
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
            <Input 
              placeholder="Search chapters by title or content..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Interview Selection */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap gap-2">
                {selectedInterviews.map(interviewId => {
                  const interview = groupedChapters.find(g => g.id === interviewId);
                  return (
                    <Button
                      key={interviewId}
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedInterviews(prev => prev.filter(id => id !== interviewId))}
                      className="group"
                    >
                      {interview?.title}
                      <X className="w-4 h-4 ml-2 opacity-50 group-hover:opacity-100" />
                    </Button>
                  );
                })}
              </div>
            </div>
            {availableInterviews.length > 0 && (
              <Select
                onValueChange={(value) => setSelectedInterviews(prev => [...prev, value])}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Add interview" />
                </SelectTrigger>
                <SelectContent>
                  {availableInterviews.map(interview => (
                    <SelectItem key={interview.id} value={interview.id}>
                      {interview.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>

      {/* Chapters Grid */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            {/* Left Scroll Button */}
            {canScrollLeft && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full bg-white shadow-lg border-gray-200 hover:bg-gray-50"
                  onClick={() => scroll('left')}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              </div>
            )}

            {/* Left Fade */}
            {canScrollLeft && (
              <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 to-transparent z-[1] pointer-events-none" />
            )}

            {/* Right Scroll Button */}
            {canScrollRight && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full bg-white shadow-lg border-gray-200 hover:bg-gray-50"
                  onClick={() => scroll('right')}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>
            )}

            {/* Right Fade */}
            {canScrollRight && (
              <div className="absolute right-0 top-0 bottom-0 w-48 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none" />
            )}

            {/* Scrollable Content */}
            <div 
              ref={scrollContainerRef}
              className="flex overflow-x-auto gap-8 pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 scroll-smooth scrollbar-none"
            >
              {filteredGroups.map((group) => (
                <div key={group.id} className="space-y-6 flex-none w-[400px]">
                  {/* Interview Header */}
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={group.thumbnail}
                        alt={group.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
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
                  <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-300px)] pr-2 scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300 relative">
                    {group.chapters.map((chapter, index) => (
                      <Link 
                        key={`${group.id}-${index}`}
                        href={`/video/${group.id}?t=${chapter.time.start}`}
                        className="block"
                      >
                        <Card className="overflow-hidden hover:shadow-lg transition-all hover:bg-gray-50 group">
                          <div className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-16 text-sm text-gray-500 pt-1">
                                {chapter.timecode}
                              </div>
                              <div className="flex-1">
                                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {chapter.title}
                                </h3>
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                  {chapter.synopsis}
                                </p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                            </div>
                          </div>
                        </Card>
                      </Link>
                    ))}
                    <div className="absolute right-0 bottom-0 h-24 w-full bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 