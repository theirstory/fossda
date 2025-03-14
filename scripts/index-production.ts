// Configure SSL
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import dotenv from 'dotenv';
import { setupSchema } from '../src/lib/weaviate';
import { videoData, VideoId } from '../src/data/videos';
import { promises as fs } from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import { glob } from 'glob';
import weaviate, { WeaviateClient, ApiKey } from 'weaviate-ts-client';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Validate required environment variables
if (!process.env.WEAVIATE_HOST) {
  throw new Error('WEAVIATE_HOST environment variable is required');
}

if (!process.env.WEAVIATE_API_KEY) {
  throw new Error('WEAVIATE_API_KEY environment variable is required');
}

// Initialize Weaviate client
const client = weaviate.client({
  scheme: 'https',
  host: process.env.WEAVIATE_HOST,
  apiKey: new ApiKey(process.env.WEAVIATE_API_KEY),
  headers: {
    'X-OpenAI-Api-Key': process.env.OPENAI_API_KEY || '',
    'X-OpenAI-Organization': process.env.OPENAI_ORG_ID || '',
  },
});

interface TranscriptSegment {
  text: string;
  speaker: string;
  timestamp: number;
  interviewId: VideoId;
  interviewTitle: string;
  thumbnail: string;
  chapterTitle: string;
}

interface IndexNote {
  children: Array<{ text: string }>;
}

interface IndexFile {
  title?: string;
  url?: string | null;
  notes?: IndexNote[];
  metadata?: Array<{
    title: string;
    timecode: string;
    time: {
      start: number;
      end: number | null;
    };
    synopsis: string;
    keywords: string;
  }>;
}

interface Chapter {
  title: string;
  start: number; // in seconds
  end: number; // in seconds
}

// Create a map of video chapters for efficient lookup
const videoChapters = new Map<VideoId, Chapter[]>();

// Convert timestamp string [HH:MM:SS] to seconds
function timestampToSeconds(timestamp: string): number {
  const match = timestamp.match(/(\d{2}):(\d{2}):(\d{2})/);
  if (!match) return 0;
  
  const [_, hours, minutes, seconds] = match;
  return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
}

// Initialize the chapters map from index files
async function initializeChapters() {
  const indexFiles = await glob('src/data/chapters/*-index.json');
  console.log(`Found ${indexFiles.length} chapter index files`);
  
  for (const file of indexFiles) {
    try {
      const videoId = path.basename(file, '-index.json') as VideoId;
      console.log(`\nProcessing index file for ${videoId}...`);
      
      const content = await fs.readFile(file, 'utf-8');
      const indexData: IndexFile = JSON.parse(content);
      
      const chapters: Chapter[] = [];
      
      // Handle metadata format (newer format)
      if (indexData.metadata && indexData.metadata.length > 0) {
        console.log(`Found metadata format with ${indexData.metadata.length} chapters`);
        
        for (let i = 0; i < indexData.metadata.length; i++) {
          const chapter = indexData.metadata[i];
          const nextChapter = indexData.metadata[i + 1];
          
          chapters.push({
            title: chapter.title,
            start: chapter.time.start,
            // If this is the last chapter, use 24 hours as end time
            // Otherwise use the start time of the next chapter
            end: nextChapter ? nextChapter.time.start : 24 * 3600
          });
        }
      }
      // Handle notes format (older format)
      else if (indexData.notes && indexData.notes.length > 0) {
        console.log(`Found notes format with ${indexData.notes.length} notes`);
        let currentChapter: Partial<Chapter> = {};
        
        for (let i = 0; i < indexData.notes.length; i++) {
          const note = indexData.notes[i];
          if (!note.children || !note.children[0]) {
            continue;
          }
          
          const text = note.children[0].text;
          if (!text) {
            continue;
          }
          
          // If it's a timestamp
          if (text.match(/^\[\d{2}:\d{2}:\d{2}\]$/)) {
            if (currentChapter.title) {
              // Set end time of previous chapter
              currentChapter.end = timestampToSeconds(text);
              chapters.push(currentChapter as Chapter);
            }
            
            // Start new chapter
            currentChapter = {
              start: timestampToSeconds(text)
            };
          }
          // If it's a chapter title (starts with #)
          else if (text.startsWith('# ')) {
            currentChapter.title = text.substring(2);
          }
        }
        
        // Add the last chapter if it exists
        if (currentChapter.title) {
          // Set end time to a large number if not set
          if (!currentChapter.end) {
            currentChapter.end = 24 * 3600; // 24 hours in seconds
          }
          chapters.push(currentChapter as Chapter);
        }
      } else {
        console.warn(`Warning: No chapter data found in index file for ${videoId}`);
        continue;
      }
      
      if (chapters.length > 0) {
        // Sort chapters by start time to ensure they're in order
        chapters.sort((a, b) => a.start - b.start);
        videoChapters.set(videoId, chapters);
        console.log(`Loaded ${chapters.length} chapters for ${videoId}`);
        
        // Log first and last chapter to verify timestamps
        console.log(`First chapter: "${chapters[0].title}" (${chapters[0].start}s - ${chapters[0].end}s)`);
        console.log(`Last chapter: "${chapters[chapters.length-1].title}" (${chapters[chapters.length-1].start}s - ${chapters[chapters.length-1].end}s)`);
      } else {
        console.warn(`Warning: No chapters found in index file for ${videoId}`);
      }
    } catch (error) {
      console.error(`Error processing index file ${file}:`, error);
    }
  }
  
  console.log(`\nFinished loading chapters. Found chapters for ${videoChapters.size} videos.`);
}

