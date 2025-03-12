import fetch from 'node-fetch';
import * as fs from 'fs/promises';
import * as path from 'path';
import { JSDOM } from 'jsdom';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

interface Index {
  title: string;
  metadata: Array<{
    index: number;
    timecode: string;
    time: {
      start: number;
      end: number | null;
    };
    title?: string;
    synopsis?: string;
    notes?: string;
    keywords?: string;
    lines?: Array<{
      index: number;
      line: string;
      empty: boolean;
      timecodes: string[];
      times: Array<{start: number, end: number | null}>;
      matches: string[][];
      keywords: string[];
    }>;
  }>;
  notes: Array<{
    children: Array<{
      text: string;
    }>;
  }>;
}

interface Story {
  _id: string;
  title: string;
  description?: string;
  indexes?: Index[];
}

async function fetchStory(storyId: string) {
  try {
    // Read the auth token
    let token;
    try {
      token = await fs.readFile(path.join(process.cwd(), '.auth-token'), 'utf-8');
    } catch (error) {
      console.error('Auth token not found. Please run the auth script first.');
      throw new Error('Missing auth token');
    }

    const headers = {
      'Authorization': token.trim(),
      'Accept': 'application/json, text/plain, */*'
    };

    // First fetch the story data to get indexes
    const storyResponse = await fetch(`https://node.theirstory.io/stories/${storyId}`, {
      method: 'GET',
      headers
    });

    if (!storyResponse.ok) {
      throw new Error(`HTTP error! status: ${storyResponse.status}`);
    }

    const responseData = await storyResponse.json();
    const story = responseData as Story;
    
    console.log('\nStory Information:');
    console.log(`Title: ${story.title}`);
    if (story.description) {
      console.log(`Description: ${story.description}`);
    }
    
    if (story.indexes && story.indexes.length > 0) {
      // Use the first index by default
      const primaryIndex = story.indexes[0];
      console.log(`\nPrimary Index: ${primaryIndex.title}`);
      
      primaryIndex.metadata.forEach(meta => {
        console.log('\n' + '-'.repeat(40));
        console.log(`Timecode: ${meta.timecode}`);
        if (meta.title) console.log(`Title: ${meta.title}`);
        if (meta.synopsis) console.log(`Synopsis: ${meta.synopsis}`);
        if (meta.notes) console.log(`Notes: ${meta.notes}`);
        if (meta.keywords) console.log(`Keywords: ${meta.keywords}`);
      });

      // Log if there are additional indexes available
      if (story.indexes.length > 1) {
        console.log(`\nNote: ${story.indexes.length - 1} additional indexes available`);
      }
    }

    // Fetch HTML transcript
    console.log('\nFetching HTML transcript...');
    const transcriptResponse = await fetch(`https://node.theirstory.io/stories/${storyId}/html`, {
      method: 'GET',
      headers
    });

    if (!transcriptResponse.ok) {
      throw new Error(`HTTP error! status: ${transcriptResponse.status}`);
    }

    const transcriptHtml = await transcriptResponse.text();

    // Parse HTML to extract timecodes and text
    const dom = new JSDOM(transcriptHtml);
    const spans = dom.window.document.querySelectorAll('span[data-m]');
    
    console.log(`\nTranscript Information:`);
    console.log(`Found ${spans.length} timestamped words in transcript`);
    
    // Example of extracting first few words with their timecodes
    console.log('\nFirst few words with timecodes:');
    for (let i = 0; i < Math.min(5, spans.length); i++) {
      const span = spans[i];
      const timecode = parseInt(span.getAttribute('data-m') || '0') / 1000;
      console.log(`${timecode}s: ${span.textContent}`);
    }

    // Save the transcript HTML to a file
    const transcriptsDir = path.join(process.cwd(), 'public', 'transcripts');
    await fs.mkdir(transcriptsDir, { recursive: true });

    // Get the interview ID from the story title
    const interviewId = story.title
      .toLowerCase()
      .split(' ')
      .slice(0, 2)
      .join('-')
      .replace(/[^a-z0-9-]/g, '');

    const transcriptPath = path.join(transcriptsDir, `${interviewId}.html`);
    await fs.writeFile(transcriptPath, transcriptHtml);
    console.log(`\nSaved transcript to: ${transcriptPath}`);

    return {
      story,
      transcript_html: transcriptHtml,
      word_count: spans.length
    };
  } catch (error) {
    console.error('Error fetching story:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  const storyId = process.argv[2];
  if (!storyId) {
    console.error('Please provide a story ID as an argument');
    process.exit(1);
  }
  fetchStory(storyId).catch(console.error);
}

export { fetchStory }; 