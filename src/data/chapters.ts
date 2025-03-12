import { ChapterData, ChapterMetadata } from "@/types/transcript";
import introChapters from './chapters/introduction-to-fossda-index.json';
import debChapters from './chapters/deb-goodkin-index.json';
import heatherChapters from './chapters/heather-meeker-index.json';
import bruceChapters from './chapters/bruce-perens-index.json';
import larryChapters from './chapters/larry-augustin-index.json';
import rogerChapters from './chapters/roger-dannenberg-index.json';
import bartChapters from './chapters/bart-decrem-index.json';
import tristanChapters from './chapters/tristan-nitot-index.json';
import lawrenceChapters from './chapters/lawrence-rosen-index.json';

// Define the raw metadata type from JSON
interface RawChapterMetadata {
  title: string;
  timecode: string;
  time: {
    start: number;
    end: number | null;
  };
  synopsis: string;
  keywords?: string;
}

// Helper function to process chapter metadata
function processChapterMetadata(metadata: RawChapterMetadata[]): ChapterMetadata[] {
  return metadata.map(chapter => ({
    ...chapter,
    // Convert keywords string to array of tags
    tags: chapter.keywords ? chapter.keywords.split(', ') : []
  }));
}

// Export the complete chapterData record with all interviews
export const chapterData: Record<string, ChapterData> = {
  "introduction-to-fossda": {
    title: "Introduction to FOSSDA",
    created_at: "2024-03-20",
    updated_at: "2024-03-20",
    metadata: processChapterMetadata(introChapters.metadata)
  },
  "deb-goodkin": {
    title: "Deb Goodkin Interview",
    created_at: "2024-03-20",
    updated_at: "2024-03-20",
    metadata: processChapterMetadata(debChapters.metadata)
  },
  "heather-meeker": {
    title: "Heather Meeker Interview",
    created_at: "2024-03-20",
    updated_at: "2024-03-20",
    metadata: processChapterMetadata(heatherChapters.metadata)
  },
  "bruce-perens": {
    title: "Bruce Perens Interview",
    created_at: "2024-03-20",
    updated_at: "2024-03-20",
    metadata: processChapterMetadata(bruceChapters.metadata)
  },
  "larry-augustin": {
    title: "Larry Augustin Interview",
    created_at: "2024-03-20",
    updated_at: "2024-03-20",
    metadata: processChapterMetadata(larryChapters.metadata)
  },
  "roger-dannenberg": {
    title: "Roger Dannenberg Interview",
    created_at: "2024-03-20",
    updated_at: "2024-03-20",
    metadata: processChapterMetadata(rogerChapters.metadata)
  },
  "bart-decrem": {
    title: "Bart Decrem interview with FOSSDA",
    created_at: "2025-03-08",
    updated_at: "2025-03-08",
    metadata: processChapterMetadata(bartChapters.metadata)
  },
  "tristan-nitot": {
    title: "Tristan Nitot",
    created_at: "2025-03-09",
    updated_at: "2025-03-09",
    metadata: processChapterMetadata(tristanChapters.metadata)
  },
  "lawrence-rosen": {
    title: "Lawrence (Larry) Rosen",
    created_at: "2025-03-11",
    updated_at: "2025-03-11",
    metadata: processChapterMetadata(lawrenceChapters.metadata)
  }
}; 