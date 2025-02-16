export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

export interface VideoData {
  id: string;
  title: string;
  transcript: TranscriptSegment[];
  insights?: {
    entities: {
      name: string;
      type: string;
      occurrences: number[];
    }[];
    topics: {
      name: string;
      timestamps: number[];
    }[];
  };
}

export interface ChapterMetadata {
  title: string;
  timecode: string;
  time: {
    start: number;
    end: number | null;
  };
  synopsis: string;
}

export interface TranscriptIndex {
  title: string;
  created_at: string;
  updated_at: string;
  metadata: ChapterMetadata[];
} 