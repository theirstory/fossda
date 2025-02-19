"use client";

import { useState } from "react";
import React from "react";
import { Clip } from "@/types";
import { Theme } from "@/data/themes";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { videoData } from "@/data/videos";
import Link from "next/link";
import Image from "next/image";

interface ClipsGridProps {
  clips: Clip[];
  interviewees: { id: string; title: string; }[];
  themes: Theme[];
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

export default function ClipsGrid({ clips, interviewees, themes }: ClipsGridProps) {
  const [selectedInterviewees, setSelectedInterviewees] = useState<string[]>([]);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClips = clips.filter(clip => {
    const matchesInterviewee = selectedInterviewees.length === 0 || 
                              selectedInterviewees.includes(clip.interviewId);
    const matchesTheme = selectedThemes.length === 0 || 
                        clip.themes.some(theme => selectedThemes.includes(theme));
    const matchesSearch = clip.transcript.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         clip.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesInterviewee && matchesTheme && matchesSearch;
  });

  function formatDuration(duration: number): string {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  const handleIntervieweeChange = (value: string) => {
    const intervieweeId = value;
    setSelectedInterviewees(prev => {
      if (prev.includes(intervieweeId)) {
        return prev.filter(id => id !== intervieweeId);
      }
      return [...prev, intervieweeId];
    });
  };

  const handleThemeChange = (value: string) => {
    const themeId = value;
    setSelectedThemes(prev => {
      if (prev.includes(themeId)) {
        return prev.filter(id => id !== themeId);
      }
      return [...prev, themeId];
    });
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          placeholder="Search clips..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Interviewees</label>
          <div className="flex flex-wrap gap-2">
            {interviewees.map((interviewee) => (
              <Badge
                key={interviewee.id}
                variant={selectedInterviewees.includes(interviewee.id) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleIntervieweeChange(interviewee.id)}
              >
                {interviewee.title}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Themes</label>
          <div className="flex flex-wrap gap-2">
            {themes.map((theme) => (
              <Badge
                key={theme.id}
                variant={selectedThemes.includes(theme.id) ? "default" : "outline"}
                className={`cursor-pointer hover:${theme.color}`}
                onClick={() => handleThemeChange(theme.id)}
              >
                {theme.title}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Showing {filteredClips.length} clips
      </div>

      {/* Clips Grid */}
      <div className="grid gap-4">
        {filteredClips.map(clip => {
          const video = videoData[clip.interviewId];
          return (
            <div 
              key={clip.id}
              className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-6">
                <div className="relative w-48 flex-shrink-0">
                  <Link 
                    href={`/video/${clip.interviewId}?t=${clip.startTime}&end=${clip.endTime}`}
                    className="block cursor-pointer"
                  >
                    <div className="relative aspect-video rounded-md overflow-hidden">
                      <Image
                        src={video.thumbnail}
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
                    <div className="mt-2 text-sm text-gray-600 truncate">
                      {video.title}
                    </div>
                  </Link>
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">
                        {highlightText(clip.title, searchQuery)}
                      </h3>
                      <div className="text-sm text-gray-500">
                        Chapter: {highlightText(clip.chapter.title, searchQuery)}
                      </div>
                    </div>
                  </div>
                  
                  <blockquote className="text-gray-600 mb-4 border-l-4 pl-4 italic">
                    {highlightText(clip.transcript, searchQuery)}
                  </blockquote>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {clip.themes.map(themeId => {
                        const theme = themes.find(t => t.id === themeId);
                        return theme ? (
                          <Link key={themeId} href={`/theme/${themeId}`}>
                            <Badge 
                              variant="outline" 
                              className={`hover:${theme.color} hover:text-white transition-colors`}
                            >
                              {theme.title}
                            </Badge>
                          </Link>
                        ) : null;
                      })}
                    </div>
                    
                    <Link 
                      href={`/video/${clip.interviewId}?t=${clip.startTime}&end=${clip.endTime}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
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