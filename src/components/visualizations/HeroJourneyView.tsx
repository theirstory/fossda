'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  heroJourneyStages, 
  pioneerJourneys, 
  findJourneyOverlaps,
  commonThemes,
  commonChallenges
} from '@/data/hero-journey';
import { 
  Sword, 
  BookOpen, 
  Users, 
  Trophy, 
  Target, 
  AlertTriangle,
  Sparkles,
  Home,
  MapPin,
  Calendar,
  Link2,
  Flame
} from 'lucide-react';

const stageIcons: Record<string, React.ReactNode> = {
  'ordinary-world': <Home className="w-4 h-4" />,
  'call-to-adventure': <Sparkles className="w-4 h-4" />,
  'refusal-doubt': <AlertTriangle className="w-4 h-4" />,
  'meeting-mentor': <Users className="w-4 h-4" />,
  'crossing-threshold': <Target className="w-4 h-4" />,
  'tests-allies-enemies': <Sword className="w-4 h-4" />,
  'approach': <BookOpen className="w-4 h-4" />,
  'ordeal': <Flame className="w-4 h-4" />,
  'reward': <Trophy className="w-4 h-4" />,
  'road-back': <MapPin className="w-4 h-4" />,
  'resurrection': <Sparkles className="w-4 h-4" />,
  'return-elixir': <Trophy className="w-4 h-4" />
};

const archetypeColors: Record<string, string> = {
  beginning: 'from-blue-500 to-cyan-500',
  initiation: 'from-purple-500 to-pink-500',
  transformation: 'from-orange-500 to-red-500',
  return: 'from-green-500 to-emerald-500'
};

