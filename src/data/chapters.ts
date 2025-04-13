import { ChapterData, ChapterMetadata } from "@/types/transcript";
import introductionChapters from './chapters/introduction-to-fossda-index.json';
import debChapters from './chapters/deb-goodkin-index.json';
import heatherChapters from './chapters/heather-meeker-index.json';
import bruceChapters from './chapters/bruce-perens-index.json';
import larryChapters from './chapters/larry-augustin-index.json';
import rogerChapters from './chapters/roger-dannenberg-index.json';
import bartChapters from './chapters/bart-decrem-index.json';
import tristanChapters from './chapters/tristan-nitot-index.json';
import lawrenceChapters from './chapters/lawrence-rosen-index.json';
import jonChapters from './chapters/jon-maddog-hall-index.json';
import tonyWassermanChapters from './chapters/tony-wasserman-index.json';
import joshuaGayFossdaChapters from './chapters/joshua-gay-fossda-index.json';
import karenSandlerChapters from './chapters/karen-sandler-index.json';
import kirkMckusickChapters from './chapters/kirk-mckusick-index.json';
import ericAllmanInterviewWithFossdaChapters from './chapters/eric-allman-interview-with-fossda-index.json';
import catAllmanChapters from './chapters/cat-allman-index.json';

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
    metadata: processChapterMetadata(introductionChapters.metadata)
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
  },
  "jon-maddog-hall": {
    title: "Jon \"Maddog\" Hall",
    created_at: "2025-03-12",
    updated_at: "2025-03-12",
    metadata: processChapterMetadata(jonChapters.metadata)
  },
  "tony-wasserman": {
    title: "Tony Wasserman FOSSDA Interview (Bryan Behrenshausen)",
    created_at: "2025-03-23",
    updated_at: "2025-03-23",
    metadata: processChapterMetadata(tonyWassermanChapters.metadata)
  },

  "joshua-gay-fossda": {
    title: "Joshua Gay",
    created_at: "2025-04-01",
    updated_at: "2025-04-01",
    metadata: processChapterMetadata(joshuaGayFossdaChapters.metadata)
  },

  "karen-sandler": {
    title: "Karen Sandler",
    created_at: "2025-04-04",
    updated_at: "2025-04-04",
    metadata: processChapterMetadata(karenSandlerChapters.metadata)
  },

  "kirk-mckusick": {
    title: "Kirk McKusick",
    created_at: "2025-04-05",
    updated_at: "2025-04-05",
    metadata: processChapterMetadata(kirkMckusickChapters.metadata)
  },

  "eric-allman-interview-with-fossda": {
    title: "Eric Allman Interview with FOSSDA",
    created_at: "2025-04-07",
    updated_at: "2025-04-07",
    metadata: processChapterMetadata(ericAllmanInterviewWithFossdaChapters.metadata)
  },

  "cat-allman": {
    title: "Cat Allman",
    created_at: "2025-04-13",
    updated_at: "2025-04-13",
    metadata: processChapterMetadata(catAllmanChapters.metadata)
  },
}; 