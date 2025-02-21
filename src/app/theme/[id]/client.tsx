"use client";

import { useState } from "react";
import { Theme } from "@/data/themes";
import { Clip } from "@/types";
import ThemeFilters from "@/components/ThemeFilters";
import ThemeClipItem from "@/components/ThemeClipItem";

interface ThemePageClientProps {
  theme: Theme;
  themeClips: Clip[];
  themes: Theme[];
}

export default function ThemePageClient({ theme, themeClips, themes }: ThemePageClientProps) {
  const [selectedInterviewees, setSelectedInterviewees] = useState<string[]>([]);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClips = themeClips.filter(clip => {
    const matchesInterviewee = selectedInterviewees.length === 0 || 
                              selectedInterviewees.includes(clip.interviewId);
    const matchesTheme = selectedThemes.length === 0 || 
                        clip.themes.some(themeId => selectedThemes.includes(themeId));
    const matchesSearch = !searchQuery || 
                         clip.transcript.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         clip.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesInterviewee && matchesTheme && matchesSearch;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px,1fr] gap-6">
      {/* Filters Panel */}
      <div className="bg-white rounded-xl shadow-lg p-4 h-fit lg:sticky lg:top-[88px]">
        <ThemeFilters
          selectedInterviewees={selectedInterviewees}
          setSelectedInterviewees={setSelectedInterviewees}
          selectedThemes={selectedThemes}
          setSelectedThemes={setSelectedThemes}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          currentThemeId={theme.id}
          themes={themes}
        />
      </div>

      {/* Clips Panel */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="text-sm text-gray-600 pb-3 border-b">
          Showing {filteredClips.length} {filteredClips.length === 1 ? 'clip' : 'clips'}
        </div>
        <div className="mt-4 grid gap-4">
          {filteredClips.map(clip => (
            <ThemeClipItem
              key={clip.id}
              clip={clip}
              currentThemeId={theme.id}
              themes={themes}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 