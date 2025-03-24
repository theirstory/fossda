import { useEffect, useState, useRef, useCallback } from 'react';
import { ChapterMetadata } from '@/types/transcript';
import { cn } from '@/lib/utils';
import { Card } from './ui/card';
import { MuxPlayerElement } from '@mux/mux-player-react';

interface VideoChaptersProps {
  chapters: ChapterMetadata[];
  videoRef: React.RefObject<MuxPlayerElement | null>;
  isPlaying: boolean;
  className?: string;
}

export default function VideoChapters({
  chapters,
  videoRef,
  isPlaying,
  className
}: VideoChaptersProps) {
  const [activeChapter, setActiveChapter] = useState<ChapterMetadata | null>(null);
  const chapterListRef = useRef<HTMLDivElement>(null);
  const lastTimeRef = useRef<number>(0);

  // Function to find the active chapter based on current time
  const findActiveChapter = useCallback((currentTime: number) => {
    // If we're at the same time as before, return the current active chapter
    if (currentTime === lastTimeRef.current && activeChapter) {
      return activeChapter;
    }
    
    // Update the last time we checked
    lastTimeRef.current = currentTime;
    
    console.log('Finding chapter for time:', currentTime);
    
    // Sort chapters by start time to ensure proper order
    const sortedChapters = [...chapters].sort((a, b) => a.time.start - b.time.start);
    
    // Find the chapter that contains the current time
    for (let i = 0; i < sortedChapters.length; i++) {
      const chapter = sortedChapters[i];
      const nextChapter = sortedChapters[i + 1];
      
      const chapterStart = chapter.time.start;
      const chapterEnd = nextChapter ? nextChapter.time.start : Infinity;
      
      if (currentTime >= chapterStart && currentTime < chapterEnd) {
        console.log('Found matching chapter:', {
          title: chapter.title,
          start: chapterStart,
          end: chapterEnd,
          currentTime
        });
        return chapter;
      }
    }
    
    // If we're before the first chapter
    if (sortedChapters.length > 0 && currentTime < sortedChapters[0].time.start) {
      console.log('Before first chapter, returning first chapter:', sortedChapters[0].title);
      return sortedChapters[0];
    }
    
    console.log('No matching chapter found');
    return null;
  }, [chapters, activeChapter]);

  // Scroll to chapter helper function
  const scrollToChapter = useCallback((chapter: ChapterMetadata) => {
    if (!chapter || !chapterListRef.current) return;

    const chapterElements = chapterListRef.current.children;
    const index = chapters.findIndex((c) => c.time.start === chapter.time.start);
    if (chapterElements[index]) {
      const chapterElement = chapterElements[index] as HTMLElement;
      const container = chapterListRef.current;
      
      const elementTop = chapterElement.offsetTop;
      const containerHeight = container.clientHeight;
      const offset = containerHeight * 0.35;
      
      container.scrollTo({
        top: Math.max(0, elementTop - offset),
        behavior: 'smooth'
      });
    }
  }, [chapters]);

  // Set initial active chapter
  useEffect(() => {
    if (!chapters || chapters.length === 0) return;
    
    const handleInitialChapter = () => {
      if (videoRef.current) {
        const currentTime = videoRef.current.currentTime;
        if (typeof currentTime === 'number') {
          const initialChapter = findActiveChapter(currentTime);
          if (initialChapter) {
            setActiveChapter(initialChapter);
            scrollToChapter(initialChapter);
          }
        } else {
          // If no current time, default to first chapter
          const initialChapter = chapters[0];
          setActiveChapter(initialChapter);
          scrollToChapter(initialChapter);
        }
      }
    };

    // Handle initial chapter when video is loaded
    const videoElement = document.getElementById('hyperplayer') as HTMLVideoElement;
    if (videoElement) {
      videoElement.addEventListener('loadedmetadata', handleInitialChapter);
      // Also try immediately in case video is already loaded
      handleInitialChapter();
      
      return () => {
        videoElement.removeEventListener('loadedmetadata', handleInitialChapter);
      };
    }
  }, [chapters, videoRef, findActiveChapter, scrollToChapter]);

  // Effect for time updates
  useEffect(() => {
    if (!videoRef?.current || !chapters || chapters.length === 0) return;

    const muxPlayer = videoRef.current;
    let rafId: number;

    const handleTimeUpdate = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }

      rafId = requestAnimationFrame(() => {
        const currentTime = muxPlayer.currentTime;
        if (typeof currentTime === 'number') {
          const newActiveChapter = findActiveChapter(currentTime);
          if (newActiveChapter && (!activeChapter || newActiveChapter.time.start !== activeChapter.time.start)) {
            setActiveChapter(newActiveChapter);
            scrollToChapter(newActiveChapter);
          }
        }
      });
    };

    const handleVideoSeeked = (e: CustomEvent) => {
      if (e.detail && typeof e.detail.time === 'number') {
        const newActiveChapter = findActiveChapter(e.detail.time);
        if (newActiveChapter) {
          setActiveChapter(newActiveChapter);
          scrollToChapter(newActiveChapter);
        }
      }
    };

    // Set up event listeners
    window.addEventListener('videoSeeked', handleVideoSeeked as EventListener);
    
    // Get the underlying video element
    const videoElement = document.getElementById('hyperplayer') as HTMLVideoElement;
    if (videoElement) {
      // Set up event listeners for the video element
      videoElement.addEventListener('timeupdate', handleTimeUpdate);
      videoElement.addEventListener('seeking', handleTimeUpdate);
      videoElement.addEventListener('seeked', handleTimeUpdate);

      // Initial check for current time
      if (typeof muxPlayer.currentTime === 'number') {
        const initialChapter = findActiveChapter(muxPlayer.currentTime);
        if (initialChapter) {
          setActiveChapter(initialChapter);
          scrollToChapter(initialChapter);
        }
      }
    }
    
    return () => {
      window.removeEventListener('videoSeeked', handleVideoSeeked as EventListener);
      if (videoElement) {
        videoElement.removeEventListener('timeupdate', handleTimeUpdate);
        videoElement.removeEventListener('seeking', handleTimeUpdate);
        videoElement.removeEventListener('seeked', handleTimeUpdate);
      }
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [chapters, videoRef, activeChapter, findActiveChapter, scrollToChapter]);

  const handleChapterClick = (chapter: ChapterMetadata, e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('Chapter clicked:', chapter.title);

    if (videoRef.current) {
      const muxPlayer = videoRef.current;
      console.log('Seeking to time:', chapter.time.start);
      
      // Set the current time using the Mux Player element
      if (typeof muxPlayer.currentTime === 'number') {
        muxPlayer.currentTime = chapter.time.start;
        setActiveChapter(chapter);
        
        // Update the URL with the start time and remove end time
        const url = new URL(window.location.href);
        url.searchParams.set('start', chapter.time.start.toString());
        url.searchParams.delete('end'); // Remove the end time parameter
        window.history.pushState({}, '', url.toString());
        
        if (isPlaying && typeof muxPlayer.play === 'function') {
          muxPlayer.play().catch(console.error);
        }
      }
    }
  };

  if (!chapters || chapters.length === 0) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <div className="p-4 text-center text-gray-500">
          No chapters available for this video.
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div ref={chapterListRef} className="h-full overflow-y-auto p-2 space-y-2">
        {chapters.map((chapter) => {
          const isActive = activeChapter?.time.start === chapter.time.start;
          return (
            <button
              key={chapter.time.start}
              onClick={(e) => handleChapterClick(chapter, e)}
              onTouchEnd={(e) => handleChapterClick(chapter, e)}
              className={cn(
                "text-left w-full p-2 hover:bg-gray-100 transition-colors border-l-2",
                isActive ? "bg-blue-50 border-l-blue-600 font-medium" : "border-l-transparent"
              )}
            >
              <div className="text-sm font-medium">{chapter.title}</div>
              <div className="text-xs text-gray-600">{chapter.timecode}</div>
              <div className="text-xs text-gray-500 mt-1 line-clamp-2">{chapter.synopsis}</div>
            </button>
          );
        })}
      </div>
    </Card>
  );
} 