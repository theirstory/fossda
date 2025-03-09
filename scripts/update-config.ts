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

async function updateConfigs(interviewId: string) {
  try {
    // 1. Read the mapping file
    const mappingPath = path.join(process.cwd(), 'data', `${interviewId}.json`);
    const mappingContent = await fs.readFile(mappingPath, 'utf-8');
    const mapping: VideoMapping = JSON.parse(mappingContent);

    // 2. Update playback IDs in page.tsx
    const pagePath = path.join(process.cwd(), 'src', 'app', 'video', '[id]', 'page.tsx');
    let pageContent = await fs.readFile(pagePath, 'utf-8');
    
    // Find the PLAYBACK_IDS object
    const playbackIdsMatch = pageContent.match(/export const PLAYBACK_IDS[^{]*{([^}]*)}/s);
    if (!playbackIdsMatch) {
      throw new Error('Could not find PLAYBACK_IDS in page.tsx');
    }

    // Add new playback ID
    const existingIds = playbackIdsMatch[1];
    const updatedIds = existingIds.trim().endsWith(',')
      ? existingIds + `\n  '${interviewId}': '${mapping.playbackId}',`
      : existingIds + `,\n  '${interviewId}': '${mapping.playbackId}',`;
    
    pageContent = pageContent.replace(playbackIdsMatch[0], `export const PLAYBACK_IDS = {${updatedIds}\n}`);
    await fs.writeFile(pagePath, pageContent);
    console.log('✅ Updated playback IDs in page.tsx');

    // 3. Update chapters.ts
    const chaptersPath = path.join(process.cwd(), 'src', 'data', 'chapters.ts');
    let chaptersContent = await fs.readFile(chaptersPath, 'utf-8');

    // Add import statement
    const lastImport = chaptersContent.match(/import.*from.*\n/g)?.pop();
    if (!lastImport) {
      throw new Error('Could not find imports in chapters.ts');
    }
    const newImport = `import ${interviewId}Chapters from './chapters/${interviewId}-index.json';\n`;
    chaptersContent = chaptersContent.replace(lastImport, lastImport + newImport);

    // Add chapter data
    const chapterDataMatch = chaptersContent.match(/export const chapterData[^{]*{([^}]*)}/s);
    if (!chapterDataMatch) {
      throw new Error('Could not find chapterData in chapters.ts');
    }

    const existingChapters = chapterDataMatch[1];
    const today = new Date().toISOString().split('T')[0];
    const newChapter = `
  "${interviewId}": {
    title: "${mapping.title}",
    created_at: "${today}",
    updated_at: "${today}",
    metadata: processChapterMetadata(${interviewId}Chapters.metadata)
  },`;

    chaptersContent = chaptersContent.replace(
      chapterDataMatch[0],
      `export const chapterData = {${existingChapters}${newChapter}\n}`
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
  "${interviewId}": {
    id: "${interviewId}",
    title: "${mapping.title}",
    duration: "${Math.floor(mapping.duration / 60)}:${String(mapping.duration % 60).padStart(2, '0')}",
    thumbnail: "https://image.mux.com/${mapping.playbackId}/animated.gif?width=320&start=5&end=10",
    summary: "Interview with ${mapping.title} discussing their journey and contributions to open source software.",
    sentence: "Exploring the intersection of open source and innovation through personal experiences and insights."
  },`;

    videosContent = videosContent.replace(
      /export const videoData[^{]*{([\s\S]*?)}/,
      `export const videoData = {${existingVideos}${newVideo}\n}`
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