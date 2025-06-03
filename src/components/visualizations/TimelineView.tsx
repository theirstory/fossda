import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Chrono } from 'react-chrono';

// Placeholder interfaces for missing types
interface Clip {
  id: string;
  title: string;
  summary: string;
  startTime: number;
  endTime: number;
  themeId: string;
  thumbnail: string;
}

interface Theme {
  id: string;
  name: string;
}

interface TimelineViewProps {
  clips: Clip[];
  themes: Theme[];
  onClipSelect: (clip: Clip) => void;
}

const TimelineView: React.FC<TimelineViewProps> = ({
  clips,
  themes,
  onClipSelect,
}) => {
  // Sort clips by start time
  const sortedClips = [...clips].sort((a, b) => a.startTime - b.startTime);

  // Transform clips into timeline items
  const timelineItems = sortedClips.map((clip) => ({
    title: clip.title,
    cardTitle: clip.title,
    cardSubtitle: themes.find((t) => t.id === clip.themeId)?.name || 'Uncategorized',
    cardDetailedText: clip.summary,
    media: {
      name: 'thumbnail',
      source: {
        url: clip.thumbnail,
      },
      type: 'IMAGE',
    },
  }));

  return (
    <Card className="w-full h-[600px]">
      <CardHeader>
        <CardTitle>Timeline View</CardTitle>
      </CardHeader>
      <CardContent>
        <Chrono
          items={timelineItems}
          mode="VERTICAL_ALTERNATING"
          theme={{
            primary: 'var(--primary)',
            secondary: 'var(--secondary)',
            cardBgColor: 'var(--card)',
            titleColor: 'var(--foreground)',
            titleColorActive: 'var(--primary)',
          }}
          onItemClick={(index: number) => onClipSelect(sortedClips[index])}
        />
      </CardContent>
    </Card>
  );
};

export default TimelineView; 