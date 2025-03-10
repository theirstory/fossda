import * as fs from 'fs/promises';
import * as path from 'path';

interface VideoMapping {
  storyId: string;
  muxAssetId: string;
  playbackId: string;
  title: string;
  duration: number;
  recordDate: string;
}

// Helper function to create a valid variable name from an ID
function createValidVariableName(id: string): string {
  // Map of known IDs to their meaningful names
  const nameMap: Record<string, string> = {
    '61929022c65d8e0005450522': 'tristan',
    // Add more mappings here as needed
  };

  // If we have a meaningful name for this ID, use it
  if (nameMap[id]) {
    return nameMap[id];
  }

  // Otherwise, use the ID itself if it's already a valid name (like 'bart', 'deb-goodkin', etc.)
  if (/^[a-zA-Z]/.test(id)) {
    return id.replace(/[^a-zA-Z0-9]/g, '');
  }

  // For unknown numeric IDs, use a generic prefix
  return `interview${id.replace(/[^a-zA-Z0-9]/g, '')}`;
}

async function updateConfigs(interviewId: string) {
  try {
    // 1. Read the mapping file
    const mappingPath = path.join(process.cwd(), 'data', `${interviewId}.json`);
    const mappingContent = await fs.readFile(mappingPath, 'utf-8');
    const mapping: VideoMapping = JSON.parse(mappingContent);

    // Create a valid variable name for imports and IDs
    const safeVariableName = createValidVariableName(interviewId);

    // 2. Update playback IDs in playback-ids.ts
    const playbackIdsPath = path.join(process.cwd(), 'src', 'config', 'playback-ids.ts');
    let playbackIdsContent = await fs.readFile(playbackIdsPath, 'utf-8');
    
    // Find the PLAYBACK_IDS object
    const playbackIdsMatch = playbackIdsContent.match(/export const PLAYBACK_IDS[^{]*{([\s\S]*?)}/);
    if (!playbackIdsMatch) {
      throw new Error('Could not find PLAYBACK_IDS in playback-ids.ts');
    }

    // Add new playback ID
    const existingIds = playbackIdsMatch[1];
    const updatedIds = existingIds.trim().endsWith(',')
      ? existingIds + `\n  '${safeVariableName}': '${mapping.playbackId}',`
      : existingIds + `,\n  '${safeVariableName}': '${mapping.playbackId}',`;
    
    playbackIdsContent = playbackIdsContent.replace(playbackIdsMatch[0], `export const PLAYBACK_IDS = {${updatedIds}\n}`);
    await fs.writeFile(playbackIdsPath, playbackIdsContent);
    console.log('✅ Updated playback IDs in playback-ids.ts');

    // 3. Update chapters.ts
    const chaptersPath = path.join(process.cwd(), 'src', 'data', 'chapters.ts');
    let chaptersContent = await fs.readFile(chaptersPath, 'utf-8');

    // Add import statement
    const lastImport = chaptersContent.match(/import.*from.*\n/g)?.pop();
    if (!lastImport) {
      throw new Error('Could not find imports in chapters.ts');
    }
    const newImport = `import ${safeVariableName}Chapters from './chapters/${interviewId}-index.json';\n`;
    chaptersContent = chaptersContent.replace(lastImport, lastImport + newImport);

    // Add chapter data
    const chapterDataMatch = chaptersContent.match(/export const chapterData: Record<string, ChapterData> = {([\s\S]*?)};/);
    if (!chapterDataMatch) {
      throw new Error('Could not find chapterData in chapters.ts');
    }

    const existingChapters = chapterDataMatch[1];
    const today = new Date().toISOString().split('T')[0];
    const newChapter = `
  "${safeVariableName}": {
    title: "${mapping.title}",
    created_at: "${today}",
    updated_at: "${today}",
    metadata: processChapterMetadata(${safeVariableName}Chapters.metadata)
  },`;

    // Ensure there's no double comma and the object is properly formatted
    const updatedChapters = existingChapters.trim().endsWith(',')
      ? existingChapters + newChapter
      : existingChapters + ',' + newChapter;

    chaptersContent = chaptersContent.replace(
      chapterDataMatch[0],
      `export const chapterData: Record<string, ChapterData> = {${updatedChapters}\n};`
    );

    await fs.writeFile(chaptersPath, chaptersContent);
    console.log('✅ Updated chapter data in chapters.ts');

    // 4. Update videos.ts
    const videosPath = path.join(process.cwd(), 'src', 'data', 'videos.ts');
    let videosContent = await fs.readFile(videosPath, 'utf-8');

    // Find the videoData object
    const videoDataMatch = videosContent.match(/export const videoData[^{]*{([\s\S]*?)}/);
    if (!videoDataMatch) {
      throw new Error('Could not find videoData in videos.ts');
    }

    // Add new video data
    const existingVideos = videoDataMatch[1];
    const newVideo = `
  "${safeVariableName}": {
    id: "${safeVariableName}",
    title: "${mapping.title}",
    duration: "${Math.floor(mapping.duration / 60)}:${String(mapping.duration % 60).padStart(2, '0')}",
    thumbnail: "https://image.mux.com/${mapping.playbackId}/animated.gif?width=320&start=5&end=10",
    summary: "Interview with ${mapping.title} discussing their journey and contributions to open source software.",
    sentence: "From discovering computing as a teenager to playing a pivotal role in the rise of Mozilla and Firefox"
  },`;

    // Ensure there's no double comma and the object is properly formatted
    const updatedVideos = existingVideos.trim().endsWith(',')
      ? existingVideos + newVideo
      : existingVideos + ',' + newVideo;

    videosContent = videosContent.replace(
      /export const videoData[^{]*{([\s\S]*?)}/,
      `export const videoData = {${updatedVideos}\n}`
    );

    await fs.writeFile(videosPath, videosContent);
    console.log('✅ Updated video data in videos.ts');

    console.log('\nAll configuration files have been updated successfully! 🎉');
  } catch (error) {
    console.error('Error updating configs:', error);
    process.exit(1);
  }
}

// Get story ID from command line
const storyId = process.argv[2];
if (!storyId) {
  console.error('Please provide a story ID');
  process.exit(1);
}

updateConfigs(storyId); 