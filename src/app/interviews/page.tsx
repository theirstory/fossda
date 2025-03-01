"use client";

import { videoData } from "@/data/videos";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight, LayoutGrid, List, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

export default function InterviewsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const effectiveViewMode = isMobile ? 'grid' : viewMode;

  // Helper function to highlight search terms
  const highlightText = (text: string, query: string) => {
    if (!query) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() ? 
        <span key={i} className="bg-yellow-100">{part}</span> : 
        part
    );
  };

  const filteredInterviews = Object.values(videoData).filter(interview => {
    const query = searchQuery.toLowerCase();
    return (
      interview.title.toLowerCase().includes(query) ||
      interview.summary.toLowerCase().includes(query)
    );
  });

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

        <div className="relative max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              FOSSDA Interviews
            </h1>
            <p className="mt-2 text-lg text-gray-300 max-w-3xl mx-auto">
              Explore in-depth conversations with pioneers and leaders of the open source movement.
              Each interview captures unique perspectives and experiences that shaped the world of software.
            </p>
          </div>
        </div>
      </div>

      {/* Interviews Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
          {/* Search Box */}
          <div className="relative w-full sm:w-1/2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input 
              placeholder="Search interviews by title or summary..." 
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

          {/* View Toggle - Hidden on Mobile */}
          <div className="hidden sm:flex bg-white rounded-lg shadow-sm p-1 gap-1 self-start">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="gap-2"
            >
              <List className="h-4 w-4" />
              <span className="inline">List</span>
            </Button>
            <Button
              variant={viewMode === 'list' ? 'ghost' : 'default'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="gap-2"
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="inline">Grid</span>
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Table Header - Only show on desktop list view */}
          {effectiveViewMode === 'list' && (
            <div className="px-4 py-3 bg-gray-50 border-b">
              <div className="grid grid-cols-[200px_250px_1fr_100px] gap-2 font-medium text-sm text-gray-500">
                <div>Thumbnail</div>
                <div>Interview</div>
                <div className="-ml-4">Summary</div>
                <div className="text-center">Duration</div>
              </div>
            </div>
          )}

          {effectiveViewMode === 'grid' ? (
            // Grid View
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {filteredInterviews.map((interview) => (
                <Card key={interview.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <Link href={`/video/${interview.id}`}>
                    <div className="relative aspect-video">
                      <Image
                        src={interview.thumbnail}
                        alt={interview.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute bottom-2 right-2">
                        <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                          <Clock className="h-3 w-3" />
                          {interview.duration}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <h2 className="text-lg font-semibold text-gray-900 mb-2">
                        {highlightText(interview.title, searchQuery)}
                      </h2>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {highlightText(interview.summary, searchQuery)}
                      </p>
                      <div className="flex items-center text-sm text-blue-600 font-medium">
                        Watch Interview
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </div>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          ) : (
            // List View (Table Style) - Only shown on desktop
            <div className="divide-y">
              {filteredInterviews.map((interview) => (
                <Link 
                  key={interview.id} 
                  href={`/video/${interview.id}`}
                  className="block sm:grid sm:grid-cols-[200px_250px_1fr_100px] gap-2 p-4 hover:bg-gray-50"
                >
                  {/* Mobile Layout */}
                  <div className="sm:hidden space-y-3">
                    <div className="flex gap-3">
                      {/* Thumbnail */}
                      <div className="relative w-32 aspect-video rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={interview.thumbnail}
                          alt={interview.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        {/* Title and Duration */}
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                            {highlightText(interview.title, searchQuery)}
                          </h3>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {interview.duration}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Summary for mobile */}
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {highlightText(interview.summary, searchQuery)}
                    </p>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden sm:block relative aspect-video rounded-lg overflow-hidden">
                    <Image
                      src={interview.thumbnail}
                      alt={interview.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="hidden sm:block min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {highlightText(interview.title, searchQuery)}
                    </h3>
                  </div>
                  
                  <div className="hidden sm:block text-sm text-gray-500 pr-4 -ml-4">
                    {highlightText(interview.summary, searchQuery)}
                  </div>
                  
                  <div className="hidden sm:block text-sm text-gray-500 text-center">
                    {interview.duration}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 