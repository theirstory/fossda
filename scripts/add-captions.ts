import { promises as fs } from 'fs';
import path from 'path';
import Mux from '@mux/mux-node';
import { JSDOM } from 'jsdom';
import dotenv from 'dotenv';

// Load environment variables based on NODE_ENV
const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

if (isDevelopment) {
  // In development, try to load from .env.local first
  console.log('Attempting to load .env.local...');
  const envLocalResult = dotenv.config({ path: path.join(process.cwd(), '.env.local') });
  
  if (envLocalResult.error) {
    console.log('No .env.local found, falling back to .env');
    const envResult = dotenv.config({ path: path.join(process.cwd(), '.env') });
    if (envResult.error) {
      console.error('Error loading environment variables:', envResult.error);
      process.exit(1);
    }
  } else {
    console.log('.env.local loaded successfully');
    // Override any existing env vars with .env.local values
    Object.assign(process.env, envLocalResult.parsed);
  }
} else {
  // In production (Vercel), environment variables are automatically loaded
  console.log('Running in production mode, using system environment variables');
}

// Validate required environment variables
const requiredEnvVars = {
  MUX_TOKEN_ID: process.env.MUX_TOKEN_ID,
  MUX_TOKEN_SECRET: process.env.MUX_TOKEN_SECRET
};

console.log('\nEnvironment Variable Status:');
let missingVars = false;
for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    console.error(`❌ ${key} is missing`);
    missingVars = true;
  } else {
    console.log(`✅ ${key} is set (starts with: ${value.slice(0, 4)}..., ends with: ...${value.slice(-4)})`);
  }
}

if (missingVars) {
  console.error('\nMissing required environment variables');
  process.exit(1);
}

// Initialize Mux client
const muxClient = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
});

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

async function addCaptionsToVideo(videoId: string, assetId: string) {
  try {
    // Read the HTML transcript
    const transcriptPath = path.join(process.cwd(), 'public', 'transcripts', `${videoId}.html`);
    const transcriptHtml = await fs.readFile(transcriptPath, 'utf-8');

    // Convert HTML to VTT
    const vttContent = htmlToVtt(transcriptHtml);

    // Write VTT file locally (for reference)
    const vttPath = path.join(process.cwd(), 'public', 'transcripts', `${videoId}.vtt`);
    await fs.writeFile(vttPath, vttContent);

    // Create the authorization header
    const credentials = Buffer.from(`${process.env.MUX_TOKEN_ID}:${process.env.MUX_TOKEN_SECRET}`).toString('base64');

    // Add captions to the Mux asset using direct API call
    const response = await fetch(`https://api.mux.com/video/v1/assets/${assetId}/tracks`, {
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
        url: 'https://gist.githubusercontent.com/overZellis133/5ff438be40445f02e77e80c1518bf38a/raw/aaed842e4bb329a5e203d0f8537ae5131d934b59/roger-dannenberg.vtt'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Mux API error: ${JSON.stringify(error)}`);
    }

    const result = await response.json();
    console.log(`Successfully added captions to video ${videoId}`, result);
  } catch (error) {
    console.error('Error adding captions:', error);
    throw error;
  }
}

// Usage example:
const videoId = 'roger-dannenberg';
const assetId = 'hJFgK8M3wXoxmb20202zW5PxiD3VFy2jPUNeVl8zhJ5Ak';

addCaptionsToVideo(videoId, assetId)
  .then(() => console.log('Done!'))
  .catch(error => {
    console.error('Failed to add captions:', error);
    process.exit(1);
  }); 