"use client";

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { themes } from '@/data/themes';
import { iconMap } from '@/data/icons';
import { clips } from '@/data/clips';

interface ThemeExplorerProps {
  currentThemeId?: string;
}

export default function ThemeExplorer({ currentThemeId }: ThemeExplorerProps) {
  const router = useRouter();

  // Calculate clip counts for each theme
  const themeClipCounts = themes.reduce((acc, theme) => {
    acc[theme.id] = clips.filter(clip => clip.themes.includes(theme.id)).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4 h-full overflow-hidden">
      <div className="space-y-2">
        {themes
          .filter(theme => theme.id !== currentThemeId) // Filter out current theme
          .map((theme) => {
            const Icon = iconMap[theme.iconName];
            const clipCount = themeClipCounts[theme.id];
            
            return (
              <motion.div
                key={theme.id}
                className="p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors group"
                onClick={() => router.push(`/theme/${theme.id}`)}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-full flex items-center justify-center w-10 h-10 shrink-0">
                    {Icon && <Icon className="h-6 w-6" style={{ color: theme.iconColor }} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className={`text-sm font-medium text-gray-900 group-hover:text-gray-900 transition-colors truncate`}>
                        {theme.title}
                      </h3>
                      <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full whitespace-nowrap shrink-0">
                        {clipCount} clips
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{theme.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
      </div>
    </div>
  );
}

// Export themes so they can be used in the theme page
export { themes }; 