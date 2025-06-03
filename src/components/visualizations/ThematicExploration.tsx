import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Placeholder interfaces for missing types
interface Theme {
  id: string;
  name: string;
  clips: unknown[];
  relatedThemes: string[];
}

interface ThematicExplorationProps {
  themes: Theme[];
  onThemeSelect: (theme: Theme) => void;
}

const ThematicExploration: React.FC<ThematicExplorationProps> = ({
  themes,
  onThemeSelect,
}) => {
  return (
    <Card className="w-full h-[600px]">
      <CardHeader>
        <CardTitle>Thematic Exploration</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-muted-foreground mb-4">
            Thematic visualization is not yet available.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => onThemeSelect(theme)}
                className="p-4 border rounded-lg hover:bg-muted transition-colors"
              >
                <h3 className="font-medium">{theme.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {theme.clips.length} clips
                </p>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ThematicExploration; 