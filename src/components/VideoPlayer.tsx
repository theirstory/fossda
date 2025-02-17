"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import MuxPlayer, { MuxPlayerProps, MuxPlayerElement } from '@mux/mux-player-react';
import { ChapterMetadata } from "@/types/transcript";

interface VideoPlayerProps {
  playbackId: string;
  onPlayStateChange: (playing: boolean) => void;
  isPlaying: boolean;
  chapters: ChapterMetadata[];
}

const VideoPlayer = forwardRef<MuxPlayerElement, VideoPlayerProps>(
  ({ playbackId, onPlayStateChange, isPlaying, chapters }, ref) => {
    const videoRef = useRef<MuxPlayerElement>(null);
    const [mounted, setMounted] = useState(false);

    // Add error handling for HLS
    useEffect(() => {
      if (mounted && videoRef.current) {
        const player = videoRef.current;
        
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
      ...videoRef.current!,
      currentTime: videoRef.current?.currentTime ?? 0,
      duration: videoRef.current?.duration ?? 0,
      play: async () => {
        if (videoRef.current) {
          return videoRef.current.play();
        }
        return Promise.resolve();
      },
      pause: () => {
        if (videoRef.current) {
          videoRef.current.pause();
        }
      }
    }));

    useEffect(() => {
      setMounted(true);
    }, []);

    // Add chapters when the player mounts
    useEffect(() => {
      if (mounted && videoRef.current && 'addChapters' in videoRef.current) {
        const muxChapters = chapters.map(chapter => ({
          startTime: chapter.time.start,
          value: chapter.title
        }));
        
        (videoRef.current as any).addChapters(muxChapters);
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
          ref={videoRef}
          streamType="on-demand"
          playbackId={playbackId}
          metadata={{
            video_title: 'Introduction to FOSSDA',
            player_name: 'FOSSDA Player',
          }}
          onPlay={() => onPlayStateChange(true)}
          onPause={() => onPlayStateChange(false)}
          accentColor="#eaaa11"
          defaultShowCaptions
          defaultShowChapters
          poster="/thumbnails/fossda-intro.png"
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