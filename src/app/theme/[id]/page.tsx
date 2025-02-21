import { themes } from '@/data/themes';
import { clips } from '@/data/clips';
import { Badge } from '@/components/ui/badge';
import { iconMap } from '@/data/icons';
import { Metadata } from 'next';
import ThemePageClient from "./client";

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

  return (
    <main>
      {/* Hero Section - Ultra compact */}
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

      {/* Main Content - Minimal padding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ThemePageClient
          theme={theme}
          themeClips={themeClips}
          themes={themes}
        />
      </div>
    </main>
  );
} 