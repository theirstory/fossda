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

// Extend MuxPlayerElement type to include event methods
interface ExtendedMuxPlayer extends MuxPlayerElement {
  on?: (event: string, handler: () => void) => void;
  off?: (event: string, handler: () => void) => void;
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

  // Update active chapter based on current time
  const updateActiveChapter = useCallback((currentTime: number) => {
    const newActiveChapter = findActiveChapter(currentTime);
    
    if (newActiveChapter && (!activeChapter || newActiveChapter.time.start !== activeChapter.time.start)) {
      console.log('Setting active chapter:', {
        title: newActiveChapter.title,
        start: newActiveChapter.time.start,
        currentTime,
        wasActive: activeChapter?.title
      });
      
      setActiveChapter(newActiveChapter);
      scrollToChapter(newActiveChapter);
    }
  }, [findActiveChapter, activeChapter, scrollToChapter]);

  // Set initial active chapter
  useEffect(() => {
    if (!chapters || chapters.length === 0) return;
    
    console.log('Setting initial active chapter');
    const initialChapter = chapters[0];
    setActiveChapter(initialChapter);
    scrollToChapter(initialChapter);
  }, [chapters, scrollToChapter]);

  // Effect for time updates
  useEffect(() => {
    console.log('Setting up time updates. Chapters:', chapters?.length);
    if (!videoRef?.current || !chapters || chapters.length === 0) return;

    const muxPlayer = videoRef.current as ExtendedMuxPlayer;

    // Handle time updates
    const handleTimeUpdate = () => {
      const currentTime = muxPlayer.currentTime;
      updateActiveChapter(currentTime);
    };

    // Handle seeking
    const handleSeeking = () => {
      const currentTime = muxPlayer.currentTime;
      console.log('Seek event:', currentTime);
      updateActiveChapter(currentTime);
    };

    // Try to use Mux Player's event system
    if (muxPlayer.on) {
      console.log('Using Mux Player event system');
      muxPlayer.on('timeupdate', handleTimeUpdate);
      muxPlayer.on('seeking', handleSeeking);
      muxPlayer.on('seeked', handleSeeking);
    }
    
    // Set initial chapter based on current time
    if (typeof muxPlayer.currentTime === 'number') {
      updateActiveChapter(muxPlayer.currentTime);
    }
    
    // Set up polling as a backup
    const pollInterval = setInterval(() => {
      if (typeof muxPlayer.currentTime === 'number') {
        updateActiveChapter(muxPlayer.currentTime);
      }
    }, 1000); // Poll every second
    
    return () => {
      if (muxPlayer.off) {
        muxPlayer.off('timeupdate', handleTimeUpdate);
        muxPlayer.off('seeking', handleSeeking);
        muxPlayer.off('seeked', handleSeeking);
      }
      clearInterval(pollInterval);
    };
  }, [chapters, videoRef, updateActiveChapter]);

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
        
        // Update the URL with the start time
        const url = new URL(window.location.href);
        url.searchParams.set('start', chapter.time.start.toString());
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