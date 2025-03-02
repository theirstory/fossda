"use client";

import { stories } from "@/data/stories";
import { chapterData } from "@/data/chapters";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Clock, User, Video, ChevronRight, ChevronDown } from "lucide-react";
import { use, useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import InteractiveTranscript from "@/components/InteractiveTranscript";
import { MuxPlayerElement } from '@mux/mux-player-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

interface StoryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function StoryPage({ params }: StoryPageProps) {
  const { id } = use(params);
  const story = stories.find((s) => s.id === id);
  const router = useRouter();
  const [activeView, setActiveView] = useState<'arc' | 'question' | 'themes'>('arc');
  const videoRef = useRef<MuxPlayerElement | null>(null);
  const [filteredTranscript, setFilteredTranscript] = useState<string>('');

  if (!story) {
    notFound();
  }

  // Get all stories from the same interview
  const interviewStories = stories.filter(s => s.interviewId === story.interviewId);
  const currentStoryIndex = interviewStories.findIndex(s => s.id === story.id);
  const previousStory = interviewStories[currentStoryIndex - 1];
  const nextStory = interviewStories[currentStoryIndex + 1];

  // Get all unique interviews that have stories
  const interviews = Array.from(
    new Map(
      stories.map(s => [s.interviewId, {
        id: s.interviewId,
        title: chapterData[s.interviewId].title
      }])
    ).values()
  );

  // Navigation functions
  const navigateToStory = (storyId: string) => {
    router.push(`/story/${storyId}`);
  };

  useEffect(() => {
    // Fetch the transcript
    fetch(`/transcripts/${story.interviewId}.html`)
      .then(response => response.text())
      .then(html => {
        // Filter transcript to only show the portion between start and end times
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const spans = Array.from(doc.querySelectorAll('span[data-m]'));
        
        // Keep spans within the time range
        spans.forEach(span => {
          const time = parseInt(span.getAttribute('data-m') || '0', 10);
          if (time < story.timeRange.start * 1000 || time > story.timeRange.end * 1000) {
            span.remove();
          }
        });
        
        setFilteredTranscript(doc.body.innerHTML);
      })
      .catch(error => {
        console.error('Error loading transcript:', error);
      });
  }, [story.interviewId, story.timeRange.start, story.timeRange.end]);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/stories" className="hover:text-gray-900">Stories</Link>
            <ChevronRight className="h-4 w-4" />
            
            {/* Interview Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-auto p-0 font-normal hover:text-gray-900">
                  {story.character.name}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {interviews.map((interview) => (
                  <DropdownMenuItem
                    key={interview.id}
                    onClick={() => {
                      const firstStory = stories.find(s => s.interviewId === interview.id);
                      if (firstStory) {
                        navigateToStory(firstStory.id);
                      }
                    }}
                  >
                    {interview.title}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <ChevronRight className="h-4 w-4" />
            
            {/* Story Title Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-auto p-0 font-normal text-gray-900">
                  {story.title}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {interviewStories.map((s) => (
                  <DropdownMenuItem
                    key={s.id}
                    onClick={() => navigateToStory(s.id)}
                  >
                    {s.title}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left sidebar */}
          <div className="w-full md:w-64 flex-shrink-0 space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">{story.title}</h1>
              <div className="flex flex-col gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{story.character.role}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{story.chapterRef.timecode}</span>
                </div>
              </div>
            </div>

            {/* Story Navigation */}
            <div className="flex gap-2">
              {previousStory && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => navigateToStory(previousStory.id)}
                >
                  Previous
                </Button>
              )}
              {nextStory && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => navigateToStory(nextStory.id)}
                >
                  Next
                </Button>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                className={cn(
                  "justify-start",
                  activeView === 'arc' && "bg-gray-100"
                )}
                onClick={() => setActiveView('arc')}
              >
                Arc
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  "justify-start",
                  activeView === 'question' && "bg-gray-100"
                )}
                onClick={() => setActiveView('question')}
              >
                Question
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  "justify-start",
                  activeView === 'themes' && "bg-gray-100"
                )}
                onClick={() => setActiveView('themes')}
              >
                Themes & Values
              </Button>
            </div>

            <Button asChild className="w-full">
              <Link href={`/video/${story.interviewId}?start=${story.timeRange.start}&end=${story.timeRange.end}`}>
                <Video className="mr-2 h-4 w-4" />
                Watch this Story
              </Link>
            </Button>
          </div>

          {/* Main content */}
          <div className="flex-1">
            {/* Transcript and Context Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[250px_3fr] gap-6">
              {/* Context Section */}
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  {activeView === 'arc' && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-lg font-semibold mb-4">Arc</h2>
                        <p className="text-sm text-gray-600 mb-6">
                          From Chapter: {story.chapterRef.title}
                        </p>
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-medium mb-2">Conflict</h3>
                            <p className="text-gray-600">{story.conflict}</p>
                          </div>
                          <div>
                            <h3 className="font-medium mb-2">Resolution</h3>
                            <p className="text-gray-600">{story.resolution}</p>
                          </div>
                          {story.lesson && (
                            <div>
                              <h3 className="font-medium mb-2">Lesson Learned</h3>
                              <p className="text-gray-600 italic">{story.lesson}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeView === 'question' && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-lg font-semibold mb-4">Question</h2>
                        <div className="space-y-4">
                          <p className="text-gray-600">{story.elicitingQuestion}</p>
                          {story.humor && (
                            <div>
                              <h3 className="font-medium mb-2">Humorous Elements</h3>
                              <p className="text-gray-600">{story.humor}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeView === 'themes' && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-lg font-semibold mb-4">Themes & Values</h2>
                        <div className="space-y-6">
                          <div>
                            <h3 className="font-medium mb-3">Major Themes</h3>
                            <div className="flex flex-wrap gap-2">
                              {story.themes.map((theme) => (
                                <span
                                  key={theme}
                                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                                >
                                  {theme}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-medium mb-3">Core Values</h3>
                            <div className="flex flex-wrap gap-2">
                              {story.values.map((value) => (
                                <span
                                  key={value}
                                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700"
                                >
                                  {value}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Transcript Section */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-4 border-b">
                  <h2 className="text-lg font-semibold">Transcript</h2>
                </div>
                <div className="h-[600px]">
                  <InteractiveTranscript
                    transcriptHtml={filteredTranscript}
                    videoRef={videoRef}
                    isPlaying={false}
                    chapters={[]}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 