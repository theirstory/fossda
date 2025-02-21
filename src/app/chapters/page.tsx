"use client";

import { videoData } from "@/data/videos";
import { chapterData } from "@/data/chapters";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { Clock, Search, ChevronRight, ChevronLeft, Check, ChevronDown, X } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import KeywordFilter from "@/components/KeywordFilter";
import React from "react";

interface KeywordGroup {
  id: string;
  keywords: string[];
  operator: 'AND' | 'OR' | 'NOT';
  groupOperator: 'AND' | 'OR' | 'NOT';
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query) return text;
  
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={i} className="bg-yellow-200">{part}</span>
        ) : (
          part
        )
      )}
    </>
  );
}

export default function ChaptersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInterviews, setSelectedInterviews] = useState<string[]>(
    Object.entries(chapterData).map(([videoId]) => videoId)
  );
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [keywordGroups, setKeywordGroups] = useState<KeywordGroup[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Calculate keyword frequencies across all chapters
  const keywordFrequencies = useMemo(() => {
    const frequencies: Record<string, number> = {};
    Object.values(chapterData).forEach(interview => {
      interview.metadata.forEach(chapter => {
        chapter.tags?.forEach(tag => {
          frequencies[tag] = (frequencies[tag] || 0) + 1;
        });
      });
    });
    return frequencies;
  }, []);

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

  // Filter chapters based on search, selected interviews, and keyword groups
  const filteredGroups = groupedChapters
    .filter(group => selectedInterviews.includes(group.id))
    .map(group => ({
      ...group,
      chapters: group.chapters.filter(chapter => {
        // Text search filter
        const matchesSearch = searchQuery
          ? chapter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            chapter.synopsis?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            chapter.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
          : true;

        // Evaluate all keyword groups
        const matchesKeywords = keywordGroups.length === 0 ? true :
          keywordGroups.reduce((matches, group, index) => {
            // Evaluate current group
            const groupMatches = group.operator === 'NOT'
              ? !group.keywords.some(keyword => chapter.tags?.includes(keyword))
              : group.operator === 'AND'
                ? group.keywords.every(keyword => chapter.tags?.includes(keyword))
                : group.keywords.some(keyword => chapter.tags?.includes(keyword));

            // First group sets initial value
            if (index === 0) return groupMatches;

            // Apply group operator
            switch (group.groupOperator) {
              case 'AND': return matches && groupMatches;
              case 'OR': return matches || groupMatches;
              case 'NOT': return matches && !groupMatches;
              default: return matches;
            }
          }, false);

        return matchesSearch && matchesKeywords;
      })
    }))
    .filter(group => group.chapters.length > 0);

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
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gray-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '30px 30px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
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

      {/* Chapters Grid */}
      <div className="bg-gray-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {/* Search and Filter Options */}
          <div className="pt-6 pb-4 space-y-4">
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input 
                  placeholder="Search chapters by title or content..." 
                  className="pl-9 h-9"
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

              {/* Filter Buttons */}
              <div className="flex gap-4">
                {/* Keyword Filter */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[200px] justify-between h-9">
                      <span className="truncate flex items-center gap-2">
                        <span className="text-muted-foreground">Filter by keyword</span>
                        <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                          {selectedKeywords.length}
                        </Badge>
                      </span>
                      <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[800px] p-4" align="start" side="bottom" sideOffset={8}>
                    <KeywordFilter
                      selectedKeywords={selectedKeywords}
                      onKeywordsChange={setSelectedKeywords}
                      keywordGroups={keywordGroups}
                      onKeywordGroupsChange={setKeywordGroups}
                      frequencies={keywordFrequencies}
                    />
                  </PopoverContent>
                </Popover>

                {/* Interview Selection */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[200px] justify-between h-9">
                      <span className="truncate flex items-center gap-2">
                        <span className="text-muted-foreground">Filter by interview</span>
                        <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                          {selectedInterviews.length}
                        </Badge>
                      </span>
                      <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-2" align="start">
                    <div className="space-y-2">
                      <div className="flex gap-2 pb-2 border-b">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-8"
                          onClick={() => setSelectedInterviews(groupedChapters.map(g => g.id))}
                        >
                          Select all
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-8"
                          onClick={() => setSelectedInterviews([])}
                        >
                          Clear all
                        </Button>
                      </div>
                      <div className="text-sm text-muted-foreground pb-1">
                        Select multiple interviews:
                      </div>
                      {groupedChapters.map((interview) => (
                        <div
                          key={interview.id}
                          role="button"
                          onClick={() => {
                            setSelectedInterviews((prev) =>
                              prev.includes(interview.id)
                                ? prev.filter((id) => id !== interview.id)
                                : [...prev, interview.id]
                            );
                          }}
                          className={cn(
                            "flex items-center gap-2 px-2 py-1.5 rounded-sm text-sm relative select-none",
                            "hover:bg-accent hover:text-accent-foreground cursor-pointer",
                            selectedInterviews.includes(interview.id) && "bg-accent"
                          )}
                        >
                          <div className={cn(
                            "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                            selectedInterviews.includes(interview.id)
                              ? "bg-primary text-primary-foreground"
                              : "opacity-50"
                          )}>
                            <Check className={cn(
                              "h-3 w-3",
                              selectedInterviews.includes(interview.id) ? "opacity-100" : "opacity-0"
                            )} />
                          </div>
                          <span>{interview.title}</span>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Selected Filters Summary */}
            <div className="flex flex-wrap gap-2">
              {/* Selected Interviews */}
              {selectedInterviews.length > 0 && selectedInterviews.length < groupedChapters.length && (
                <div className="flex flex-wrap gap-2">
                  {groupedChapters
                    .filter(interview => selectedInterviews.includes(interview.id))
                    .map((interview) => (
                      <Badge 
                        key={interview.id}
                        variant="secondary"
                        className="flex items-center gap-1 pr-1"
                      >
                        <span>{interview.title}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 hover:bg-transparent"
                          onClick={() => setSelectedInterviews(prev => 
                            prev.filter(id => id !== interview.id)
                          )}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </Badge>
                  ))}
                </div>
              )}

              {/* Selected Keyword Groups */}
              {keywordGroups.map((group, index) => (
                <div key={group.id} className="flex items-center gap-1">
                  {index > 0 && (
                    <span className="text-sm text-gray-500">
                      {group.groupOperator}
                    </span>
                  )}
                  <div className="flex items-center gap-1 border rounded-lg px-2 py-1">
                    {group.keywords.map((keyword, kIndex) => (
                      <React.Fragment key={keyword}>
                        <Badge variant="default" className="bg-blue-600">
                          {keyword}
                        </Badge>
                        {kIndex < group.keywords.length - 1 && (
                          <span className="text-xs font-medium">{group.operator}</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            {/* Left Edge Gradient */}
            {canScrollLeft && (
              <>
                <div className="sticky left-4 top-[60%] z-50 float-left">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full bg-white shadow-lg border-gray-200 hover:bg-gray-50"
                    onClick={() => scroll('left')}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                </div>
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none z-40" />
              </>
            )}

            {/* Right Edge Gradient */}
            {canScrollRight && (
              <>
                <div className="sticky right-4 top-[60%] z-50 float-right">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full bg-white shadow-lg border-gray-200 hover:bg-gray-50"
                    onClick={() => scroll('right')}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none z-40" />
              </>
            )}

            {/* Scrollable Content */}
            <div 
              ref={scrollContainerRef}
              className="flex overflow-x-auto gap-8 pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 scroll-smooth scrollbar-none relative"
            >
              {filteredGroups.map((group) => (
                <div key={group.id} className="space-y-6 flex-none w-[500px]">
                  {/* Interview Header */}
                  <Link href={`/video/${group.id}`} className="flex items-center gap-4 group">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 group-hover:ring-2 group-hover:ring-blue-500 transition-all">
                      <Image
                        src={group.thumbnail}
                        alt={group.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {group.title}
                      </h2>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Clock className="h-4 w-4" />
                        {group.duration}
                        <span className="mx-2">•</span>
                        {group.chapters.length} chapters
                      </div>
                    </div>
                  </Link>

                  {/* Chapters Timeline */}
                  <div className="space-y-3 relative">
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
                                  {highlightText(chapter.title, searchQuery)}
                                </h3>
                                <p className="text-xs text-gray-600 mt-1">
                                  {highlightText(chapter.synopsis || "", searchQuery)}
                                </p>
                                {chapter.tags && chapter.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 mt-2">
                                    {chapter.tags.map((tag, i) => (
                                      <Badge 
                                        key={i} 
                                        variant="secondary" 
                                        className={cn(
                                          "text-[10px] flex items-center gap-1",
                                          selectedKeywords.includes(tag)
                                            ? "bg-blue-100 text-blue-800 border-blue-200"
                                            : searchQuery && tag.toLowerCase().includes(searchQuery.toLowerCase())
                                              ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        )}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          const newGroup: KeywordGroup = {
                                            id: Math.random().toString(),
                                            keywords: [tag],
                                            operator: 'AND',
                                            groupOperator: 'AND'
                                          };
                                          setKeywordGroups([...keywordGroups, newGroup]);
                                          setSelectedKeywords([...selectedKeywords, tag]);
                                        }}
                                      >
                                        <span>{tag}</span>
                                        <span className={cn(
                                          "text-[8px] px-1 rounded",
                                          selectedKeywords.includes(tag)
                                            ? "bg-blue-200"
                                            : searchQuery && tag.toLowerCase().includes(searchQuery.toLowerCase())
                                              ? "bg-yellow-200"
                                              : "bg-gray-200"
                                        )}>
                                          {keywordFrequencies[tag] || 0}
                                        </span>
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
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
      </div>
    </main>
  );
} 