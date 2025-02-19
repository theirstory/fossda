import { clips } from "@/data/clips";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { videoData } from "@/data/videos";
import { themes } from "@/data/themes";
import { iconMap } from "@/data/icons";
import React from "react";
import { useRouter } from "next/navigation";

interface VideoClipsProps {
  interviewId: string;
  onClipClick?: (timestamp: number) => void;
}

export default function VideoClips({ interviewId, onClipClick }: VideoClipsProps) {
  const router = useRouter();
  const intervieweeClips = clips
    .filter(clip => clip.interviewId === interviewId)
    .sort((a, b) => a.startTime - b.startTime);

  function formatDuration(duration: number): string {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  const handleThemeClick = (e: React.MouseEvent, themeId: string) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/theme/${themeId}`);
  };

  // Helper function to sort themes based on their order in the themes array
  const sortThemesByOrder = (themeIds: string[]) => {
    return themeIds.sort((a, b) => {
      const indexA = themes.findIndex(theme => theme.id === a);
      const indexB = themes.findIndex(theme => theme.id === b);
      return indexA - indexB;
    });
  };

  return (
    <div className="p-4 space-y-4">
      {intervieweeClips.map(clip => {
        const video = videoData[clip.interviewId];
        const sortedThemes = sortThemesByOrder(clip.themes);
        
        return (
          <div
            key={clip.id}
            onClick={(e) => {
              if (onClipClick) {
                e.preventDefault();
                onClipClick(clip.startTime);
              } else {
                router.push(`/video/${clip.interviewId}?t=${clip.startTime}`);
              }
            }}
            className="block hover:bg-gray-50 cursor-pointer"
          >
            <div className="flex gap-6 h-full">
              <div className="relative w-48 flex-shrink-0">
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
              </div>

              <div className="flex-1 overflow-hidden flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold mb-1 truncate">{clip.title}</h3>
                    <div className="text-sm text-gray-500">
                      Chapter: {clip.chapter.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      Time: {formatDuration(clip.startTime)}
                    </div>
                  </div>
                </div>
                
                <blockquote className="text-gray-600 border-l-4 pl-4 italic line-clamp-3 mb-2">
                  {clip.transcript}
                </blockquote>

                <div className="flex gap-2 mt-auto">
                  {sortedThemes.map(themeId => {
                    const theme = themes.find(t => t.id === themeId);
                    if (!theme || !iconMap[theme.iconName]) return null;
                    
                    return (
                      <button
                        key={themeId}
                        onClick={(e) => handleThemeClick(e, themeId)}
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        title={theme.title}
                        aria-label={`View ${theme.title} theme`}
                      >
                        {React.createElement(iconMap[theme.iconName], {
                          className: "w-5 h-5",
                          style: { color: theme.iconColor },
                          "aria-hidden": "true"
                        })}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
} 