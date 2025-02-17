import { ChapterMetadata } from "@/types/transcript";
import introChapters from './introduction-to-fossda-index.json';
import debChapters from './deb-goodkin-index.json';
import heatherChapters from './heather-meeker-index.json';
import bruceChapters from './bruce-perens-index.json';

// First, let's create a type for our chapter data
interface ChapterData {
  title: string;
  created_at: string;
  updated_at: string;
  metadata: ChapterMetadata[];
}

// Create a default chapter structure
const defaultChapter: ChapterData = {
  title: "",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  metadata: []
};

// Export the chapter data with proper typing
export const chapterData: Record<string, ChapterData> = {
  'introduction-to-fossda': {
    title: "Introduction to FOSSDA",
    created_at: "2024-02-14T00:00:00Z",
    updated_at: "2024-02-14T00:00:00Z",
    metadata: introChapters.metadata || []
  },
  'heather-meeker': {
    title: "Heather Meeker",
    created_at: "2024-02-14T00:00:00Z",
    updated_at: "2024-02-14T00:00:00Z",
    metadata: heatherChapters.metadata || []
  },
  'deb-goodkin': {
    title: "Deb Goodkin",
    created_at: "2024-02-14T00:00:00Z",
    updated_at: "2024-02-14T00:00:00Z",
    metadata: debChapters.metadata || []
  },
  'bruce-perens': {
    title: "Bruce Perens",
    created_at: "2024-02-14T00:00:00Z",
    updated_at: "2024-02-14T00:00:00Z",
    metadata: bruceChapters.metadata || []
  }
};

// Debug logs
console.log('Chapter data initialized:', {
  hasIntro: !!introChapters,
  hasDeb: !!debChapters,
  hasHeather: !!heatherChapters,
  hasBruce: !!bruceChapters,
  keys: Object.keys(chapterData)
}); 