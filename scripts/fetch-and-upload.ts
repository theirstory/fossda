// Load environment variables from .env.local only
const envPath = require('path').join(process.cwd(), '.env.local');
console.log('Loading environment variables from:', envPath);
require('dotenv').config({ path: envPath, override: true });

import fetch from 'node-fetch';
import * as fs from 'fs/promises';
import * as path from 'path';
import dotenv from 'dotenv';
import { JSDOM } from 'jsdom';
import Mux from '@mux/mux-node';
import { VideoId } from "@/data/videos";

// Load environment variables from .env.local first
const envResult = dotenv.config({ path: path.join(process.cwd(), '.env.local') });
if (envResult.error) {
  console.error('Error loading .env.local:', envResult.error);
  process.exit(1);
}

// Debug environment variables
console.log('\nEnvironment variables loaded:');
console.log('WEAVIATE_API_KEY:', process.env.WEAVIATE_API_KEY ? '✅ Set' : '❌ Not set');
console.log('WEAVIATE_HOST:', process.env.WEAVIATE_HOST ? '✅ Set' : '❌ Not set');
console.log('MUX_TOKEN_ID:', process.env.MUX_TOKEN_ID ? '✅ Set' : '❌ Not set');
console.log('MUX_TOKEN_SECRET:', process.env.MUX_TOKEN_SECRET ? '✅ Set' : '❌ Not set');
console.log('GITHUB_TOKEN:', process.env.GITHUB_TOKEN ? '✅ Set' : '❌ Not set');

// Import modules that depend on environment variables
import { setupSchema, addTranscriptSegment } from '../src/lib/weaviate';
import { chapterData } from '../src/data/chapters';
import { createMuxAsset, getMuxAsset, getMuxPlaybackId } from '../src/lib/mux';

interface TranscriptResponse {
  transcript: {
    _id: string;
    created_at: string;
    words: Array<{
      start: number;
      end: number;
      text: string;
    }>;
    status: string;
    storyId: string;
    updated_at: string;
  };
  story: {
    _id: string;
    title: string;
    record_date: string;
    duration: number;
  };
  videoURL: string;
}

interface ChapterMetadata {
  title: string;
  timecode: string;
  time: {
    start: number;
    end: number | null;
  };
  synopsis: string;
  keywords?: string;
}

interface Index {
  title: string;
  metadata: ChapterMetadata[];
}

interface Story {
  _id: string;
  title: string;
  description?: string;
  indexes?: Index[];
}

// VTT generation functions
function formatSeconds(seconds: number): string {
  return new Date(seconds * 1000).toISOString().substr(11, 12);
}

interface VTTSegment {
  start: number;
  end: number;
  speaker: string;
  text: string;
}

function htmlToVtt(html: string): string {
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const spans = Array.from(doc.querySelectorAll('span[data-m]'));
  const segments: VTTSegment[] = [];
  
  let currentSegment: Partial<VTTSegment> = {};
  let currentText: string[] = [];
  let currentSpeaker = '';

  for (let i = 0; i < spans.length; i++) {
    const span = spans[i];
    const text = span.textContent?.trim() || '';
    
    if (!text) continue;

    // Handle speaker spans
    if (span.classList.contains('speaker')) {
      // If we have a current segment, save it
      if (currentText.length > 0 && currentSegment.start !== undefined) {
        segments.push({
          start: currentSegment.start!,
          end: parseFloat(spans[i-1].getAttribute('data-m') || '0') / 1000 + 
               parseFloat(spans[i-1].getAttribute('data-d') || '2000') / 1000,
          speaker: currentSpeaker,
          text: currentText.join(' ')
        });
        currentText = [];
      }
      currentSpeaker = text;
      continue;
    }

    // Start a new segment if we don't have one
    if (currentText.length === 0) {
      currentSegment.start = parseFloat(span.getAttribute('data-m') || '0') / 1000;
    }

    currentText.push(text);

    // End segment on sentence-ending punctuation or if text is getting too long
    if (text.match(/[.!?]$/) || currentText.length >= 7) {
      segments.push({
        start: currentSegment.start!,
        end: parseFloat(span.getAttribute('data-m') || '0') / 1000 + 
             parseFloat(span.getAttribute('data-d') || '2000') / 1000,
        speaker: currentSpeaker,
        text: currentText.join(' ')
      });
      currentText = [];
    }
  }

  // Add any remaining text as a segment
  if (currentText.length > 0 && currentSegment.start !== undefined) {
    segments.push({
      start: currentSegment.start,
      end: parseFloat(spans[spans.length - 1].getAttribute('data-m') || '0') / 1000 + 
           parseFloat(spans[spans.length - 1].getAttribute('data-d') || '2000') / 1000,
      speaker: currentSpeaker,
      text: currentText.join(' ')
    });
  }

  // Generate VTT
  let vttContent = 'WEBVTT\n\n';
  segments.forEach((segment, i) => {
    vttContent += `${i + 1}\n`;
    vttContent += `${formatSeconds(segment.start)} --> ${formatSeconds(segment.end)}\n`;
    vttContent += `<v ${segment.speaker}>${segment.text}\n\n`;
  });

  return vttContent;
}

