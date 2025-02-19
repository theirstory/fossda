import { themes } from '@/data/themes';
import { clips } from '@/data/clips';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { videoData } from '@/data/videos';
import ThemeExplorer from '@/components/ThemeExplorer';
import React from 'react';
import { iconMap } from '@/data/icons';

// Update Props to match Next.js PageProps
type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function formatDuration(duration: number): string {
  const roundedSeconds = Math.round(duration);
  const minutes = Math.floor(roundedSeconds / 60);
  const seconds = roundedSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

async function getThemeData(id: string) {
  const theme = themes.find(t => t.id === id);
  const themeClips = clips.filter(clip => clip.themes.includes(id));
  return { theme, themeClips };
}

// Update the component signature to match Next.js types
export default async function ThemePage(props: Props) {
  const params = await props.params;
  const { theme, themeClips } = await getThemeData(params.id);

  if (!theme) {
    return <div>Theme not found</div>;
  }

  return (
    <main className="container mx-auto px-4">
      <div className="pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-6">
          {/* Main Content */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-full flex items-center justify-center">
                  {iconMap[theme.iconName] && React.createElement(iconMap[theme.iconName], { 
                    className: "h-8 w-8",
                    style: { color: theme.iconColor }
                  })}
                </div>
                <div>
                  <h1 className={`text-2xl font-bold ${theme.color.replace('bg-', 'text-')}`}>{theme.title}</h1>
                  <p className="text-gray-600">{theme.description}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-8">
                <h2 className="text-sm font-medium text-gray-700 mb-2">Guiding Question</h2>
                <p className="text-gray-600 italic">{theme.question}</p>
              </div>

              <div className="grid gap-4">
                {themeClips.map(clip => {
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
                            <div className="aspect-video relative">
                              <Image
                                src={video.thumbnail}
                                alt={`Thumbnail from ${video.title}`}
                                fill
                                className="object-cover rounded-md hover:opacity-90 transition-opacity"
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
                              <h3 className="text-lg font-semibold mb-1">{clip.title}</h3>
                              <div className="text-sm text-gray-500">
                                Chapter: {clip.chapter.title}
                              </div>
                            </div>
                          </div>
                          
                          <blockquote className="text-gray-600 mb-4 border-l-4 pl-4 italic">
                            {clip.transcript}
                          </blockquote>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              {clip.themes.filter(t => t !== params.id).length > 0 && (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-500">Also found in:</span>
                                  <div className="flex gap-2">
                                    {clip.themes.filter(t => t !== params.id).map(themeId => {
                                      const relatedTheme = themes.find(t => t.id === themeId);
                                      return relatedTheme ? (
                                        <Link key={themeId} href={`/theme/${themeId}`}>
                                          <Badge 
                                            variant="outline" 
                                            className={`hover:${relatedTheme.color} hover:text-white transition-colors`}
                                          >
                                            {relatedTheme.title}
                                          </Badge>
                                        </Link>
                                      ) : null;
                                    })}
                                  </div>
                                </div>
                              )}
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
          </div>

          {/* Theme Explorer Sidebar */}
          <div className="bg-white rounded-lg shadow-sm p-4 max-h-[600px] overflow-y-auto sticky top-[72px]">
            <h2 className="text-lg font-semibold mb-3">Explore Other Themes</h2>
            <ThemeExplorer currentThemeId={params.id} />
          </div>
        </div>
      </div>
    </main>
  );
} 