import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Play } from 'lucide-react';
import { Clip } from '@/types';

// Placeholder interfaces for missing types
interface Theme {
  id: string;
  name: string;
}

interface TimelineViewProps {
  clips: (Clip & { themeId: string; thumbnail: string })[];
  themes: Theme[];
  onClipSelect: (clip: Clip & { themeId: string; thumbnail: string }) => void;
}

const TimelineView: React.FC<TimelineViewProps> = ({
  clips,
  themes,
  onClipSelect,
}) => {
  // Sort clips by start time
  const sortedClips = [...clips].sort((a, b) => a.startTime - b.startTime);

  // Format time to display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full h-[600px]">
      <CardHeader>
        <CardTitle>Timeline View</CardTitle>
      </CardHeader>
      <CardContent className="h-full overflow-y-auto">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border"></div>
          
          {/* Timeline items */}
          <div className="space-y-6 pb-8">
            {sortedClips.map((clip) => {
              const theme = themes.find((t) => t.id === clip.themeId);
              
              return (
                <div key={clip.id} className="relative flex items-start space-x-6">
                  {/* Timeline dot */}
                  <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center border-4 border-background shadow-lg">
                    <Clock className="w-5 h-5 text-primary-foreground" />
                  </div>
                  
                  {/* Content card */}
                  <Card 
                    className="flex-1 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                    onClick={() => onClipSelect(clip)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-sm font-semibold text-foreground flex-1">
                          {clip.title}
                        </h3>
                        <Play className="w-4 h-4 text-primary ml-2 flex-shrink-0" />
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-muted-foreground">
                          {formatTime(clip.startTime)}
                        </span>
                        {theme && (
                          <>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                              {theme.name}
                            </span>
                          </>
                        )}
                      </div>
                      
                      <p className="text-xs text-foreground leading-relaxed">
                        {clip.transcript.length > 150 ? clip.transcript.substring(0, 150) + '...' : clip.transcript}
                      </p>
                      
                      <div className="mt-3 text-xs text-primary">
                        Click to play →
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimelineView; 