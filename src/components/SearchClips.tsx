"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { clips } from "@/data/clips";
import { videoData } from "@/data/videos";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/utils";

export default function SearchClips() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const pathname = usePathname();

  // Clear search when route changes
  useEffect(() => {
    setSearchQuery("");
    setIsSearching(false);
  }, [pathname]);

  // Filter clips based on search query
  const filteredClips = searchQuery.length > 2 ? clips.filter(clip => {
    const query = searchQuery.toLowerCase();
    const matchesTranscript = clip.transcript.toLowerCase().includes(query);
    const matchesTitle = clip.title.toLowerCase().includes(query);
    const matchesChapter = clip.chapter.title.toLowerCase().includes(query);
    const matchesInterviewee = clip.interviewTitle.toLowerCase().includes(query);
    return matchesTranscript || matchesTitle || matchesChapter || matchesInterviewee;
  }).slice(0, 5) : [];

  return (
    <div className="relative">
      <Input
        placeholder="Search by interviewee name, clip title, transcript, or chapter..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setIsSearching(e.target.value.length > 2);
        }}
        className="w-full"
      />

      {/* Search Results Dropdown */}
      {isSearching && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg max-h-[400px] overflow-y-auto">
          {filteredClips.length > 0 ? (
            <div className="py-1">
              {filteredClips.map(clip => {
                const video = videoData[clip.interviewId];
                return (
                  <Link
                    key={clip.id}
                    href={`/video/${clip.interviewId}?t=${clip.startTime}`}
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
                          <div className="absolute bottom-1 right-1">
                            <Badge variant="secondary" className="bg-black/70 text-white border-0 text-xs">
                              {formatDuration(clip.duration)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {clip.title}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {video.title} • {clip.chapter.title}
                        </p>
                        <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                          {clip.transcript}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="p-3 text-sm text-gray-500 text-center">
              No clips found
            </div>
          )}
        </div>
      )}
    </div>
  );
} 