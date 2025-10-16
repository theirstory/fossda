"use client";

import { videoData } from "@/data/videos";
import { chapterData } from "@/data/chapters";
import { clips } from "@/data/clips";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { Clock, Search, ChevronRight, ChevronLeft, Check, ChevronDown, X, ListVideo, Film } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import KeywordFilter from "@/components/KeywordFilter";
import React from "react";
import { ChapterMetadata, TranscriptIndex } from "@/types/transcript";
import { VideoId } from "@/data/videos";
import { Clip } from "@/types";

interface KeywordGroup {
  id: string;
  keywords: string[];
  operator: 'AND' | 'OR' | 'NOT';
  groupOperator: 'AND' | 'OR' | 'NOT';
}

interface VideoData {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  summary: string;
  sentence: string;
}

interface Chapter extends ChapterMetadata {
  id: string;
  interviewId: VideoId;
  chapterIndex: number;
}

interface GroupedChapter {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  chapters: Chapter[];
}

interface GroupedClip {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  clips: Clip[];
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
  const [viewMode, setViewMode] = React.useState<'chapters' | 'clips'>('chapters');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedInterviews, setSelectedInterviews] = React.useState<string[]>([]);
  const [selectedKeywords, setSelectedKeywords] = React.useState<string[]>([]);
  const [keywordGroups, setKeywordGroups] = React.useState<KeywordGroup[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Calculate keyword frequencies across all chapters
  const keywordStats = useMemo(() => {
    const stats: Record<string, { total: number; interviews: number }> = {};
    
    Object.values(chapterData).forEach((interview: TranscriptIndex) => {
      // Track which keywords appear in this interview
      const interviewKeywords = new Set<string>();
      
      interview.metadata.forEach((chapter: ChapterMetadata) => {
        chapter.tags?.forEach((tag: string) => {
          // Initialize if not exists
          if (!stats[tag]) {
            stats[tag] = { total: 0, interviews: 0 };
          }
          // Increment total count
          stats[tag].total++;
          // Track if this is the first time we've seen this keyword in this interview
          if (!interviewKeywords.has(tag)) {
            interviewKeywords.add(tag);
            stats[tag].interviews++;
          }
        });
      });
    });
    
    return stats;
  }, []);

  // Filter out any chapters that don't have corresponding video data
  const groupedChapters: GroupedChapter[] = Object.entries(chapterData)
    .filter(([videoId]) => (videoData as Record<string, VideoData>)[videoId]) // Only include chapters where video data exists
    .map(([videoId, chapterInfo]) => ({
      id: videoId as VideoId,
      title: (videoData as Record<string, VideoData>)[videoId].title,
      thumbnail: (videoData as Record<string, VideoData>)[videoId].thumbnail,
      duration: (videoData as Record<string, VideoData>)[videoId].duration,
      chapters: chapterInfo.metadata.map((chapter: ChapterMetadata, index: number) => ({
        ...chapter,
        id: `${videoId}-${index}`,
        interviewId: videoId as VideoId,
        chapterIndex: index
      })),
    }));

  // Group clips by interview - maintain same order as chapters
  const groupedClips: GroupedClip[] = useMemo(() => {
    const clipsByInterview: Record<string, Clip[]> = {};
    
    clips.forEach((clip) => {
      if (!clipsByInterview[clip.interviewId]) {
        clipsByInterview[clip.interviewId] = [];
      }
      clipsByInterview[clip.interviewId].push(clip);
    });

    // Use the same order as groupedChapters to ensure consistency
    const chapterOrder = groupedChapters.map(g => g.id);
    
    return chapterOrder
      .filter(videoId => clipsByInterview[videoId] && (videoData as Record<string, VideoData>)[videoId])
      .map(videoId => ({
        id: videoId,
        title: (videoData as Record<string, VideoData>)[videoId].title,
        thumbnail: (videoData as Record<string, VideoData>)[videoId].thumbnail,
        duration: (videoData as Record<string, VideoData>)[videoId].duration,
        clips: clipsByInterview[videoId],
      }));
  }, [groupedChapters]);

  // Filter chapters based on search, selected interviews, and keyword groups
  const filteredChapters = useMemo(() => {
    return groupedChapters
      .filter(group => selectedInterviews.length === 0 || selectedInterviews.includes(group.id))
      .map(group => ({
        ...group,
        chapters: group.chapters.filter((chapter: Chapter) => {
          // Search filter
          const matchesSearch = searchQuery === '' || 
            chapter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            chapter.synopsis.toLowerCase().includes(searchQuery.toLowerCase()) ||
            chapter.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

          if (!matchesSearch) return false;

          // Keyword group filter
          if (keywordGroups.length === 0) return true;

          return keywordGroups.reduce((matches, group, index) => {
            const chapterTags = new Set(chapter.tags?.map(t => t.toLowerCase()));
            const groupKeywords = group.keywords.map(k => k.toLowerCase());

            // First evaluate the keywords within the group using the group's operator
            const groupMatches = (() => {
              switch (group.operator) {
                case 'AND':
                  return groupKeywords.every(keyword => chapterTags.has(keyword));
                case 'OR':
                  return groupKeywords.some(keyword => chapterTags.has(keyword));
                case 'NOT':
                  return !groupKeywords.some(keyword => chapterTags.has(keyword));
                default:
                  return true;
              }
            })();

            // For the first group, just return its result
            if (index === 0) return groupMatches;

            // For subsequent groups, combine with previous results using the groupOperator
            switch (group.groupOperator) {
              case 'AND':
                return matches && groupMatches;
              case 'OR':
                return matches || groupMatches;
              case 'NOT':
                return matches && !groupMatches;
              default:
                return matches;
            }
          }, true);
        })
      }))
      .filter(group => group.chapters.length > 0);
  }, [groupedChapters, selectedInterviews, searchQuery, keywordGroups]);

  // Filter clips based on search, selected interviews, and keyword groups
  const filteredClips = useMemo(() => {
    return groupedClips
      .filter(group => selectedInterviews.length === 0 || selectedInterviews.includes(group.id))
      .map(group => ({
        ...group,
        clips: group.clips.filter((clip: Clip) => {
          // Search filter
          const matchesSearch = searchQuery === '' || 
            clip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            clip.transcript.toLowerCase().includes(searchQuery.toLowerCase()) ||
            clip.themes?.some((theme: string) => theme.toLowerCase().includes(searchQuery.toLowerCase()));

          if (!matchesSearch) return false;

          // Keyword group filter - clips have themes instead of tags
          if (keywordGroups.length === 0) return true;

          return keywordGroups.reduce((matches, group, index) => {
            const clipThemes = new Set(clip.themes?.map(t => t.toLowerCase()));
            const groupKeywords = group.keywords.map(k => k.toLowerCase());

            // First evaluate the keywords within the group using the group's operator
            const groupMatches = (() => {
              switch (group.operator) {
                case 'AND':
                  return groupKeywords.every(keyword => clipThemes.has(keyword));
                case 'OR':
                  return groupKeywords.some(keyword => clipThemes.has(keyword));
                case 'NOT':
                  return !groupKeywords.some(keyword => clipThemes.has(keyword));
                default:
                  return true;
              }
            })();

            // For the first group, just return its result
            if (index === 0) return groupMatches;

            // For subsequent groups, combine with previous results using the groupOperator
            switch (group.groupOperator) {
              case 'AND':
                return matches && groupMatches;
              case 'OR':
                return matches || groupMatches;
              case 'NOT':
                return matches && !groupMatches;
              default:
                return matches;
            }
          }, true);
        })
      }))
      .filter(group => group.clips.length > 0);
  }, [groupedClips, selectedInterviews, searchQuery, keywordGroups]);

  // Check scroll position
  useEffect(() => {
    const checkScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      checkScroll();
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScroll);
      }
      window.removeEventListener('resize', checkScroll);
    };
  }, [filteredChapters, filteredClips, viewMode]);

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

        <div className="relative max-w-7xl mx-auto px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Interview Chapters
            </h1>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto">
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
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 lg:gap-4">
              {/* Search */}
              <div className="relative w-full lg:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input 
                  placeholder={viewMode === 'chapters' ? "Search chapters..." : "Search clips..."} 
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
              <div className="flex gap-2 lg:gap-4 flex-shrink-0">
                {/* Keyword Filter */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1 lg:w-[200px] justify-between h-9">
                      <span className="truncate flex items-center gap-2">
                        <span className="text-muted-foreground hidden sm:inline">Filter by keyword</span>
                        <span className="text-muted-foreground sm:hidden">Keywords</span>
                        <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                          {selectedKeywords.length}
                        </Badge>
                      </span>
                      <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[calc(100vw-2rem)] sm:w-[600px] lg:w-[800px] p-4" align="start" side="bottom" sideOffset={8}>
                    <div data-keyword-filter>
                      <KeywordFilter
                        selectedKeywords={selectedKeywords}
                        onKeywordsChange={setSelectedKeywords}
                        keywordGroups={keywordGroups}
                        onKeywordGroupsChange={setKeywordGroups}
                        frequencies={keywordStats}
                      />
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Interview Selection */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1 lg:w-[200px] justify-between h-9">
                      <span className="truncate flex items-center gap-2">
                        <span className="text-muted-foreground hidden sm:inline">Filter by interview</span>
                        <span className="text-muted-foreground sm:hidden">Interviews</span>
                        <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                          {selectedInterviews.length}
                        </Badge>
                      </span>
                      <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[calc(100vw-2rem)] sm:w-[200px] p-2" align="start">
                    <div className="space-y-2">
                      <div className="flex gap-2 pb-2 border-b">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-8"
                          onClick={() => setSelectedInterviews(viewMode === 'chapters' ? groupedChapters.map(g => g.id) : groupedClips.map(g => g.id))}
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
                      {(viewMode === 'chapters' ? groupedChapters : groupedClips).map((interview) => (
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

              {/* View Mode Toggle */}
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'chapters' | 'clips')} className="w-full lg:w-auto flex-shrink-0">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="chapters" className="flex items-center gap-2">
                    <ListVideo className="h-4 w-4" />
                    <span className="hidden sm:inline">Chapters</span>
                    <span className="sm:hidden">Ch</span>
                  </TabsTrigger>
                  <TabsTrigger value="clips" className="flex items-center gap-2">
                    <Film className="h-4 w-4" />
                    <span className="hidden sm:inline">Clips</span>
                    <span className="sm:hidden">Cl</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Selected Filters Summary */}
            <div className="flex flex-wrap gap-2">
              {/* Selected Interviews */}
              {selectedInterviews.length > 0 && selectedInterviews.length < (viewMode === 'chapters' ? groupedChapters : groupedClips).length && (
                <div className="flex flex-wrap gap-2">
                  {(viewMode === 'chapters' ? groupedChapters : groupedClips)
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
            {/* Left Edge Gradient - Hide on mobile */}
            {canScrollLeft && (
              <>
                <div className="hidden lg:block sticky left-4 top-[60%] z-50 float-left">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full bg-white shadow-lg border-gray-200 hover:bg-gray-50"
                    onClick={() => scroll('left')}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                </div>
                <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none z-40" />
              </>
            )}

            {/* Right Edge Gradient - Hide on mobile */}
            {canScrollRight && (
              <>
                <div className="hidden lg:block sticky right-4 top-[60%] z-50 float-right">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full bg-white shadow-lg border-gray-200 hover:bg-gray-50"
                    onClick={() => scroll('right')}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </div>
                <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none z-40" />
              </>
            )}

            {/* Scrollable Content */}
            <div 
              ref={scrollContainerRef}
              className="flex flex-col lg:flex-row lg:overflow-x-auto gap-6 lg:gap-8 pb-4 scroll-smooth scrollbar-none relative"
            >
              {viewMode === 'chapters' ? filteredChapters.map((group) => (
                <div key={group.id} className="space-y-4 lg:space-y-6 flex-none w-full lg:w-[500px]">
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
                                    {chapter.tags.map((tag, i) => {
                                      const isSelected = keywordGroups.some(group => 
                                        group.keywords.includes(tag)
                                      );
                                      return (
                                        <Badge
                                          key={i}
                                          variant={isSelected ? "default" : "outline"}
                                          className={cn(
                                            "flex items-center gap-1",
                                            isSelected && "bg-blue-600 text-white hover:bg-blue-700"
                                          )}
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            // If there's no active group, create one
                                            if (keywordGroups.length === 0) {
                                              const newGroup: { id: string; keywords: string[]; operator: 'AND' | 'OR' | 'NOT'; groupOperator: 'AND' | 'OR' | 'NOT' } = {
                                                id: Math.random().toString(),
                                                keywords: [tag],
                                                operator: 'AND',
                                                groupOperator: 'AND'
                                              };
                                              setKeywordGroups([newGroup]);
                                              setSelectedKeywords([...selectedKeywords, tag]);
                                              // Set the active group in the filter
                                              setTimeout(() => {
                                                const filterElement = document.querySelector('[data-keyword-filter]');
                                                if (filterElement) {
                                                  filterElement.dispatchEvent(new CustomEvent('setActiveGroup', { 
                                                    detail: { groupId: newGroup.id },
                                                    bubbles: true
                                                  }));
                                                }
                                              }, 0);
                                            } else {
                                              // Add to the last group
                                              const lastGroup = keywordGroups[keywordGroups.length - 1];
                                              if (!lastGroup.keywords.includes(tag)) {
                                                setKeywordGroups(
                                                  keywordGroups.map((group, idx) =>
                                                    idx === keywordGroups.length - 1
                                                      ? { ...group, keywords: [...group.keywords, tag] }
                                                      : group
                                                  )
                                                );
                                                setSelectedKeywords([...selectedKeywords, tag]);
                                                // Set the active group in the filter
                                                setTimeout(() => {
                                                  const filterElement = document.querySelector('[data-keyword-filter]');
                                                  if (filterElement) {
                                                    filterElement.dispatchEvent(new CustomEvent('setActiveGroup', { 
                                                      detail: { groupId: lastGroup.id },
                                                      bubbles: true
                                                    }));
                                                  }
                                                }, 0);
                                              }
                                            }
                                          }}
                                        >
                                          {tag}
                                          <div className="flex gap-1">
                                            <span className={cn(
                                              "text-xs rounded-sm px-1",
                                              isSelected
                                                ? "bg-blue-700/50"
                                                : "bg-gray-200"
                                            )}>
                                              {keywordStats[tag]?.total || 0}
                                            </span>
                                            <span className={cn(
                                              "text-xs rounded-sm px-1",
                                              isSelected
                                                ? "bg-blue-700/50"
                                                : "bg-gray-200/50"
                                            )}>
                                              {keywordStats[tag]?.interviews || 0}🎙️
                                            </span>
                                          </div>
                                        </Badge>
                                      );
                                    })}
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
              )) : filteredClips.map((group) => (
                <div key={group.id} className="space-y-4 lg:space-y-6 flex-none w-full lg:w-[500px]">
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
                        {group.clips.length} clips
                      </div>
                    </div>
                  </Link>

                  {/* Clips Timeline */}
                  <div className="space-y-3 relative">
                    {group.clips.map((clip) => {
                      const minutes = Math.floor(clip.startTime / 60);
                      const seconds = Math.floor(clip.startTime % 60);
                      const timecode = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                      
                      return (
                        <Link 
                          key={clip.id}
                          href={`/video/${group.id}?t=${clip.startTime}&end=${clip.endTime}`}
                          className="block"
                        >
                          <Card className="overflow-hidden hover:shadow-lg transition-all hover:bg-gray-50 group">
                            <div className="p-4">
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-16 text-sm text-gray-500 pt-1">
                                  {timecode}
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {highlightText(clip.title, searchQuery)}
                                  </h3>
                                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                    {highlightText(clip.transcript || "", searchQuery)}
                                  </p>
                                  {clip.themes && clip.themes.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                      {clip.themes.map((theme, i) => {
                                        const isSelected = keywordGroups.some(group => 
                                          group.keywords.includes(theme)
                                        );
                                        return (
                                          <Badge
                                            key={i}
                                            variant={isSelected ? "default" : "outline"}
                                            className={cn(
                                              "text-xs",
                                              isSelected && "bg-blue-600 text-white hover:bg-blue-700"
                                            )}
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              // If there's no active group, create one
                                              if (keywordGroups.length === 0) {
                                                const newGroup: { id: string; keywords: string[]; operator: 'AND' | 'OR' | 'NOT'; groupOperator: 'AND' | 'OR' | 'NOT' } = {
                                                  id: Math.random().toString(),
                                                  keywords: [theme],
                                                  operator: 'AND',
                                                  groupOperator: 'AND'
                                                };
                                                setKeywordGroups([newGroup]);
                                                setSelectedKeywords([...selectedKeywords, theme]);
                                              } else {
                                                // Add to the last group
                                                const lastGroup = keywordGroups[keywordGroups.length - 1];
                                                if (!lastGroup.keywords.includes(theme)) {
                                                  setKeywordGroups(
                                                    keywordGroups.map((group, idx) =>
                                                      idx === keywordGroups.length - 1
                                                        ? { ...group, keywords: [...group.keywords, theme] }
                                                        : group
                                                    )
                                                  );
                                                  setSelectedKeywords([...selectedKeywords, theme]);
                                                }
                                              }
                                            }}
                                          >
                                            {theme}
                                          </Badge>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                              </div>
                            </div>
                          </Card>
                        </Link>
                      );
                    })}
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