async function indexTranscript(interviewId: string, transcriptHtml: string) {
  console.log('\nIndexing transcript in Weaviate...');
  
  // Parse HTML
  const dom = new JSDOM(transcriptHtml);
  const document = dom.window.document;
  
  // Find all transcript segments
  const paragraphs = document.querySelectorAll('p[data-time]');
  const segments = Array.from(paragraphs).map(p => {
    const timestamp = parseFloat(p.getAttribute('data-time') || '0');
    const text = p.textContent || '';
    
    // Split text into speaker and content
    const [speaker, ...contentParts] = text.split(':');
    const content = contentParts.join(':').trim();
    
    return {
      text: content,
      speaker: speaker.trim(),
      timestamp
    };
  }).filter(segment => segment.text);

  // Set up Weaviate schema if needed
  await setupSchema();

  // Add segments to Weaviate
  console.log(`Found ${segments.length} segments to index...`);
  let count = 0;

  for (const segment of segments) {
    const chapterTitle = await findChapterTitle(segment.timestamp, interviewId);
    
    await addTranscriptSegment({
      text: segment.text,
      speaker: segment.speaker,
      interviewId: interviewId as VideoId,
      timestamp: segment.timestamp,
      chapterTitle
    });

    count++;
    if (count % 10 === 0) {
      console.log(`Indexed ${count}/${segments.length} segments...`);
    }
  }

  console.log(`\nSuccessfully indexed ${count} segments for ${interviewId}`);
}

async function findChapterTitle(timestamp: number, interviewId: string): Promise<string> {
  const chapters = chapterData[interviewId]?.metadata || [];
  for (const chapter of chapters) {
    if (timestamp >= chapter.time.start && (!chapter.time.end || timestamp < chapter.time.end)) {
      return chapter.title;
    }
  }
  return 'Uncategorized';
}

// Add GitHub Gist types
interface GistFile {
  filename: string;
  type: string;
  language: string;
  raw_url: string;
  size: number;
  content: string;
}

interface GistResponse {
  url: string;
  id: string;
  files: {
    [key: string]: GistFile;
  };
  public: boolean;
  created_at: string;
  description: string;
}

