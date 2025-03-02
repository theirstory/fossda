"use client";

import { stories, groupStoriesByInterview } from "@/data/stories";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Search, Clock, User, ChevronRight, X, ArrowLeft, ArrowRight, BookOpen, MessageSquare, Tags } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import Image from "next/image";

export default function StoriesPage() {
  const groupedStories = groupStoriesByInterview(stories);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'arc' | 'questions' | 'themes'>('questions');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);

  // Filter stories based on search query
  const filteredGroups = groupedStories.filter(group => {
    const matchInTitle = group.interviewTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchInStories = group.stories.some(story => 
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.conflict.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.resolution.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return matchInTitle || matchInStories;
  });

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
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gray-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '30px 30px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Personal Stories
            </h1>
            <p className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto">
              Browse through personal stories and experiences from our interviews. Each story captures unique moments of challenge, growth, and insight.
            </p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input 
              placeholder="Search stories by title, conflict, or resolution..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 hover:bg-gray-100"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex bg-white rounded-lg shadow-sm p-1 gap-1">
            <Button
              variant={viewMode === 'questions' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('questions')}
              className="gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Questions</span>
            </Button>
            <Button
              variant={viewMode === 'arc' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('arc')}
              className="gap-2"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Arcs</span>
            </Button>
            <Button
              variant={viewMode === 'themes' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('themes')}
              className="gap-2"
            >
              <Tags className="h-4 w-4" />
              <span className="hidden sm:inline">Themes</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Stories Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Scroll Buttons */}
        {showLeftScroll && (
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg rounded-full"
            onClick={() => scroll('left')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        {showRightScroll && (
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg rounded-full"
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
          {filteredGroups.map((group) => (
            <div key={group.interviewId} className="flex-none w-[400px] space-y-4">
              {/* Interview Header */}
              <Link href={`/video/${group.interviewId}`} className="group block">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 group-hover:ring-2 ring-blue-500">
                    <Image
                      src={group.thumbnail}
                      alt={group.interviewTitle}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold group-hover:text-blue-600 transition-colors">{group.interviewTitle}</h2>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{group.duration}</span>
                      <span>•</span>
                      <span>{group.stories.length} stories</span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Stories List */}
              <div className="space-y-3">
                {group.stories.map((story) => (
                  <Link
                    key={story.id}
                    href={`/story/${story.id}`}
                    className="block"
                  >
                    <div className="group bg-white rounded-lg border p-4 hover:border-blue-500 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-sm group-hover:text-blue-600 transition-colors line-clamp-2">
                            {story.title}
                          </h3>
                          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                            <User className="h-3 w-3" />
                            <span className="line-clamp-1">{story.character.role}</span>
                            <span>•</span>
                            <span>{story.chapterRef.timecode}</span>
                          </div>
                          {viewMode === 'arc' && (
                            <div className="mt-2 space-y-2">
                              <p className="text-sm text-gray-600 line-clamp-2">
                                <span className="font-medium">Conflict:</span> {story.conflict}
                              </p>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                <span className="font-medium">Resolution:</span> {story.resolution}
                              </p>
                              {story.lesson && (
                                <p className="text-sm text-gray-600 italic line-clamp-2">
                                  <span className="font-medium not-italic">Lesson:</span> {story.lesson}
                                </p>
                              )}
                            </div>
                          )}
                          {viewMode === 'questions' && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-600 line-clamp-2">
                                <span className="font-medium">Q:</span> {story.elicitingQuestion}
                              </p>
                            </div>
                          )}
                          {viewMode === 'themes' && (
                            <div className="mt-2 space-y-2">
                              <div className="flex flex-wrap gap-1">
                                {story.themes.map((theme) => (
                                  <span
                                    key={theme}
                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                                  >
                                    {theme}
                                  </span>
                                ))}
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {story.values.map((value) => (
                                  <span
                                    key={value}
                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700"
                                  >
                                    {value}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0 mt-1" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
} 