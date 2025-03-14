export interface Chapter {
  title: string;
  start: number;
  end?: number;
}

export interface TranscriptSegment {
  text: string;
  speaker: string;
  timestamp: number;
}

export interface Transcript {
  chapters: Chapter[];
  segments: TranscriptSegment[];
} 