"use client";

import { Input } from "@/components/ui/input";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { clips } from "@/data/clips";
import { videoData } from "@/data/videos";

export function SearchInput() {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Clear search when route changes
  useEffect(() => {
    setQuery("");
  }, [pathname]);

  // Filter clips based on search query
  const filteredClips = query.length > 2 ? clips.filter(clip => {
    const searchQuery = query.toLowerCase();
    const matchesTranscript = clip.transcript.toLowerCase().includes(searchQuery);
    const matchesTitle = clip.title.toLowerCase().includes(searchQuery);
    const matchesChapter = clip.chapter.title.toLowerCase().includes(searchQuery);
    const matchesInterviewee = clip.interviewTitle.toLowerCase().includes(searchQuery);
    return matchesTranscript || matchesTitle || matchesChapter || matchesInterviewee;
  }).slice(0, 5) : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-4xl">
      <Input
        type="search"
        placeholder="Search interviews, transcripts, clips, and chapters..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          // Small delay to allow for link clicks
          setTimeout(() => setIsFocused(false), 200);
        }}
        className="w-full"
      />

      {/* Live Search Results */}
      {isFocused && query.length > 2 && filteredClips.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg max-h-[400px] overflow-y-auto">
          <div className="py-1">
            {filteredClips.map((clip) => {
              const video = videoData[clip.interviewId];
              return (
                <Link
                  key={clip.id}
                  href={`/video/${clip.interviewId}?t=${clip.startTime}&end=${clip.endTime}`}
                  className="block hover:bg-gray-50"
                >
                  <div className="p-3 flex gap-3">
                    <div className="relative w-24 flex-shrink-0">
                      <div className="relative aspect-video rounded overflow-hidden">
                        <Image
                          src={video.thumbnail}
                          alt={video.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {clip.title}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {video.title} • {clip.chapter.title}
                      </p>
                      <p className="text-xs text-gray-600 line-clamp-4 mt-1">
                        {clip.transcript}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </form>
  );
} 