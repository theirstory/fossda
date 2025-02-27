export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

export interface VideoData {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  summary: string;
  sentence: string;
  transcript?: TranscriptSegment[];
  insights?: {
    entities: Entity[];
    topics: Topic[];
  };
}

export interface ChapterMetadata {
  id?: string;
  title: string;
  timecode: string;
  time: {
    start: number;
    end: number | null;
  };
  synopsis: string;
  tags?: string[];
}

export interface TranscriptIndex {
  title: string;
  created_at: string;
  updated_at: string;
  metadata: ChapterMetadata[];
}

export interface Entity {
  name: string;
  type: string;
  mentions: number;
}

export interface Topic {
  name: string;
  score: number;
}

export interface ChapterData {
  title: string;
  created_at: string;
  updated_at: string;
  metadata: ChapterMetadata[];
} 