function findChapterTitle(videoId: VideoId, timestamp: number): string {
  const chapters = videoChapters.get(videoId);
  if (!chapters) return '';
  
  // Find the chapter that contains this timestamp
  const chapter = chapters.find(c => timestamp >= c.start && timestamp <= c.end);
  return chapter ? chapter.title : '';
}

async function processHtmlTranscript(htmlContent: string): Promise<TranscriptSegment[]> {
  const $ = cheerio.load(htmlContent);
  const segments: TranscriptSegment[] = [];
  
  console.log('Processing transcript paragraphs...');
  let paragraphCount = 0;
  
  // List of filler words/phrases to filter out
  const fillerWords = new Set([
    'yeah', 'uh-huh', 'um', 'uh', 'okay', 'right', 'mhm', 'hmm',
    'you know', 'like', 'sort of', 'kind of', 'i mean'
  ]);

  // Function to check if text is meaningful
  const isQualityText = (text: string): boolean => {
    const cleanText = text.toLowerCase().trim();
    
    // Filter out segments that are too short (less than 20 characters)
    if (cleanText.length < 20) return false;
    
    // Filter out segments that are just filler words
    if (fillerWords.has(cleanText)) return false;
    
    // Count words (rough approximation)
    const wordCount = cleanText.split(/\s+/).length;
    if (wordCount < 5) return false;
    
    return true;
  };
  
  $('p').each((_, p) => {
    paragraphCount++;
    if (paragraphCount % 10 === 0) {
      console.log(`Processed ${paragraphCount} paragraphs...`);
    }
    
    const $p = $(p);
    const spans = $p.find('span');
    let speaker = '';
    let text = '';
    let timestamp = 0;
    
    spans.each((_, span) => {
      const $span = $(span);
      const content = $span.text().trim();
      if ($span.hasClass('speaker')) {
        speaker = content.replace(':', '').trim();
      } else {
        text += content + ' ';
      }
      
      // Get earliest timestamp in paragraph
      const spanTimestamp = parseInt($span.attr('data-m') || '0', 10);
      if (spanTimestamp && (!timestamp || spanTimestamp < timestamp)) {
        timestamp = spanTimestamp;
      }
    });
    
    const cleanedText = text.trim();
    
    // Only add segments that pass quality check
    if (speaker && cleanedText && isQualityText(cleanedText)) {
      segments.push({
        text: cleanedText,
        speaker,
        timestamp: Math.floor(timestamp / 1000), // Convert to seconds
        interviewId: '' as VideoId, // Will be set later
        interviewTitle: '', // Will be set later
        thumbnail: '', // Will be set later
        chapterTitle: '', // Will be set later based on timestamp
      });
    }
  });
  
  console.log(`Found ${segments.length} transcript segments from ${paragraphCount} paragraphs`);
  return segments;
}

async function indexTranscriptSegment(segment: TranscriptSegment, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await client.data
        .creator()
        .withClassName('Transcript')
        .withProperties({
          text: segment.text,
          speaker: segment.speaker,
          timestamp: segment.timestamp,
          interviewId: segment.interviewId,
          interviewTitle: segment.interviewTitle,
          thumbnail: segment.thumbnail,
          chapterTitle: segment.chapterTitle,
        })
        .do();
      return; // Success, exit function
    } catch (error) {
      if (attempt === retries) {
        throw error; // Last attempt failed, propagate error
      }
      console.warn(`Indexing attempt ${attempt} failed, retrying in 1 second...`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
    }
  }
}

async function main() {
  try {
    // Configure SSL
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    
    // Set up schema
    console.log('Setting up Weaviate schema...');
    await setupSchema();
    
    // Initialize chapters from index files
    console.log('\nInitializing chapters from index files...');
    await initializeChapters();
    
    // Process transcripts
    console.log('\nProcessing transcripts...');
    const transcriptFiles = await glob('public/transcripts/*.html');
    console.log(`Found ${transcriptFiles.length} transcript files`);
    
    for (const file of transcriptFiles) {
      const videoId = path.basename(file, '.html') as VideoId;
      const video = videoData[videoId];
      
      if (!video) {
        console.warn(`Warning: No video data found for ${videoId}, skipping...`);
        continue;
      }
      
      console.log(`\nProcessing transcript for video: ${videoId}`);
      
      const htmlContent = await fs.readFile(file, 'utf-8');
      const segments = await processHtmlTranscript(htmlContent);
      
      // Add video metadata to segments
      segments.forEach(segment => {
        segment.interviewId = videoId;
        segment.interviewTitle = video.title;
        segment.thumbnail = video.thumbnail;
        segment.chapterTitle = findChapterTitle(videoId, segment.timestamp);
      });
      
      console.log(`Indexing ${segments.length} segments...`);
      let indexedCount = 0;
      let errorCount = 0;
      
      for (const segment of segments) {
        try {
          await indexTranscriptSegment(segment);
          indexedCount++;
          if (indexedCount % 10 === 0) {
            console.log(`Indexed ${indexedCount}/${segments.length} segments...`);
          }
        } catch (error) {
          errorCount++;
          console.error(`Failed to index segment:`, error);
          if (errorCount > 5) {
            throw new Error('Too many indexing errors, aborting...');
          }
        }
      }
      
      console.log(`Completed indexing ${indexedCount} segments for ${videoId} (${errorCount} errors)`);
    }
    
    console.log('\nIndexing completed successfully!');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main(); 