"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState, useCallback } from "react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Maximize,
  SkipBack,
  SkipForward
} from "lucide-react";
import { debounce } from "@/lib/utils";

interface VideoPlayerProps {
  videoUrl: string;
  onPlayStateChange: (playing: boolean) => void;
  isPlaying: boolean;
}

const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  ({ videoUrl, onPlayStateChange, isPlaying }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [localCurrentTime, setLocalCurrentTime] = useState(0);

    useImperativeHandle(ref, () => videoRef.current!);

    useEffect(() => {
      const video = videoRef.current;
      if (video) {
        const handleTimeUpdate = () => {
          setLocalCurrentTime(video.currentTime);
        };
        video.addEventListener('timeupdate', handleTimeUpdate);
        return () => {
          video.removeEventListener('timeupdate', handleTimeUpdate);
        };
      }
    }, []);

    useEffect(() => {
      const video = videoRef.current;
      if (video) {
        const handlePlay = () => onPlayStateChange(true);
        const handlePause = () => onPlayStateChange(false);

        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);

        return () => {
          video.removeEventListener('play', handlePlay);
          video.removeEventListener('pause', handlePause);
        };
      }
    }, [onPlayStateChange]);

    const handleLoadedMetadata = () => {
      if (videoRef.current) {
        setDuration(videoRef.current.duration);
      }
    };

    const handleVolumeChange = (value: number) => {
      if (videoRef.current) {
        videoRef.current.volume = value;
        setVolume(value);
        setIsMuted(value === 0);
      }
    };

    const toggleMute = () => {
      if (videoRef.current) {
        const newMutedState = !isMuted;
        videoRef.current.muted = newMutedState;
        setIsMuted(newMutedState);
        if (!newMutedState && volume === 0) {
          handleVolumeChange(1);
        }
      }
    };

    const formatTime = (seconds: number) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const seek = (time: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = time;
      }
    };

    const skipForward = () => {
      if (videoRef.current) {
        seek(Math.min(videoRef.current.currentTime + 10, duration));
      }
    };

    const skipBackward = () => {
      if (videoRef.current) {
        seek(Math.max(videoRef.current.currentTime - 10, 0));
      }
    };

    return (
      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          id="hyperplayer"
          ref={videoRef}
          className="w-full aspect-video bg-black"
          controls
          onLoadedMetadata={handleLoadedMetadata}
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <Slider 
            value={[localCurrentTime]}
            max={duration}
            step={0.1}
            onValueChange={([value]) => seek(value)}
            className="mb-4"
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={skipBackward}
              >
                <SkipBack className="h-4 w-4 text-white" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => videoRef.current?.play()}
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6 text-white" />
                ) : (
                  <Play className="h-6 w-6 text-white" />
                )}
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon"
                onClick={skipForward}
              >
                <SkipForward className="h-4 w-4 text-white" />
              </Button>

              <span className="text-white text-sm">
                {formatTime(localCurrentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4 text-white" />
                ) : (
                  <Volume2 className="h-4 w-4 text-white" />
                )}
              </Button>
              
              <Slider
                value={[volume]}
                max={1}
                step={0.1}
                onValueChange={([value]) => handleVolumeChange(value)}
                className="w-24"
              />

              <Button
                variant="ghost"
                size="icon"
                onClick={() => videoRef.current?.requestFullscreen()}
              >
                <Maximize className="h-4 w-4 text-white" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

VideoPlayer.displayName = "VideoPlayer";

export default VideoPlayer; 