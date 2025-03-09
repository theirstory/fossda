import fetch from 'node-fetch';
import * as fs from 'fs/promises';
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

interface Story {
  _id: string;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
  duration?: number;
  recording_size?: number;
}

async function listStories() {
  try {
    // Read the auth token
    let token;
    try {
      token = await fs.readFile(path.join(process.cwd(), '.auth-token'), 'utf-8');
    } catch (error) {
      console.error('Auth token not found. Please run the auth script first.');
      throw new Error('Missing auth token');
    }

    const response = await fetch('https://node.theirstory.io/stories', {
      method: 'GET',
      headers: {
        'Authorization': token.trim(),
        'Accept': 'application/json, text/plain, */*'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    
    try {
      const stories = JSON.parse(text);
      
      console.log('\nFOSSDA Stories:\n');
      
      stories.forEach((story: Story) => {
        console.log('='.repeat(80));
        console.log(`Title: ${story.title}`);
        
        if (story.description) {
          console.log(`Description: ${story.description}`);
        }
        
        const created = new Date(story.created_at);
        const updated = new Date(story.updated_at);
        
        console.log(`Created: ${created.toLocaleDateString()}`);
        console.log(`Updated: ${updated.toLocaleDateString()}`);
        
        if (story.duration) {
          const minutes = Math.floor(story.duration / 60);
          const seconds = Math.round(story.duration % 60);
          console.log(`Duration: ${minutes}m ${seconds}s`);
        }
        
        if (story.recording_size) {
          const sizeInMB = (story.recording_size / (1024 * 1024)).toFixed(1);
          console.log(`Recording size: ${sizeInMB}MB`);
        }
        
        console.log(`ID: ${story._id}\n`);
      });
      
      console.log('='.repeat(80));
      console.log(`Total stories found: ${stories.length}`);
      
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      console.log('Raw response:', text);
    }
  } catch (error) {
    console.error('Error fetching stories:', error);
  }
}

// Get the project ID from command line arguments
const projectId = process.argv[2];
if (!projectId) {
  console.error('Please provide a project ID as a command line argument');
  process.exit(1);
}

listStories();

export { listStories }; 