"use client";

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { themes } from '@/data/themes';
import { iconMap } from '@/data/icons';

interface ThemeExplorerProps {
  currentThemeId?: string;
}

export default function ThemeExplorer({ currentThemeId }: ThemeExplorerProps) {
  const router = useRouter();

  return (
    <div className="space-y-4 h-full overflow-hidden">
      <div className="space-y-2">
        {themes
          .filter(theme => theme.id !== currentThemeId) // Filter out current theme
          .map((theme) => {
            const Icon = iconMap[theme.iconName];
            return (
              <motion.div
                key={theme.id}
                className="p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => router.push(`/theme/${theme.id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-full ${theme.color} text-white flex items-center justify-center w-8 h-8`}>
                    {Icon && <Icon className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">{theme.title}</h3>
                    <p className="text-xs text-gray-500">{theme.description}</p>
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