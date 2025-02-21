import { themes } from '@/data/themes';
import { clips } from '@/data/clips';
import { Badge } from '@/components/ui/badge';
import { iconMap } from '@/data/icons';
import { Metadata } from 'next';
import ThemePageClient from "./client";
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Update Props to match Next.js PageProps
type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getThemeData(id: string) {
  const theme = themes.find(t => t.id === id);
  const themeClips = clips.filter(clip => clip.themes.includes(id));
  return { theme, themeClips };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const { theme } = await getThemeData(resolvedParams.id);
  
  if (!theme) {
    return {
      title: 'Theme Not Found',
      description: 'The requested theme could not be found.'
    };
  }

  return {
    title: `${theme.title} | Free Open Source Stories Digital Archive`,
    description: theme.description,
  };
}

// Update the component signature to match Next.js types
export default async function ThemePage(props: Props) {
  const params = await props.params;
  const { theme, themeClips } = await getThemeData(params.id);

  if (!theme) {
    return <div>Theme not found</div>;
  }

  const Icon = iconMap[theme.iconName];

  // Calculate clip counts for each theme
  const themeClipCounts = themes.reduce((acc, t) => {
    acc[t.id] = clips.filter(clip => clip.themes.includes(t.id)).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <main>
      <div className="relative bg-gray-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '30px 30px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-4 flex-wrap text-center">
            <div 
              className={`p-2.5 rounded-full ${theme.color} bg-opacity-20`}
              style={{ backgroundColor: theme.iconColor + '33' }}
            >
              {Icon && <Icon className="h-8 w-8" style={{ color: theme.iconColor }} />}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
              {theme.title}
            </h1>
            <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
              {themeClips.length} clips
            </Badge>
          </div>
          <div className="mt-3 max-w-3xl mx-auto text-center">
            <p className="text-base text-gray-300">
              {theme.description}
            </p>
            <div className="mt-2 text-sm text-gray-400 italic">
              {theme.question}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-2 sm:px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,250px] gap-4">
          {/* Clips Section */}
          <div className="max-w-[1400px]">
            <ThemePageClient
              theme={theme}
              themeClips={themeClips}
              themes={themes}
            />
          </div>

          {/* Theme Navigation - Vertical */}
          <div className="lg:sticky lg:top-[88px] h-fit">
            <div className="bg-white rounded-lg shadow-lg p-3">
              <h2 className="text-sm font-medium text-gray-500 mb-3">Explore Themes</h2>
              <div className="flex flex-col gap-2">
                {themes.map((t) => {
                  const isActive = t.id === theme.id;
                  const ThemeIcon = iconMap[t.iconName];
                  return (
                    <Link
                      key={t.id}
                      href={`/theme/${t.id}`}
                      className={cn(
                        "flex items-center gap-2 px-2.5 py-2 rounded-lg transition-colors",
                        isActive 
                          ? "bg-gray-100" 
                          : "hover:bg-gray-50"
                      )}
                    >
                      <div 
                        className={cn(
                          "p-1.5 rounded-full",
                          isActive ? "bg-gray-200" : "bg-gray-50"
                        )}
                      >
                        <ThemeIcon className="h-4 w-4" style={{ color: t.iconColor }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={cn(
                            "text-sm font-medium truncate",
                            isActive ? "text-gray-900" : "text-gray-600"
                          )}>
                            {t.title}
                          </span>
                          <Badge variant="secondary" className={cn(
                            "bg-gray-100 border-0 shrink-0",
                            isActive ? "text-gray-900" : "text-gray-500"
                          )}>
                            {themeClipCounts[t.id]}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 