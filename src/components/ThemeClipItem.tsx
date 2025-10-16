"use client";

import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { Theme } from "@/data/themes";
import { Clip } from "@/types";
import { videoData } from "@/data/videos";
import { useRouter } from "next/navigation";

interface ThemeClipItemProps {
  clip: Clip;
  currentThemeId: string;
  themes: Theme[];
  searchQuery?: string;
}

function formatDuration(duration: number): string {
  const roundedSeconds = Math.round(duration);
  const minutes = Math.floor(roundedSeconds / 60);
  const seconds = roundedSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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

export default function ThemeClipItem({ clip, currentThemeId, themes, searchQuery = "" }: ThemeClipItemProps) {
  const router = useRouter();
  const video = videoData[clip.interviewId];

  const handleThemeClick = (e: React.MouseEvent, themeId: string) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/theme/${themeId}`);
  };

  return (
    <Link 
      href={`/video/${clip.interviewId}?t=${clip.startTime}&end=${clip.endTime}`}
      className="group bg-gray-50 rounded-lg overflow-hidden transform transition duration-300 hover:shadow-lg block"
    >
      <div className="flex flex-col lg:flex-row gap-4 p-4">
        <div className="relative w-full lg:w-48 flex-shrink-0">
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <Image
              src={video.thumbnail}
              alt={video.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute bottom-2 right-2">
              <Badge variant="secondary" className="bg-black/70 text-white border-0">
                {formatDuration(clip.duration)}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0 py-1">
          <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
            {highlightText(clip.title, searchQuery)}
          </h3>
          <div className="text-sm text-gray-500 mb-2">
            From: {video.title} • {clip.chapter.title}
          </div>
          <blockquote className="text-gray-600 text-sm italic line-clamp-2 mb-3">
            {highlightText(clip.transcript, searchQuery)}
          </blockquote>
          
          <div className="flex items-center gap-2 flex-wrap">
            {clip.themes.filter(t => t !== currentThemeId).map(themeId => {
              const relatedTheme = themes.find(t => t.id === themeId);
              return relatedTheme ? (
                <button
                  key={themeId}
                  onClick={(e) => handleThemeClick(e, themeId)}
                  className="inline-block"
                >
                  <Badge 
                    variant="outline"
                    className="transition-colors hover:text-white hover:border-transparent"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = relatedTheme.iconColor;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '';
                    }}
                  >
                    {relatedTheme.title}
                  </Badge>
                </button>
              ) : null;
            })}
          </div>
        </div>
      </div>
    </Link>
  );
} 