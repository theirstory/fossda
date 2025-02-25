"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import MuxPlayer, { MuxPlayerElement } from '@mux/mux-player-react';
import { ChapterMetadata } from "@/types/transcript";

interface VideoPlayerProps {
  playbackId: string;
  onPlayStateChange: (playing: boolean) => void;
  chapters: ChapterMetadata[];
  thumbnail: string;
  onLoadedMetadata?: () => void;
}

interface MuxChapter {
  startTime: number;
  value: string;
}

const VideoPlayer = forwardRef<MuxPlayerElement, VideoPlayerProps>(
  function VideoPlayer({ playbackId, onPlayStateChange, chapters, thumbnail, onLoadedMetadata }, ref) {
    const playerRef = useRef<MuxPlayerElement>(null);
    const [mounted, setMounted] = useState(false);
    const lastTimeRef = useRef<number>(0);
    const currentTimeRef = useRef<number | undefined>(undefined);

    // Add error handling for HLS
    useEffect(() => {
      if (mounted && playerRef.current) {
        // Suppress HLS errors
        const originalError = console.error;
        console.error = (...args) => {
          if (args[0]?.toString().includes('getErrorFromHlsErrorData')) {
            return;
          }
          originalError.apply(console, args);
        };

        return () => {
          console.error = originalError;
        };
      }
      return undefined;
    }, [mounted]);

    // Restore video control methods while maintaining type safety
    useImperativeHandle(ref, () => {
      const basePlayer = playerRef.current as MuxPlayerElement;
      
      return {
        ...basePlayer,
        play: async () => {
          if (playerRef.current) {
            return playerRef.current.play();
          }
          return Promise.resolve();
        },
        pause: () => {
          if (playerRef.current) {
            playerRef.current.pause();
          }
        },
        get currentTime() {
          return playerRef.current?.currentTime || 0;
        },
        set currentTime(value: number) {
          if (playerRef.current) {
            playerRef.current.currentTime = value;
          }
        }
      } as MuxPlayerElement;
    }, [playerRef]);

    useEffect(() => {
      setMounted(true);
    }, []);

    // Add chapters when the player mounts
    useEffect(() => {
      if (mounted && playerRef.current && 'addChapters' in playerRef.current) {
        const muxChapters: MuxChapter[] = chapters.map(chapter => ({
          startTime: chapter.time.start,
          value: chapter.title
        }));
        
        const player = playerRef.current as MuxPlayerElement & { addChapters: (chapters: MuxChapter[]) => void };
        player.addChapters(muxChapters);
      }
    }, [mounted, chapters]);

    useEffect(() => {
      if (!playerRef.current) return;

      const player = playerRef.current;

      // Force a seek when currentTime is set externally
      const handleTimeUpdate = () => {
        if (player.currentTime !== lastTimeRef.current) {
          lastTimeRef.current = player.currentTime;
        }
      };

      // Handle seeking explicitly
      const handleSeeking = () => {
        // Force a time update when seeking
        if (player.currentTime !== lastTimeRef.current) {
          lastTimeRef.current = player.currentTime;
          // Dispatch a custom event that other components can listen for
          const event = new CustomEvent('videoSeeked', { 
            detail: { time: player.currentTime } 
          });
          window.dispatchEvent(event);
        }
      };

      player.addEventListener('timeupdate', handleTimeUpdate);
      player.addEventListener('seeking', handleSeeking);
      player.addEventListener('seeked', handleSeeking);

      return () => {
        player.removeEventListener('timeupdate', handleTimeUpdate);
        player.removeEventListener('seeking', handleSeeking);
        player.removeEventListener('seeked', handleSeeking);
      };
    }, []);

    useEffect(() => {
      if (!playerRef.current) return;

      // Handle external time updates
      const player = playerRef.current;
      if (typeof currentTimeRef.current === 'number' && !isNaN(currentTimeRef.current)) {
        // Force the time update and ensure it's applied
        player.currentTime = currentTimeRef.current;
        lastTimeRef.current = currentTimeRef.current;
      }
    }, []);

    if (!mounted) {
      return (
        <div className="relative bg-black rounded-lg overflow-hidden">
          <div className="aspect-video bg-black animate-pulse" />
        </div>
      );
    }

    return (
      <div className="relative bg-black rounded-lg overflow-hidden">
        <MuxPlayer
          id="hyperplayer"
          ref={playerRef}
          streamType="on-demand"
          playbackId={playbackId}
          metadata={{
            video_title: 'FOSSDA Interview',
            player_name: 'FOSSDA Player',
          }}
          onPlay={() => onPlayStateChange(true)}
          onPause={() => onPlayStateChange(false)}
          onLoadedMetadata={onLoadedMetadata}
          accentColor="#eaaa11"
          defaultShowCaptions
          defaultShowChapters
          poster={thumbnail}
        />
      </div>
    );
  }
);

VideoPlayer.displayName = "VideoPlayer";

export default VideoPlayer; 