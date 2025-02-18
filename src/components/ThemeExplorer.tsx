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

  // Helper function to convert bg-color class to text-color class
  const getTextColorClass = (bgColorClass: string) => {
    return bgColorClass.replace('bg-', 'text-');
  };

  return (
    <div className="space-y-4 h-full overflow-hidden">
      <div className="space-y-2">
        {themes
          .filter(theme => theme.id !== currentThemeId) // Filter out current theme
          .map((theme) => {
            const Icon = iconMap[theme.iconName];
            const textColorClass = getTextColorClass(theme.color);
            console.log('Icon for theme:', theme.title, Icon); // Debug log
            return (
              <motion.div
                key={theme.id}
                className="p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors group"
                onClick={() => router.push(`/theme/${theme.id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-full flex items-center justify-center w-10 h-10">
                    {Icon && <Icon className="h-6 w-6" style={{ color: theme.iconColor }} />}
                  </div>
                  <div>
                    <h3 className={`text-sm font-medium ${textColorClass} group-hover:text-gray-900 transition-colors`}>{theme.title}</h3>
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