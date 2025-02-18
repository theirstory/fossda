import { promises as fs } from 'fs';
import path from 'path';
import { clips } from '../src/data/clips';

interface VTTCue {
  startTime: string;
  endTime: string;
  speaker: string;
  text: string;
}

function parseVTT(content: string): VTTCue[] {
  const lines = content.split('\n');
  const cues: VTTCue[] = [];
  let currentCue: Partial<VTTCue> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.includes('-->')) {
      // Get exact timestamp including milliseconds
      const [start, end] = line.split('-->').map(t => t.trim());
      currentCue.startTime = start;
      currentCue.endTime = end;
    } else if (line.startsWith('<v')) {
      // Extract speaker and text separately
      const match = line.match(/<v ([^>]+)>(.+)/);
      if (match) {
        currentCue.speaker = match[1];
        currentCue.text = match[2].trim();
      }
    } else if (line === '' && currentCue.startTime) {
      cues.push(currentCue as VTTCue);
      currentCue = {};
    }
  }

  return cues;
}

function findQuoteTimings(cues: VTTCue[], quote: string): { start: string; end: string } | null {
  // First create a continuous text to search in
  const fullText = cues.map(cue => cue.text).join(' ');
  
  if (!fullText.includes(quote)) {
    // Try to find partial matches
    const words = quote.split(' ');
    console.log(`Quote not found exactly. Looking for parts of: "${quote}"`);
    
    // Find the first few words
    const startWords = words.slice(0, 3).join(' ');
    const endWords = words.slice(-3).join(' ');
    
    let startCue = null;
    let endCue = null;
    
    for (const cue of cues) {
      if (!startCue && cue.text.includes(startWords)) {
        startCue = cue;
      }
      if (cue.text.includes(endWords)) {
        endCue = cue;
      }
    }
    
    if (startCue && endCue) {
      return {
        start: startCue.startTime,
        end: endCue.endTime
      };
    }
  }
  
  // Find the cues that contain the start and end of the quote
  for (let i = 0; i < cues.length; i++) {
    if (cues[i].text.includes(quote)) {
      return {
        start: cues[i].startTime,
        end: cues[i].endTime
      };
    }
  }
  
  return null;
}

function parseTimestamp(timestamp: string): number {
  // Convert "00:00:10.200" format to seconds
  const [hours, minutes, seconds] = timestamp.split(':');
  const [secs, ms] = seconds.split('.');
  
  return (
    parseInt(hours) * 3600 + 
    parseInt(minutes) * 60 + 
    parseInt(secs) + 
    (parseInt(ms) || 0) / 1000
  );
}

async function main() {
  const updatedClips = [];
  
  for (const clip of clips) {
    const vttPath = path.join(process.cwd(), 'public', 'transcripts', `${clip.interviewId}.vtt`);
    try {
      const vttContent = await fs.readFile(vttPath, 'utf-8');
      const cues = parseVTT(vttContent);
      const timings = findQuoteTimings(cues, clip.transcript);
      
      if (timings) {
        console.log(`\nFound timings for clip: ${clip.id}`);
        console.log(`Quote: "${clip.transcript}"`);
        console.log(`Start: ${timings.start}`);
        console.log(`End: ${timings.end}`);
        
        const startSeconds = parseTimestamp(timings.start);
        const endSeconds = parseTimestamp(timings.end);
        const duration = endSeconds - startSeconds;
        
        updatedClips.push({
          ...clip,
          startTime: startSeconds,
          endTime: endSeconds,
          duration: duration
        });
      } else {
        console.warn(`\nCould not find timings for clip: ${clip.id}`);
        console.warn(`Quote: "${clip.transcript}"`);
        updatedClips.push(clip);
      }
    } catch (error) {
      console.error(`\nError processing VTT for ${clip.interviewId}:`, error);
      updatedClips.push(clip);
    }
  }
  
  // Save to a new file
  const outputPath = path.join(process.cwd(), 'src', 'data', 'clips-with-durations.ts');
  const fileContent = `
import { Clip } from '@/types/index';

export const clips: Clip[] = ${JSON.stringify(updatedClips, null, 2)};
`;
  
  await fs.writeFile(outputPath, fileContent);
  console.log(`\nSaved updated clips to: ${outputPath}`);
}

main().catch(console.error); 