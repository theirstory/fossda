"use client";

import { useState } from "react";
import ClipsGrid from "@/components/ClipsGrid";
import { Clip } from "@/types";
import { Theme } from "@/data/themes";

interface ClipsPageClientProps {
  clips: Clip[];
  interviewees: { id: string; title: string; }[];
  themes: Theme[];
}

export default function ClipsPageClient({ clips, interviewees, themes }: ClipsPageClientProps) {
  const [selectedInterviewees, setSelectedInterviewees] = useState<string[]>([]);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px,1fr] gap-6">
      {/* Filters Panel */}
      <div className="bg-white rounded-xl shadow-lg p-4 h-fit lg:sticky lg:top-[88px]">
        <ClipsGrid
          clips={clips}
          interviewees={interviewees}
          themes={themes}
          variant="filters"
          selectedInterviewees={selectedInterviewees}
          setSelectedInterviewees={setSelectedInterviewees}
          selectedThemes={selectedThemes}
          setSelectedThemes={setSelectedThemes}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </div>

      {/* Clips Panel */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <ClipsGrid
          clips={clips}
          interviewees={interviewees}
          themes={themes}
          variant="clips"
          selectedInterviewees={selectedInterviewees}
          selectedThemes={selectedThemes}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  );
} 