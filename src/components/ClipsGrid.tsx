"use client";

import React from "react";
import { Clip } from "@/types";
import { Theme } from "@/data/themes";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { videoData } from "@/data/videos";
import Link from "next/link";
import Image from "next/image";
import { Search, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { iconMap } from "@/data/icons";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface ClipsGridProps {
  clips: Clip[];
  interviewees: { id: string; title: string; }[];
  themes: Theme[];
  variant?: 'filters' | 'clips';
  selectedInterviewees?: string[];
  setSelectedInterviewees?: React.Dispatch<React.SetStateAction<string[]>>;
  selectedThemes?: string[];
  setSelectedThemes?: React.Dispatch<React.SetStateAction<string[]>>;
  searchQuery?: string;
  setSearchQuery?: React.Dispatch<React.SetStateAction<string>>;
  hideSearch?: boolean;
}

// Add a default thumbnail URL - you can replace this with your own default image
const DEFAULT_THUMBNAIL = '/images/default-thumbnail.jpg';

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

export default function ClipsGrid({ 
  clips, 
  interviewees, 
  themes, 
  variant = 'clips',
  selectedInterviewees = [],
  setSelectedInterviewees,
  selectedThemes = [],
  setSelectedThemes,
  searchQuery = "",
  setSearchQuery,
  hideSearch = false
}: ClipsGridProps) {
  const filteredClips = clips.filter(clip => {
    const matchesInterviewee = selectedInterviewees.length === 0 || 
                              selectedInterviewees.includes(clip.interviewId);
    const matchesTheme = selectedThemes.length === 0 || 
                        clip.themes.some(theme => selectedThemes.includes(theme));
    const matchesSearch = !searchQuery || 
                         clip.transcript.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         clip.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesInterviewee && matchesTheme && matchesSearch;
  });

  function formatDuration(duration: number): string {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  const handleIntervieweeChange = (value: string) => {
    if (setSelectedInterviewees) {
      setSelectedInterviewees((prev: string[]) => {
        if (prev.includes(value)) {
          return prev.filter((id: string) => id !== value);
        }
        return [...prev, value];
      });
    }
  };

  const handleThemeChange = (value: string) => {
    if (setSelectedThemes) {
      setSelectedThemes((prev: string[]) => {
        if (prev.includes(value)) {
          return prev.filter((id: string) => id !== value);
        }
        return [...prev, value];
      });
    }
  };

  const renderFilters = () => (
    <div className="space-y-4">
      {/* Filter Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Filter className="h-4 w-4" />
          <span>Filter clips by:</span>
        </div>

        {/* Interviewees */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Interviewees</label>
          <div className="flex flex-col gap-2">
            {interviewees.map((interviewee) => (
              <Badge
                key={interviewee.id}
                variant={selectedInterviewees.includes(interviewee.id) ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-colors justify-start",
                  selectedInterviewees.includes(interviewee.id) 
                    ? "bg-blue-600 hover:bg-blue-700" 
                    : "hover:bg-gray-100"
                )}
                onClick={() => handleIntervieweeChange(interviewee.id)}
              >
                {interviewee.title}
              </Badge>
            ))}
          </div>
        </div>

        {/* Themes */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Themes</label>
          <div className="flex flex-col gap-2">
            {themes.map((theme) => (
              <Badge
                key={theme.id}
                variant={selectedThemes.includes(theme.id) ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-colors justify-start gap-2",
                  selectedThemes.includes(theme.id)
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "hover:bg-gray-100"
                )}
                onClick={() => handleThemeChange(theme.id)}
              >
                {React.createElement(iconMap[theme.iconName], {
                  className: "h-4 w-4",
                  style: { color: theme.iconColor }
                })}
                {theme.title}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (variant === 'filters') {
    return (
      <div className="space-y-4">
        {/* Search - Only show if not hidden */}
        {!hideSearch && (
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              placeholder="Search clips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery?.(e.target.value)}
              className="pl-10 bg-gray-50 border-0"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 hover:bg-gray-100"
                onClick={() => setSearchQuery?.("")}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>
        )}

        {/* Mobile Filter Button */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                {renderFilters()}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Filters */}
        <div className="hidden lg:block">
          {renderFilters()}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results count */}
      <div className="text-sm text-gray-600 pb-3 border-b">
        Showing {filteredClips.length} {filteredClips.length === 1 ? 'clip' : 'clips'}
      </div>

      {/* Clips Grid */}
      <div className="grid gap-4">
        {filteredClips.map(clip => {
          const video = videoData[clip.interviewId];
          return (
            <div 
              key={clip.id}
              className="group bg-white rounded-lg overflow-hidden shadow-sm transform transition duration-300 hover:shadow-md hover:scale-[1.01]"
            >
              <div className="flex flex-col lg:flex-row gap-4 p-3">
                <div className="relative w-full lg:w-48 flex-shrink-0">
                  <Link href={`/video/${clip.interviewId}?t=${clip.startTime}&end=${clip.endTime}`}>
                    <div className="relative aspect-video rounded-lg overflow-hidden">
                      <Image
                        src={video.thumbnail || DEFAULT_THUMBNAIL}
                        alt={video.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute bottom-2 right-2">
                        <Badge variant="secondary" className="bg-black/70 text-white border-0">
                          {formatDuration(clip.duration)}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <div>
                    <Link href={`/video/${clip.interviewId}?t=${clip.startTime}&end=${clip.endTime}`}>
                      <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {highlightText(clip.title, searchQuery)}
                      </h3>
                      <div className="text-sm text-gray-500">
                        From: {video.title} • {clip.chapter.title}
                      </div>
                    </Link>
                  </div>
                  
                  <Link href={`/video/${clip.interviewId}?t=${clip.startTime}&end=${clip.endTime}`}>
                    <blockquote className="text-gray-700 border-l-4 pl-4 italic line-clamp-2 text-sm">
                      {highlightText(clip.transcript, searchQuery)}
                    </blockquote>
                  </Link>
                  
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex flex-wrap gap-1">
                      {clip.themes.map(themeId => {
                        const theme = themes.find(t => t.id === themeId);
                        return theme ? (
                          <div key={themeId}>
                            <Link href={`/theme/${themeId}`}>
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "transition-colors text-xs",
                                  theme.color.replace('hover:', ''),
                                  "hover:border-transparent"
                                )}
                              >
                                {theme.title}
                              </Badge>
                            </Link>
                          </div>
                        ) : null;
                      })}
                    </div>
                    
                    <Link 
                      href={`/video/${clip.interviewId}?t=${clip.startTime}&end=${clip.endTime}`}
                      className="text-sm text-blue-600 group-hover:text-blue-800 transition-colors whitespace-nowrap"
                    >
                      Watch in Interview →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 