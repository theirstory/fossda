// First, let's create a type for our chapter data
interface ChapterData {
  title: string;
  created_at: string;
  updated_at: string;
  metadata: any[];
}

// Create a default chapter structure
const defaultChapter: ChapterData = {
  title: "",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  metadata: []
};

// Import all chapter files
const introChapters = require('./introduction-to-fossda-index.json');
const debChapters = require('./deb-goodkin-index.json');
const heatherChapters = require('./heather-meeker-index.json');
const bruceChapters = require('./bruce-perens-index.json');

// Export the chapter data with proper typing
export const chapterData: Record<string, ChapterData> = {
  'introduction-to-fossda': introChapters || defaultChapter,
  'deb-goodkin': debChapters || defaultChapter,
  'heather-meeker': heatherChapters || defaultChapter,
  'bruce-perens': bruceChapters || defaultChapter
};

// Debug logs
console.log('Chapter data initialized:', {
  hasIntro: !!introChapters,
  hasDeb: !!debChapters,
  hasHeather: !!heatherChapters,
  hasBruce: !!bruceChapters,
  keys: Object.keys(chapterData)
}); 