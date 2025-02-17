"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import MuxPlayer, { MuxPlayerProps, MuxPlayerElement } from '@mux/mux-player-react';
import { ChapterMetadata } from "@/types/transcript";

interface VideoPlayerProps {
  playbackId: string;
  onPlayStateChange: (playing: boolean) => void;
  chapters: ChapterMetadata[];
  thumbnail: string;
}

interface MuxChapter {
  startTime: number;
  value: string;
}

const VideoPlayer = forwardRef<MuxPlayerElement, VideoPlayerProps>(
  ({ playbackId, onPlayStateChange, chapters, thumbnail }, ref) => {
    const playerRef = useRef<MuxPlayerElement>(null);
    const [mounted, setMounted] = useState(false);

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
    }, [mounted]);

    // Expose the video element methods
    useImperativeHandle(ref, () => ({
      play: () => playerRef.current?.play(),
      pause: () => playerRef.current?.pause(),
      get currentTime() {
        return playerRef.current?.currentTime || 0;
      },
      set currentTime(value: number) {
        if (playerRef.current) {
          playerRef.current.currentTime = value;
        }
      }
    }));

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
          themeColor="#eaaa11"
          defaultShowCaptions
          defaultShowChapters
          poster={thumbnail}
          storyboard={{
            src: `https://image.mux.com/${playbackId}/storyboard.vtt`,
            type: 'text/vtt'
          }}
        />
      </div>
    );
  }
);

VideoPlayer.displayName = "VideoPlayer";

export default VideoPlayer; 