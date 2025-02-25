import { useEffect, useState, useRef } from 'react';
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
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const chapterListRef = useRef<HTMLDivElement>(null);

  // Add effect to scroll active chapter into view
  useEffect(() => {
    if (chapterListRef.current) {
      const chapterElements = chapterListRef.current.children;
      if (chapterElements[currentChapterIndex]) {
        const chapterElement = chapterElements[currentChapterIndex] as HTMLElement;
        const container = chapterListRef.current;
        
        // Calculate the scroll position to place the chapter higher up
        const elementTop = chapterElement.offsetTop;
        const containerHeight = container.clientHeight;
        const offset = containerHeight * 0.35; // 35% from the top
        
        container.scrollTo({
          top: Math.max(0, elementTop - offset),
          behavior: 'smooth'
        });
      }
    }
  }, [currentChapterIndex]);

  // Add effect to update current chapter based on video time
  useEffect(() => {
    const findVideoElement = () => document.getElementById('hyperplayer') as HTMLVideoElement;
    let mediaElement = findVideoElement();
    
    const handleTimeChange = () => {
      mediaElement = findVideoElement();
      if (!mediaElement) return;

      const currentTime = mediaElement.currentTime;
      
      // Find the current chapter based on time
      const newChapterIndex = chapters.findIndex((chapter, index) => {
        const nextChapter = chapters[index + 1];
        const chapterEnd = nextChapter ? nextChapter.time.start : Infinity;
        return currentTime >= chapter.time.start && currentTime < chapterEnd;
      });

      // If we're before the first chapter, select the first chapter
      if (newChapterIndex === -1 && currentTime < chapters[0].time.start) {
        setCurrentChapterIndex(0);
        return;
      }
      
      // If we're after the last chapter, select the last chapter
      if (newChapterIndex === -1 && currentTime >= chapters[chapters.length - 1].time.start) {
        setCurrentChapterIndex(chapters.length - 1);
        return;
      }

      if (newChapterIndex !== -1) {
        setCurrentChapterIndex(newChapterIndex);
      }
    };

    // Create a MutationObserver to watch for player initialization/changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-media-status') {
          const status = mediaElement?.getAttribute('data-media-status');
          if (status === 'ready') {
            handleTimeChange();
          }
        }
      });
    });

    const setupEventListeners = () => {
      if (!mediaElement) return;
      
      // Remove any existing listeners first
      const events = ['timeupdate', 'seeking', 'seeked', 'loadedmetadata', 'play'];
      events.forEach(event => {
        mediaElement.removeEventListener(event, handleTimeChange);
        mediaElement.addEventListener(event, handleTimeChange);
      });
      
      // Observe changes to the video element
      observer.observe(mediaElement, { attributes: true });
      
      // Initial check
      handleTimeChange();
    };

    // Set up initial listeners
    setupEventListeners();

    // Check periodically for video element and reset listeners if needed
    const checkInterval = setInterval(() => {
      const currentElement = findVideoElement();
      if (currentElement && currentElement !== mediaElement) {
        mediaElement = currentElement;
        setupEventListeners();
      }
    }, 1000);

    return () => {
      observer.disconnect();
      clearInterval(checkInterval);
      if (mediaElement) {
        const events = ['timeupdate', 'seeking', 'seeked', 'loadedmetadata', 'play'];
        events.forEach(event => mediaElement.removeEventListener(event, handleTimeChange));
      }
    };
  }, [chapters]);

  const handleChapterClick = (time: number, e: React.MouseEvent | React.TouchEvent) => {
    // Prevent default behavior
    e.preventDefault();
    e.stopPropagation();

    if (videoRef.current) {
      const videoElement = document.getElementById('hyperplayer') as HTMLVideoElement;
      if (videoElement) {
        // Force the time update
        videoElement.currentTime = time;
        
        // Add a small delay to ensure the time is set before playing
        setTimeout(() => {
          if (isPlaying) {
            videoElement.play().catch(console.error);
          }
        }, 100);
      }
    }
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div ref={chapterListRef} className="h-full overflow-y-auto p-2 space-y-2">
        {chapters.map((chapter, index) => (
          <button
            key={chapter.time.start}
            onClick={(e) => handleChapterClick(chapter.time.start, e)}
            onTouchEnd={(e) => handleChapterClick(chapter.time.start, e)}
            className={cn(
              "text-left w-full p-2 hover:bg-gray-100 transition-colors border-l-2",
              index === currentChapterIndex 
                ? "bg-blue-50 border-l-blue-600" 
                : "border-l-transparent"
            )}
          >
            <div className="text-sm font-medium">{chapter.title}</div>
            <div className="text-xs text-gray-600">{chapter.timecode}</div>
            <div className="text-xs text-gray-500 mt-1 line-clamp-2">{chapter.synopsis}</div>
          </button>
        ))}
      </div>
    </Card>
  );
} 