import * as fs from 'fs/promises';
import * as path from 'path';
import { VideoData } from '../src/types/transcript';

interface MuxMapping {
  storyId: string;
  muxAssetId: string;
  playbackId: string;
  title: string;
  duration: number;
  recordDate: string;
}

async function updateVideoData() {
  try {
    // Read all mapping files from the data directory
    const dataDir = path.join(process.cwd(), 'data');
    const files = await fs.readdir(dataDir);
    const mappings: MuxMapping[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(path.join(dataDir, file), 'utf-8');
        mappings.push(JSON.parse(content));
      }
    }

    // Read the current video data
    const videoDataPath = path.join(process.cwd(), 'src/data/videos.ts');
    const videoDataContent = await fs.readFile(videoDataPath, 'utf-8');
    
    // Convert the content to a string that can be manipulated
    let updatedContent = videoDataContent;

    // Update each video's thumbnail with its Mux thumbnail URL
    for (const mapping of mappings) {
      const thumbnailUrl = `https://image.mux.com/${mapping.playbackId}/thumbnail.jpg`;
      
      // Create a regex to find the thumbnail line for this video
      const thumbnailRegex = new RegExp(`(${mapping.storyId}":[\\s\\S]*?thumbnail:)[^\\n]*`);
      
      // Replace the thumbnail line
      updatedContent = updatedContent.replace(
        thumbnailRegex,
        `$1 "${thumbnailUrl}"`
      );

      // Also update the duration if it's in the mapping
      if (mapping.duration) {
        const hours = Math.floor(mapping.duration / 3600);
        const minutes = Math.floor((mapping.duration % 3600) / 60);
        const seconds = Math.round(mapping.duration % 60);
        
        let durationStr;
        if (hours > 0) {
          durationStr = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
          durationStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        
        const durationRegex = new RegExp(`(${mapping.storyId}":[\\s\\S]*?duration:)[^\\n]*`);
        updatedContent = updatedContent.replace(
          durationRegex,
          `$1 "${durationStr}"`
        );
      }
    }

    // Write the updated content back to the file
    await fs.writeFile(videoDataPath, updatedContent, 'utf-8');
    
    console.log('Successfully updated video data with Mux thumbnails!');

  } catch (error) {
    console.error('Error updating video data:', error);
    process.exit(1);
  }
}

updateVideoData(); 