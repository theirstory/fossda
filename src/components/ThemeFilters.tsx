"use client";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { videoData } from "@/data/videos";
import { Theme } from "@/data/themes";
import { iconMap } from "@/data/icons";
import React from "react";

interface ThemeFiltersProps {
  selectedInterviewees: string[];
  setSelectedInterviewees: (value: string[]) => void;
  selectedThemes: string[];
  setSelectedThemes: (value: string[]) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  currentThemeId: string;
  themes: Theme[];
}

export default function ThemeFilters({
  selectedInterviewees,
  setSelectedInterviewees,
  selectedThemes,
  setSelectedThemes,
  searchQuery,
  setSearchQuery,
  currentThemeId,
  themes
}: ThemeFiltersProps) {
  const interviewees = Object.values(videoData).map(video => ({
    id: video.id,
    title: video.title,
  }));

  const handleIntervieweeChange = (value: string) => {
    setSelectedInterviewees(
      selectedInterviewees.includes(value)
        ? selectedInterviewees.filter(id => id !== value)
        : [...selectedInterviewees, value]
    );
  };

  const handleThemeChange = (value: string) => {
    setSelectedThemes(
      selectedThemes.includes(value)
        ? selectedThemes.filter(id => id !== value)
        : [...selectedThemes, value]
    );
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          placeholder="Search clips..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-gray-50 border-0"
        />
      </div>

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

        {/* Related Themes */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Themes</label>
          <div className="flex flex-col gap-2">
            {themes
              .filter(theme => theme.id !== currentThemeId)
              .map((theme) => (
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
} 