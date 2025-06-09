'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TimelineView from '@/components/visualizations/TimelineView';
import ThematicExploration from '@/components/visualizations/ThematicExploration';
import { clips } from '@/data/clips';
import { Clip } from '@/types';

// Define proper types for theme data
interface Theme {
  id: string;
  name: string;
  clips: Clip[];
  relatedThemes: string[];
}

type ClipWithTheme = Clip & { themeId: string; thumbnail: string };

// Sample theme data to demonstrate the ThematicExploration component
const sampleThemes: Theme[] = [
  {
    id: 'open-source',
    name: 'Open Source Philosophy',
    clips: clips.slice(0, 5),
    relatedThemes: ['community', 'licensing']
  },
  {
    id: 'community',
    name: 'Community Building',
    clips: clips.slice(5, 10),
    relatedThemes: ['open-source', 'collaboration']
  },
  {
    id: 'licensing',
    name: 'Software Licensing',
    clips: clips.slice(10, 15),
    relatedThemes: ['open-source', 'legal']
  },
  {
    id: 'collaboration',
    name: 'Collaboration',
    clips: clips.slice(15, 20),
    relatedThemes: ['community', 'development']
  },
  {
    id: 'development',
    name: 'Software Development',
    clips: clips.slice(20, 25),
    relatedThemes: ['collaboration', 'tools']
  },
  {
    id: 'tools',
    name: 'Development Tools',
    clips: clips.slice(25, 30),
    relatedThemes: ['development']
  },
  {
    id: 'legal',
    name: 'Legal Aspects',
    clips: clips.slice(30, 35),
    relatedThemes: ['licensing']
  }
];

// Convert clips to have themeId for TimelineView
const clipsWithThemes = clips.map((clip, index) => ({
  ...clip,
  themeId: sampleThemes[index % sampleThemes.length].id,
  thumbnail: `/api/placeholder/150/100?text=${encodeURIComponent(clip.title.substring(0, 20))}`
}));

export default function VisualizationsPage() {
  const [selectedClip, setSelectedClip] = useState<ClipWithTheme | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);

  const handleClipSelect = (clip: ClipWithTheme) => {
    setSelectedClip(clip);
    // You could navigate to the video or show more details
    console.log('Selected clip:', clip);
    if (clip.interviewId) {
      window.open(`/video/${clip.interviewId}?t=${clip.startTime}`, '_blank');
    }
  };

  const handleThemeSelect = (theme: Theme) => {
    setSelectedTheme(theme);
    console.log('Selected theme:', theme);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Data Visualizations</h1>
        <p className="text-lg text-muted-foreground">
          Explore the oral history interviews through interactive visualizations
        </p>
      </div>

      <Tabs defaultValue="timeline" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
          <TabsTrigger value="themes">Thematic Exploration</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Timeline Visualization</h2>
              <p className="text-muted-foreground">
                Explore clips chronologically. Click on any clip to jump to that moment in the interview.
              </p>
            </div>
            <TimelineView
              clips={clipsWithThemes}
              themes={sampleThemes}
              onClipSelect={handleClipSelect}
            />
            {selectedClip && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold">Last Selected Clip:</h3>
                <p className="text-sm">{selectedClip.title}</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="themes" className="space-y-4">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Thematic Exploration</h2>
              <p className="text-muted-foreground">
                Discover thematic connections across interviews. Click on themes to explore related content.
              </p>
            </div>
            <ThematicExploration
              themes={sampleThemes}
              onThemeSelect={handleThemeSelect}
            />
            {selectedTheme && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold">Selected Theme:</h3>
                <p className="text-sm">{selectedTheme.name}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedTheme.clips.length} clips in this theme
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 