"use client";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { videoData } from "@/data/videos";
import { Theme } from "@/data/themes";
import { iconMap } from "@/data/icons";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface ThemeFiltersProps {
  selectedInterviewees: string[];
  setSelectedInterviewees: (value: string[]) => void;
  selectedThemes: string[];
  setSelectedThemes: (value: string[]) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  currentThemeId: string;
  themes: Theme[];
  hideSearch?: boolean;
}

export default function ThemeFilters({
  selectedInterviewees,
  setSelectedInterviewees,
  selectedThemes,
  setSelectedThemes,
  searchQuery,
  setSearchQuery,
  currentThemeId,
  themes,
  hideSearch = false
}: ThemeFiltersProps) {
  const [intervieweesExpanded, setIntervieweesExpanded] = useState(true);
  const [themesExpanded, setThemesExpanded] = useState(true);
  
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

  const renderFilters = () => (
    <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
      {/* Filter Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Filter className="h-4 w-4" />
          <span>Filter clips by:</span>
        </div>

        {/* Interviewees */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setIntervieweesExpanded(!intervieweesExpanded);
            }}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 w-full text-left"
          >
            {intervieweesExpanded ? (
              <ChevronDown className="h-4 w-4 flex-shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 flex-shrink-0" />
            )}
            <span>Interviewees</span>
            {selectedInterviewees.length > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {selectedInterviewees.length}
              </Badge>
            )}
          </button>
          {intervieweesExpanded && (
            <div className="flex flex-col gap-2 pl-6">
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
          )}
        </div>

        {/* Related Themes */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setThemesExpanded(!themesExpanded);
            }}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 w-full text-left"
          >
            {themesExpanded ? (
              <ChevronDown className="h-4 w-4 flex-shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 flex-shrink-0" />
            )}
            <span>Themes</span>
            {selectedThemes.length > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {selectedThemes.length}
              </Badge>
            )}
          </button>
          {themesExpanded && (
            <div className="flex flex-col gap-2 pl-6">
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
          )}
        </div>
      </div>
    </div>
  );

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
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-50 border-0"
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
          <SheetContent side="left" className="w-full sm:w-[540px] overflow-y-auto">
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