// Add GitHub Gist creation function
async function createGistAndGetRawUrl(content: string, filename: string, description: string): Promise<string> {
  if (!process.env.GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN environment variable is required');
  }

  console.log('Creating GitHub Gist...');
  const response = await fetch('https://api.github.com/gists', {
    method: 'POST',
    headers: {
      'Authorization': `token ${process.env.GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json'
    },
    body: JSON.stringify({
      description,
      public: true,
      files: {
        [filename]: {
          content
        }
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create Gist: ${JSON.stringify(error)}`);
  }

  const gist = (await response.json()) as GistResponse;
  const rawUrl = gist.files[filename].raw_url;
  console.log('Created Gist with raw URL:', rawUrl);
  return rawUrl;
}

async function fetchAndUpload(storyId: string) {
  try {
    // Read auth token
    let token;
    try {
      token = await fs.readFile(path.join(process.cwd(), '.auth-token'), 'utf-8');
    } catch (error) {
      console.error('Auth token not found. Please run the auth script first.');
      throw new Error('Missing auth token');
    }

    // 1. Fetch story data to get indexes
    console.log(`\nFetching story data for ${storyId}...`);
    const storyResponse = await fetch(`https://node.theirstory.io/stories/${storyId}`, {
      headers: {
        'Authorization': token.trim(),
        'Accept': 'application/json'
      }
    });

    if (!storyResponse.ok) {
      throw new Error(`Failed to fetch story: ${storyResponse.statusText}`);
    }

    const responseData = await storyResponse.json();
    const story = responseData as Story;
    console.log(`Found story: ${story.title}`);

    // Generate interview ID from title with improved logic
    const interviewId = story.title
      .toLowerCase()
      // Remove common suffixes
      .replace(/\s+interview\s+fossda$/i, '')
      .replace(/\s+interview$/i, '')
      // Replace quotes and special characters
      .replace(/["']/g, '')
      // Replace any non-alphanumeric characters with dash
      .replace(/[^a-z0-9]+/g, '-')
      // Replace multiple dashes with single dash
      .replace(/-+/g, '-')
      // Remove leading/trailing dashes
      .replace(/^-|-$/g, '')
      // Ensure we have at least one character
      .replace(/^$/, 'untitled');

    // 2. Fetch transcript and video URL
    console.log('\nFetching transcript...');
    const transcriptResponse = await fetch(`https://node.theirstory.io/transcripts/${storyId}`, {
      headers: {
        'Authorization': token.trim(),
        'Accept': 'application/json'
      }
    });

    if (!transcriptResponse.ok) {
      throw new Error(`Failed to fetch transcript: ${transcriptResponse.statusText}`);
    }

    const responseJson = await transcriptResponse.json();
    const data = responseJson as TranscriptResponse;
    console.log('Video URL:', data.videoURL);

    if (!data.videoURL) {
      throw new Error('No video URL found in transcript response');
    }

    // 3. Fetch HTML transcript
    console.log('\nFetching HTML transcript...');
    const htmlResponse = await fetch(`https://node.theirstory.io/stories/${storyId}/html`, {
      headers: {
        'Authorization': token.trim(),
        'Accept': 'text/html'
      }
    });

    if (!htmlResponse.ok) {
      throw new Error(`Failed to fetch HTML transcript: ${htmlResponse.statusText}`);
    }

    const transcriptHtml = await htmlResponse.text();

    // 4. Upload to Mux
    console.log('\nCreating Mux asset...');
    const asset = await createMuxAsset(data.videoURL);
    console.log(`Created Mux asset with ID: ${asset.id}`);

    // 5. Wait for asset to be ready
    console.log('Waiting for asset to be ready...');
    let readyAsset;
    do {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      readyAsset = await getMuxAsset(asset.id);
      console.log(`Asset status: ${readyAsset.status}`);
    } while (readyAsset.status !== 'ready');

    // 6. Get playback ID
    const playbackId = getMuxPlaybackId(readyAsset);
    if (!playbackId) {
      throw new Error('No playback ID found for asset');
    }

    // 7. Save the Mux mapping
    const mapping = {
      storyId,
      muxAssetId: asset.id,
      playbackId,
      title: data.story.title,
      duration: data.story.duration,
      recordDate: data.story.record_date,
      interviewId // Add interview ID to mapping
    };

    await fs.mkdir('data', { recursive: true });
    const mappingPath = path.join('data', `${interviewId}.json`);
    await fs.writeFile(mappingPath, JSON.stringify(mapping, null, 2));
    console.log('\nSaved mapping to:', mappingPath);

    // Run the config updates
    console.log('\nUpdating configuration files...');
    const { spawn } = require('child_process');
    const updateProcess = spawn('npx', ['ts-node', 'scripts/update-config.ts', interviewId], {
      stdio: 'inherit'
    });

    await new Promise((resolve, reject) => {
      updateProcess.on('close', (code: number) => {
        if (code === 0) {
          resolve(null);
        } else {
          reject(new Error(`Config update process exited with code ${code}`));
        }
      });
    });

    // 8. Save the HTML transcript and generate VTT
    console.log('\n8. Saving transcript files...');
    const transcriptsDir = path.join(process.cwd(), 'public', 'transcripts');
    await fs.mkdir(transcriptsDir, { recursive: true });
    
    // Save HTML transcript
    const transcriptPath = path.join(transcriptsDir, `${interviewId}.html`);
    await fs.writeFile(transcriptPath, transcriptHtml);
    console.log('Saved HTML transcript to:', transcriptPath);

    // Generate and save VTT file
    const vttContent = htmlToVtt(transcriptHtml);
    const vttPath = path.join(transcriptsDir, `${interviewId}.vtt`);
    await fs.writeFile(vttPath, vttContent);
    console.log('Saved VTT file to:', vttPath);

    // Create Gist and get raw URL
    const gistUrl = await createGistAndGetRawUrl(
      vttContent,
      `${interviewId}.vtt`,
      `Captions for ${story.title}`
    );

    // Add captions to Mux asset
    console.log('\nAdding captions to Mux asset...');
    const credentials = Buffer.from(`${process.env.MUX_TOKEN_ID}:${process.env.MUX_TOKEN_SECRET}`).toString('base64');
    const captionsResponse = await fetch(`https://api.mux.com/video/v1/assets/${asset.id}/tracks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`
      },
      body: JSON.stringify({
        language_code: 'en',
        type: 'text',
        text_type: 'subtitles',
        name: 'English',
        closed_captions: true,
        passthrough: 'English subtitles',
        url: gistUrl
      })
    });

    if (!captionsResponse.ok) {
      const error = await captionsResponse.json();
      console.error('Failed to add captions:', error);
    } else {
      const result = await captionsResponse.json();
      console.log('Successfully added captions:', result);
    }

    // 9. Create and save chapter data
    if (story.indexes && story.indexes.length > 0) {
      const chaptersDir = path.join(process.cwd(), 'src', 'data', 'chapters');
      await fs.mkdir(chaptersDir, { recursive: true });
      const chapterPath = path.join(chaptersDir, `${interviewId}-index.json`);
      
      // Format chapter data
      const chapterData = {
        metadata: story.indexes[0].metadata.map(meta => ({
          title: meta.title || 'Untitled Section',
          timecode: meta.timecode,
          time: meta.time,
          synopsis: meta.synopsis || '',
          keywords: meta.keywords || ''
        }))
      };

      await fs.writeFile(chapterPath, JSON.stringify(chapterData, null, 2));
      console.log('Saved chapter data to:', chapterPath);

      // 10. Remind about necessary manual steps
      console.log('\nNext steps:');
      console.log('1. Add the following to PLAYBACK_IDS in src/app/video/[id]/page.tsx:');
      console.log(`   '${interviewId}': '${playbackId}'`);
      console.log('2. Import the chapter data in src/data/chapters.ts:');
      console.log(`   import ${interviewId}Chapters from './chapters/${interviewId}-index.json';`);
      console.log('3. Add the interview to chapterData in src/data/chapters.ts:');
      console.log(`   "${interviewId}": {
    title: "${story.title}",
    created_at: "${new Date().toISOString().split('T')[0]}",
    updated_at: "${new Date().toISOString().split('T')[0]}",
    metadata: processChapterMetadata(${interviewId}Chapters.metadata)
  }`);
    }

    // 11. Index the transcript in Weaviate
    console.log('\n11. Indexing transcript in Weaviate...');
    try {
      await indexTranscript(interviewId, transcriptHtml);
      console.log('Successfully indexed transcript in Weaviate');
    } catch (indexError) {
      console.error('Error indexing transcript:', indexError);
      console.log('Note: Other steps completed successfully, but indexing failed.');
    }

    console.log('\nSuccess! All files have been created and saved.');
    console.log('Playback URL:', `https://stream.mux.com/${playbackId}.m3u8`);
    console.log('Thumbnail URL:', `https://image.mux.com/${playbackId}/thumbnail.jpg`);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Get story ID from command line
const storyId = process.argv[2];
if (!storyId) {
  console.error('Please provide a story ID');
  process.exit(1);
}

fetchAndUpload(storyId); 