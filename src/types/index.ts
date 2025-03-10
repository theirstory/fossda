import { VideoId } from "@/data/videos";

export interface Chapter {
  id: string;
  title: string;
}

export interface Clip {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  duration: number;
  chapter: Chapter;
  interviewId: VideoId;
  interviewTitle: string;
  transcript: string;
  themes: string[];
} 