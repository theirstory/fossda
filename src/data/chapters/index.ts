import { ChapterMetadata } from "@/types/transcript";
import introChapters from './introduction-to-fossda-index.json';
import debChapters from './deb-goodkin-index.json';
import heatherChapters from './heather-meeker-index.json';
import bruceChapters from './bruce-perens-index.json';
import tristanChapters from './tristan-index.json';

// First, let's create a type for our chapter data
interface ChapterData {
  title: string;
  created_at: string;
  updated_at: string;
  metadata: ChapterMetadata[];
}

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

// // Create a default chapter structure
// const defaultChapter: ChapterData = {
//   title: "",
//   created_at: new Date().toISOString(),
//   updated_at: new Date().toISOString(),
//   metadata: []
// };

// Export the chapter data with proper typing
export const chapterData: Record<string, ChapterData> = {
  'introduction-to-fossda': {
    title: "Introduction to FOSSDA",
    created_at: "2024-02-14T00:00:00Z",
    updated_at: "2024-02-14T00:00:00Z",
    metadata: processChapterMetadata(introChapters.metadata || [])
  },
  'heather-meeker': {
    title: "Heather Meeker",
    created_at: "2024-02-14T00:00:00Z",
    updated_at: "2024-02-14T00:00:00Z",
    metadata: processChapterMetadata(heatherChapters.metadata || [])
  },
  'deb-goodkin': {
    title: "Deb Goodkin",
    created_at: "2024-02-14T00:00:00Z",
    updated_at: "2024-02-14T00:00:00Z",
    metadata: processChapterMetadata(debChapters.metadata || [])
  },
  'bruce-perens': {
    title: "Bruce Perens",
    created_at: "2024-02-14T00:00:00Z",
    updated_at: "2024-02-14T00:00:00Z",
    metadata: processChapterMetadata(bruceChapters.metadata || [])
  },
  'tristan': {
    title: "Tristan Nitot",
    created_at: "2024-03-09T00:00:00Z",
    updated_at: "2024-03-09T00:00:00Z",
    metadata: processChapterMetadata(tristanChapters.metadata || [])
  }
};

// Debug logs
console.log('Chapter data initialized:', {
  hasIntro: !!introChapters,
  hasDeb: !!debChapters,
  hasHeather: !!heatherChapters,
  hasBruce: !!bruceChapters,
  hasTristan: !!tristanChapters,
  keys: Object.keys(chapterData)
}); 