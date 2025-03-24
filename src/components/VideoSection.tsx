"use client";

import { useState, useRef, useEffect } from "react";
import VideoPlayer from "./VideoPlayer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import InteractiveTranscript from "./InteractiveTranscript";
import { chapterData } from '@/data/chapters';
import { MuxPlayerElement } from '@mux/mux-player-react';
import RelatedVideos from "./RelatedVideos";
import VideoClips from "./VideoClips";
import { useSearchParams, usePathname } from 'next/navigation';
import { clips } from "@/data/clips";
import VideoChapters from "./VideoChapters";
import { Button } from "./ui/button";
import { ChevronDown, ChevronUp, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import CitationButton from "./CitationButton";
import { ShareButtons } from "./ShareButtons";
import { VideoId } from "@/data/videos";

interface VideoSectionProps {
  videoId: VideoId;
  transcriptHtml: string;
  playbackId: string;
  currentVideo: {
    id: string;
    title: string;
    duration: string;
    thumbnail: string;
    description: string;
    summary: string;
  };
}

export default function VideoSection({ videoId, transcriptHtml, playbackId, currentVideo }: VideoSectionProps) {
  const videoRef = useRef<MuxPlayerElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const startTime = searchParams.get('start') || searchParams.get('t');
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [isChaptersOpen, setIsChaptersOpen] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const transcriptRef = useRef<HTMLDivElement>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("transcript");
  
  // Add error handling and fallback for chapter data
  const videoChapters = chapterData[videoId] || {
    title: currentVideo.title,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    metadata: []
  };

  // Helper function to construct URL with ordered parameters
  const constructOrderedUrl = (url: URL, currentTime?: number) => {
    // Create a new URL to avoid modifying the original
    const orderedUrl = new URL(url.toString());
    
    // Clear all existing parameters
    orderedUrl.search = '';
    
    // Add parameters in desired order
    if (currentTime !== undefined && currentTime > 0) {
      orderedUrl.searchParams.set('start', currentTime.toString());
    } else if (url.searchParams.has('start')) {
      orderedUrl.searchParams.set('start', url.searchParams.get('start')!);
    } else if (url.searchParams.has('t')) {
      // Handle legacy 't' parameter by converting it to 'start'
      orderedUrl.searchParams.set('start', url.searchParams.get('t')!);
    }
    
    if (url.searchParams.has('end')) {
      orderedUrl.searchParams.set('end', url.searchParams.get('end')!);
    }
    
    // Add any other parameters that might exist
    url.searchParams.forEach((value, key) => {
      if (key !== 'start' && key !== 'end' && key !== 't') {
        orderedUrl.searchParams.set(key, value);
      }
    });
    
    return orderedUrl;
  };

  // Initial URL update to convert 't' to 'start' and order parameters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const tParam = url.searchParams.get('t');
      const startParam = url.searchParams.get('start');
      
      if (tParam || startParam) {
        const orderedUrl = constructOrderedUrl(url, tParam ? parseFloat(tParam) : parseFloat(startParam!));
        window.history.replaceState({}, '', orderedUrl.toString());
        setCurrentUrl(orderedUrl.toString());
      } else {
        const orderedUrl = constructOrderedUrl(url);
        if (orderedUrl.toString() !== url.toString()) {
          window.history.replaceState({}, '', orderedUrl.toString());
        }
        setCurrentUrl(orderedUrl.toString());
      }
    }
  }, []);

  // Update URL when video changes or timestamp changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const currentTime = videoRef.current ? videoRef.current.currentTime : undefined;
      const orderedUrl = constructOrderedUrl(url, currentTime);
      setCurrentUrl(orderedUrl.toString());
    }
  }, [pathname, videoId, startTime]);

  // Update URL when video time changes
  useEffect(() => {
    const updateUrlWithTimestamp = () => {
      if (typeof window !== 'undefined' && videoRef.current) {
        const url = new URL(window.location.href);
        const currentTime = videoRef.current.currentTime;
        const orderedUrl = constructOrderedUrl(url, currentTime);
        setCurrentUrl(orderedUrl.toString());
      }
    };

    const muxPlayer = videoRef.current;
    if (muxPlayer) {
      muxPlayer.ontimeupdate = updateUrlWithTimestamp;
      return () => {
        if (muxPlayer) {
          muxPlayer.ontimeupdate = null;
        }
      };
    }
    return () => {}; // Add empty cleanup function for when muxPlayer is null
  }, [videoRef]);

  // Handle initial timestamp
  useEffect(() => {
    const handleInitialTimestamp = () => {
      if (videoRef.current && startTime) {
        const timeInSeconds = parseFloat(startTime);
        if (!isNaN(timeInSeconds)) {
          videoRef.current.currentTime = timeInSeconds;
          // Dispatch custom event for chapter and transcript updates
          const event = new CustomEvent('videoSeeked', { 
            detail: { time: timeInSeconds } 
          });
          window.dispatchEvent(event);
          
          // Also trigger a timeupdate event for the transcript
          const videoElement = document.getElementById('hyperplayer') as HTMLVideoElement;
          if (videoElement) {
            const timeUpdateEvent = new Event('timeupdate');
            videoElement.dispatchEvent(timeUpdateEvent);
          }
        }
      }
    };

    // Try to set timestamp immediately
    handleInitialTimestamp();

    // Also set up a listener for when the video element is ready
    const videoElement = document.getElementById('hyperplayer') as HTMLVideoElement;
    if (videoElement) {
      videoElement.addEventListener('loadedmetadata', handleInitialTimestamp);
      return () => {
        videoElement.removeEventListener('loadedmetadata', handleInitialTimestamp);
      };
    }
  }, [startTime]);

  const handlePlayStateChange = (playing: boolean) => {
    setIsPlaying(playing);
  };

  const handleClipClick = (timestamp: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
      videoRef.current.play();
      setActiveTab("transcript");
    }
  };

  console.log('VideoSection playbackId:', {
    id: playbackId,
    length: playbackId.length,
    chars: Array.from(playbackId).map(c => c.charCodeAt(0))
  });

  // Get number of clips for this video
  const clipCount = clips.filter(clip => clip.interviewId === videoId).length;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update the timeupdate listener to use videoRef
  useEffect(() => {
    const muxPlayer = videoRef.current;
    if (!muxPlayer || !transcriptRef.current || !transcriptContainerRef.current) {
      return undefined;
    }

    // Get the underlying video element
    const videoElement = document.getElementById('hyperplayer') as HTMLVideoElement;
    if (!videoElement) {
      return undefined;
    }

    const handleTimeUpdate = () => {
      const currentTime = videoElement.currentTime * 1000; // Convert to ms
      const spans = Array.from(transcriptRef.current?.querySelectorAll('span[data-m]') || []);
      
      // Find the current or next span
      let currentSpan: HTMLSpanElement | null = null;
      for (const span of spans as HTMLSpanElement[]) {
        const spanTime = parseInt(span.getAttribute('data-m') || '0', 10);
        if (spanTime <= currentTime) {
          currentSpan = span;
        } else {
          break;
        }
      }
      
      if (currentSpan && transcriptContainerRef.current) {
        const container = transcriptContainerRef.current;
        
        // Calculate offset for mobile header and tabs
        const isMobile = window.innerWidth < 1024; // lg breakpoint
        const mobileOffset = isMobile ? 48 : 0; // Height of the tabs
        
        // Get container dimensions
        const containerRect = container.getBoundingClientRect();
        const spanRect = currentSpan.getBoundingClientRect();
        
        // Calculate scroll position - use different positions for mobile and desktop
        const targetPosition = containerRect.height * (isMobile ? 0.15 : 0.35);
        const currentOffset = spanRect.top - containerRect.top;
        const scrollAdjustment = currentOffset - targetPosition - mobileOffset;
        
        // Scroll with the calculated offset
        container.scrollTo({
          top: container.scrollTop + scrollAdjustment,
          behavior: 'smooth'
        });

        // Highlight current span
        spans.forEach((span: Element) => span.classList.remove('bg-yellow-100'));
        currentSpan.classList.add('bg-yellow-100');
      }
    };

    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('seeking', handleTimeUpdate);
    
    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('seeking', handleTimeUpdate);
      return undefined;
    };
  }, [mounted, videoRef]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-4 h-full">
      <div className="flex flex-col gap-4">
        <div className="bg-white rounded-lg shadow-lg">
          <VideoPlayer
            ref={videoRef}
            playbackId={playbackId}
            onPlayStateChange={handlePlayStateChange}
            chapters={videoChapters.metadata}
            thumbnail={currentVideo.thumbnail}
            onLoadedMetadata={() => {
              if (videoRef.current && startTime) {
                const timeInSeconds = parseFloat(startTime);
                if (!isNaN(timeInSeconds)) {
                  videoRef.current.currentTime = timeInSeconds;
                  // Dispatch custom event for chapter and transcript updates
                  const event = new CustomEvent('videoSeeked', { 
                    detail: { time: timeInSeconds } 
                  });
                  window.dispatchEvent(event);
                  
                  // Also trigger a timeupdate event for the transcript
                  const videoElement = document.getElementById('hyperplayer') as HTMLVideoElement;
                  if (videoElement) {
                    const timeUpdateEvent = new Event('timeupdate');
                    videoElement.dispatchEvent(timeUpdateEvent);
                  }
                }
              }
            }}
          />
        </div>

        {/* Summary and Chapters Section - Mobile Only */}
        <div className="lg:hidden">
          <div className="flex justify-between gap-2 mb-2">
            <Button
              variant="ghost"
              onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
              className="flex-1 flex items-center justify-between p-4 rounded-lg bg-white shadow"
            >
              <span className="text-sm font-semibold text-gray-900">Summary</span>
              {isSummaryExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            <Sheet open={isChaptersOpen} onOpenChange={setIsChaptersOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex-1 flex items-center justify-between p-4 rounded-lg bg-white shadow"
                >
                  <span className="text-sm font-semibold text-gray-900">Chapters</span>
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh]">
                <SheetHeader>
                  <SheetTitle>Chapters</SheetTitle>
                </SheetHeader>
                <div className="mt-4 h-full overflow-y-auto pb-8">
                  <VideoChapters
                    chapters={videoChapters.metadata}
                    videoRef={videoRef}
                    isPlaying={isPlaying}
                  />
                </div>
              </SheetContent>
            </Sheet>

            <ShareButtons
              title={currentVideo.title}
              url={currentUrl}
              summary={currentVideo.description}
            />
            <CitationButton
              title={currentVideo.title}
              speaker={currentVideo.title.split(" - ")[0]}
              url={currentUrl}
              duration={currentVideo.duration}
            />
          </div>

          <div className={cn(
            "overflow-hidden transition-all duration-200 bg-white rounded-lg shadow-lg",
            isSummaryExpanded ? "max-h-96" : "max-h-0"
          )}>
            <div className="p-4">
              <div className="prose prose-sm max-w-none text-gray-600">
                {currentVideo.summary}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Section - Desktop Only */}
        <div className="hidden lg:block bg-white rounded-lg shadow-lg">
          <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">
              Summary
            </h2>
            <div className="prose prose-sm max-w-none text-gray-600">
              {currentVideo.summary}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg h-full flex flex-col overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="w-full border-b flex-shrink-0 flex items-center px-2">
            <div className="flex-1" />
            <div className="flex gap-2">
              <TabsTrigger value="transcript">Transcription</TabsTrigger>
              <TabsTrigger value="clips">
                Clips ({clipCount})
              </TabsTrigger>
              <TabsTrigger value="related">Related Videos</TabsTrigger>
            </div>
            <div className="flex-1 flex justify-end gap-2">
              <div className="hidden lg:flex gap-2">
                <ShareButtons
                  title={currentVideo.title}
                  url={currentUrl}
                  summary={currentVideo.description}
                />
                <CitationButton
                  title={currentVideo.title}
                  speaker={currentVideo.title.split(" - ")[0]}
                  url={currentUrl}
                  duration={currentVideo.duration}
                />
              </div>
            </div>
          </TabsList>
          <div className="flex-1 overflow-hidden">
            <TabsContent value="transcript" className="h-full overflow-auto">
              <div className="relative h-full">
                {/* Desktop Layout */}
                <div className="h-full grid grid-cols-1 lg:grid-cols-[250px,1fr]">
                  <div className="hidden lg:block h-full overflow-auto">
                    <VideoChapters
                      chapters={videoChapters.metadata}
                      videoRef={videoRef}
                      isPlaying={isPlaying}
                      className="h-full"
                    />
                  </div>
                  <InteractiveTranscript
                    transcriptHtml={transcriptHtml}
                    videoRef={videoRef}
                    isPlaying={isPlaying}
                    chapters={videoChapters.metadata}
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="clips" className="h-full overflow-auto p-4">
              <VideoClips interviewId={videoId} onClipClick={handleClipClick} />
            </TabsContent>
            <TabsContent value="related" className="h-full overflow-auto p-4">
              <RelatedVideos currentVideoId={currentVideo.id} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
} 