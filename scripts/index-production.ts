// Configure SSL
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import dotenv from 'dotenv';
import { setupSchema, addTranscriptSegment } from '../src/lib/weaviate';
import { videoData } from '../src/data/videos';
import { chapterData } from '../src/data/chapters';
import { JSDOM } from 'jsdom';
import { promises as fs } from 'fs';
import path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

interface TranscriptSegment {
  speaker: string;
  text: string;
  timestamp: number;
}

async function processHtmlTranscript(html: string): Promise<TranscriptSegment[]> {
  const segments: TranscriptSegment[] = [];
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  
  // Process each paragraph
  const paragraphs = doc.querySelectorAll('p');
  paragraphs.forEach((p: HTMLParagraphElement) => {
    let speaker = '';
    let text = '';
    let timestamp = 0;
    
    // Process each span in the paragraph
    const spans = p.querySelectorAll('span');
    spans.forEach((span: HTMLSpanElement) => {
      const content = span.textContent?.trim() || '';
      if (span.classList.contains('speaker')) {
        speaker = content.replace(':', '').trim();
      } else {
        text += content + ' ';
        // Get timestamp from data-m attribute (in milliseconds)
        const dataM = span.getAttribute('data-m');
        if (dataM && !timestamp) {
          timestamp = parseInt(dataM) / 1000; // Convert to seconds
        }
      }
    });
    
    if (speaker && text.trim()) {
      segments.push({
        speaker,
        text: text.trim(),
        timestamp,
      });
    }
  });
  
  return segments;
}

async function findChapterTitle(timestamp: number, interviewId: string): Promise<string> {
  const chapters = chapterData[interviewId]?.metadata || [];
  const chapter = chapters.find((chapter, index) => {
    const nextChapter = chapters[index + 1];
    const start = chapter.time.start;
    const end = nextChapter ? nextChapter.time.start : Infinity;
    return timestamp >= start && timestamp < end;
  });
  return chapter?.title || 'Unknown Chapter';
}

async function indexTranscripts() {
  try {
    console.log('Setting up schema...');
    await setupSchema();
    
    console.log('Processing interviews...');
    for (const interviewId of Object.keys(videoData)) {
      console.log(`Processing interview: ${interviewId}`);
      
      // Read HTML transcript
      const transcriptPath = path.join(process.cwd(), 'public', 'transcripts', `${interviewId}.html`);
      const html = await fs.readFile(transcriptPath, 'utf-8');
      
      // Process transcript
      const segments = await processHtmlTranscript(html);
      
      // Index each segment
      let indexedCount = 0;
      for (const segment of segments) {
        const chapterTitle = await findChapterTitle(segment.timestamp, interviewId);
        await addTranscriptSegment({
          ...segment,
          interviewId,
          chapterTitle,
        });
        indexedCount++;
        if (indexedCount % 10 === 0) {
          console.log(`Indexed ${indexedCount}/${segments.length} segments for ${interviewId}`);
        }
      }
      
      console.log(`Completed indexing ${segments.length} segments for ${interviewId}`);
    }
    
    console.log('Completed indexing all transcripts');
  } catch (error) {
    console.error('Error indexing transcripts:', error);
    process.exit(1);
  }
}

// Run the indexing
indexTranscripts(); 