const HeroJourneyView: React.FC = () => {
  const [selectedPioneer, setSelectedPioneer] = useState<string | null>(null);
  const [comparePioneers, setComparePioneers] = useState<string[]>([]);

  const toggleComparePioneer = (pioneerId: string) => {
    if (comparePioneers.includes(pioneerId)) {
      setComparePioneers(comparePioneers.filter(id => id !== pioneerId));
    } else if (comparePioneers.length < 3) {
      setComparePioneers([...comparePioneers, pioneerId]);
    }
  };

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">The Hero&apos;s Journey in Open Source</CardTitle>
          <CardDescription>
            The prototypical narrative arc of pioneers in the open source movement, 
            showing how individual journeys mirror the classic hero&apos;s journey and overlap in 
            space, time, theme, and challenges overcome.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="archetype" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="archetype">Prototypical Arc</TabsTrigger>
          <TabsTrigger value="individual">Individual Journeys</TabsTrigger>
          <TabsTrigger value="overlaps">Journey Overlaps</TabsTrigger>
          <TabsTrigger value="timeline">Temporal View</TabsTrigger>
        </TabsList>

        {/* Prototypical Arc View */}
        <TabsContent value="archetype" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>The Open Source Pioneer&apos;s Journey</CardTitle>
              <CardDescription>
                A universal pattern emerging from the stories of open source pioneers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="relative">
                  {/* Curved arc path */}
                  <svg className="absolute inset-0 w-full h-full" style={{ height: '1200px' }}>
                    <defs>
                      <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="33%" stopColor="#a855f7" />
                        <stop offset="66%" stopColor="#f97316" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 100 50 Q 200 150, 300 300 T 500 500 T 700 700 T 900 900 T 1100 1050"
                      stroke="url(#arcGradient)"
                      strokeWidth="4"
                      fill="none"
                      opacity="0.3"
                    />
                  </svg>

                  {/* Journey stages */}
                  <div className="relative space-y-8">
                    {heroJourneyStages.map((stage, index) => (
                      <div
                        key={stage.id}
                        className="flex items-start space-x-4"
                        style={{
                          marginLeft: `${Math.sin(index * 0.5) * 100 + 100}px`,
                        }}
                      >
                        {/* Stage marker */}
                        <div className={`flex-shrink-0 w-16 h-16 bg-gradient-to-br ${archetypeColors[stage.archetype]} rounded-full flex items-center justify-center border-4 border-background shadow-xl`}>
                          {stageIcons[stage.id]}
                        </div>

                        {/* Stage content */}
                        <Card className="flex-1 max-w-2xl">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="text-xs">
                                    Stage {stage.order}
                                  </Badge>
                                  <Badge className={`bg-gradient-to-r ${archetypeColors[stage.archetype]} text-white text-xs`}>
                                    {stage.archetype}
                                  </Badge>
                                </div>
                                <h3 className="text-lg font-bold text-foreground">
                                  {stage.name}
                                </h3>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {stage.description}
                            </p>
                            
                            {/* Examples from pioneers */}
                            <div className="space-y-2">
                              <p className="text-xs font-semibold text-foreground">Examples:</p>
                              {pioneerJourneys.map(pioneer => {
                                const moment = pioneer.moments.find(m => m.stageId === stage.id);
                                if (!moment) return null;
                                return (
                                  <div key={pioneer.pioneerId} className="text-xs bg-secondary/50 p-2 rounded">
                                    <span className="font-semibold">{pioneer.pioneerName}:</span>{' '}
                                    <span className="text-muted-foreground">{moment.title}</span>
                                    {moment.year && (
                                      <span className="text-muted-foreground"> ({moment.year})</span>
                                    )}
                                  </div>
                                );
                              }).slice(0, 3)}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Individual Journeys View */}
        <TabsContent value="individual" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pioneer selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select a Pioneer</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-2">
                    {pioneerJourneys.map(pioneer => (
                      <button
                        key={pioneer.pioneerId}
                        onClick={() => setSelectedPioneer(pioneer.pioneerId)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          selectedPioneer === pioneer.pioneerId
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <h3 className="font-bold text-foreground">{pioneer.pioneerName}</h3>
                        <p className="text-xs text-muted-foreground mb-2">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          Born {pioneer.birthYear} • {pioneer.location}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {pioneer.keyThemes.slice(0, 3).map(theme => (
                            <Badge key={theme} variant="secondary" className="text-xs">
                              {theme}
                            </Badge>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Pioneer journey detail */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedPioneer
                    ? pioneerJourneys.find(p => p.pioneerId === selectedPioneer)?.pioneerName
                    : 'Select a pioneer'}
                </CardTitle>
                {selectedPioneer && (
                  <CardDescription>
                    Following their journey through the open source movement
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {selectedPioneer ? (
                  <ScrollArea className="h-[600px] pr-4">
                    {(() => {
                      const pioneer = pioneerJourneys.find(p => p.pioneerId === selectedPioneer);
                      if (!pioneer) return null;

                      return (
                        <div className="space-y-6">
                          {/* Pioneer overview */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              {pioneer.location}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {pioneer.keyThemes.map(theme => (
                                <Badge key={theme} variant="outline" className="text-xs">
                                  {theme}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Journey moments */}
                          <div className="relative">
                            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 via-orange-500 to-green-500 opacity-30"></div>
                            
                            <div className="space-y-6">
                              {pioneer.moments.map((moment, index) => {
                                const stage = heroJourneyStages.find(s => s.id === moment.stageId);
                                if (!stage) return null;

                                return (
                                  <div key={index} className="relative flex items-start space-x-4">
                                    <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${archetypeColors[stage.archetype]} rounded-full flex items-center justify-center border-4 border-background shadow-lg z-10`}>
                                      {stageIcons[stage.id]}
                                    </div>

                                    <Card className="flex-1">
                                      <CardContent className="p-3">
                                        <div className="flex items-start justify-between mb-2">
                                          <h4 className="text-sm font-bold text-foreground">
                                            {moment.title}
                                          </h4>
                                          {moment.year && (
                                            <Badge variant="outline" className="text-xs">
                                              {moment.year}
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-2">
                                          {moment.description}
                                        </p>
                                        {moment.location && (
                                          <p className="text-xs text-muted-foreground mb-2">
                                            <MapPin className="w-3 h-3 inline mr-1" />
                                            {moment.location}
                                          </p>
                                        )}
                                        <div className="space-y-1">
                                          {moment.themes.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                              {moment.themes.map(theme => (
                                                <Badge key={theme} variant="secondary" className="text-xs">
                                                  {theme}
                                                </Badge>
                                              ))}
                                            </div>
                                          )}
                                          {moment.challenges.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                              {moment.challenges.map(challenge => (
                                                <Badge key={challenge} variant="destructive" className="text-xs opacity-70">
                                                  {challenge}
                                                </Badge>
                                              ))}
                                            </div>
                                          )}
                                          {moment.relatedPioneers && moment.relatedPioneers.length > 0 && (
                                            <div className="flex items-center gap-1 text-xs text-primary">
                                              <Link2 className="w-3 h-3" />
                                              <span>Connected with other pioneers</span>
                                            </div>
                                          )}
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </ScrollArea>
                ) : (
                  <div className="h-[600px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
                      <p>Select a pioneer to view their journey</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Journey Overlaps View */}
        <TabsContent value="overlaps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Journey Overlaps &amp; Connections</CardTitle>
              <CardDescription>
                Select up to 3 pioneers to see how their journeys intersect in space, time, theme, and challenges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Pioneer selection for comparison */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {pioneerJourneys.map(pioneer => (
                    <button
                      key={pioneer.pioneerId}
                      onClick={() => toggleComparePioneer(pioneer.pioneerId)}
                      disabled={!comparePioneers.includes(pioneer.pioneerId) && comparePioneers.length >= 3}
                      className={`p-3 rounded-lg border-2 text-sm transition-all ${
                        comparePioneers.includes(pioneer.pioneerId)
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <p className="font-semibold">{pioneer.pioneerName}</p>
                      <p className="text-xs text-muted-foreground">{pioneer.birthYear}</p>
                    </button>
                  ))}
                </div>

                {/* Comparison results */}
                {comparePioneers.length >= 2 && (
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-6">
                      {comparePioneers.map((pioneerId1, i) => 
                        comparePioneers.slice(i + 1).map(pioneerId2 => {
                          const pioneer1 = pioneerJourneys.find(p => p.pioneerId === pioneerId1)!;
                          const pioneer2 = pioneerJourneys.find(p => p.pioneerId === pioneerId2)!;
                          const overlaps = findJourneyOverlaps(pioneer1, pioneer2);

                          return (
                            <Card key={`${pioneerId1}-${pioneerId2}`}>
                              <CardHeader>
                                <CardTitle className="text-lg">
                                  {pioneer1.pioneerName} ↔ {pioneer2.pioneerName}
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                {/* Shared themes */}
                                {overlaps.themes.length > 0 && (
                                  <div>
                                    <p className="text-sm font-semibold mb-2">Shared Themes:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {overlaps.themes.map(theme => (
                                        <Badge key={theme} className="bg-purple-500">
                                          {theme}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Shared challenges */}
                                {overlaps.sharedChallenges.length > 0 && (
                                  <div>
                                    <p className="text-sm font-semibold mb-2">Common Challenges:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {overlaps.sharedChallenges.map(challenge => (
                                        <Badge key={challenge} variant="destructive" className="opacity-70">
                                          {challenge}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Other overlaps */}
                                <div className="grid grid-cols-3 gap-2">
                                  <div className={`p-3 rounded-lg text-center ${overlaps.timeOverlap ? 'bg-green-500/20' : 'bg-secondary'}`}>
                                    <Calendar className="w-4 h-4 mx-auto mb-1" />
                                    <p className="text-xs font-semibold">Time Overlap</p>
                                    <p className="text-xs text-muted-foreground">
                                      {overlaps.timeOverlap ? 'Yes' : 'No'}
                                    </p>
                                  </div>
                                  <div className={`p-3 rounded-lg text-center ${overlaps.locationOverlap ? 'bg-green-500/20' : 'bg-secondary'}`}>
                                    <MapPin className="w-4 h-4 mx-auto mb-1" />
                                    <p className="text-xs font-semibold">Location Overlap</p>
                                    <p className="text-xs text-muted-foreground">
                                      {overlaps.locationOverlap ? 'Yes' : 'No'}
                                    </p>
                                  </div>
                                  <div className={`p-3 rounded-lg text-center ${overlaps.directCollaboration ? 'bg-green-500/20' : 'bg-secondary'}`}>
                                    <Link2 className="w-4 h-4 mx-auto mb-1" />
                                    <p className="text-xs font-semibold">Direct Collaboration</p>
                                    <p className="text-xs text-muted-foreground">
                                      {overlaps.directCollaboration ? 'Yes' : 'No'}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })
                      )}
                    </div>
                  </ScrollArea>
                )}

                {comparePioneers.length < 2 && (
                  <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Link2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
                      <p>Select at least 2 pioneers to compare their journeys</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Temporal View */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Temporal Journey View</CardTitle>
              <CardDescription>
                See how pioneers&apos; journeys unfolded across time and space
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="relative">
                  {/* Timeline by decade */}
                  {Array.from({ length: 8 }, (_, i) => 1950 + i * 10).map(decade => {
                    const momentsInDecade = pioneerJourneys.flatMap(pioneer =>
                      pioneer.moments
                        .filter(m => m.year && m.year >= decade && m.year < decade + 10)
                        .map(m => ({ ...m, pioneer }))
                    ).sort((a, b) => (a.year || 0) - (b.year || 0));

                    if (momentsInDecade.length === 0) return null;

                    return (
                      <div key={decade} className="mb-8">
                        <div className="sticky top-0 bg-background z-10 py-2 mb-4">
                          <h3 className="text-2xl font-bold text-foreground">
                            {decade}s
                          </h3>
                        </div>
                        
                        <div className="space-y-3 pl-4 border-l-4 border-primary/30">
                          {momentsInDecade.map((moment, idx) => (
                            <Card key={idx} className="ml-4">
                              <CardContent className="p-3">
                                <div className="flex items-start justify-between mb-1">
                                  <p className="text-xs font-semibold text-primary">
                                    {moment.pioneer.pioneerName}
                                  </p>
                                  <Badge variant="outline" className="text-xs">
                                    {moment.year}
                                  </Badge>
                                </div>
                                <h4 className="text-sm font-bold text-foreground mb-1">
                                  {moment.title}
                                </h4>
                                <p className="text-xs text-muted-foreground mb-2">
                                  {moment.description}
                                </p>
                                {moment.location && (
                                  <p className="text-xs text-muted-foreground">
                                    <MapPin className="w-3 h-3 inline mr-1" />
                                    {moment.location}
                                  </p>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Common themes and challenges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Common Themes</CardTitle>
            <CardDescription>Recurring themes across pioneer journeys</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {commonThemes.map(theme => (
                <Badge key={theme} variant="secondary">
                  {theme}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Common Challenges</CardTitle>
            <CardDescription>Shared obstacles faced by pioneers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {commonChallenges.map(challenge => (
                <Badge key={challenge} variant="destructive" className="opacity-70">
                  {challenge}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HeroJourneyView;
