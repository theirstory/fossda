import { promises as fs } from 'fs';
import * as path from 'path';
import { JSDOM } from 'jsdom';
import { clips } from '../src/data/clips';
import type { Clip } from '../src/types';

interface Word {
  text: string;
  timestamp: number;
  duration?: number;
}

function cleanText(text: string): string {
  return text
    .toLowerCase()
    // Remove other punctuation except ellipses
    .replace(/[.,!?;:'"]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

function findStartAndEndMatch(words: Word[], searchText: string): { start: number; end: number } | null {
  // Split on ellipses to get start and end segments
  const segments = searchText.split(/\.{3,}/g).map(s => s.trim());
  const startSegment = segments[0];
  const endSegment = segments[segments.length - 1];

  console.log('\nLooking for start segment:', startSegment);
  console.log('Looking for end segment:', endSegment);

  // Get first ~10 words of start segment and last ~10 words of end segment
  const startWords = cleanText(startSegment).split(' ').slice(0, 10).join(' ');
  const endWords = cleanText(endSegment).split(' ').slice(-10).join(' ');

  // Create clean version of transcript words
  const cleanTranscriptWords = words.map(w => ({
    ...w,
    clean: cleanText(w.text)
  }));

  // Find best match for start
  let bestStartMatch = null;
  let bestStartScore = 0;
  let bestStartIndex = 0;

  // Build running text for each position
  for (let i = 0; i < cleanTranscriptWords.length - 3; i++) {
    let runningText = '';
    for (let j = 0; j < 10 && i + j < cleanTranscriptWords.length; j++) {
      runningText += cleanTranscriptWords[i + j].clean + ' ';
      const score = calculateMatchScore(runningText.trim(), startWords);
      if (score > bestStartScore) {
        bestStartScore = score;
        bestStartMatch = cleanTranscriptWords[i].timestamp;
        bestStartIndex = i;
      }
    }
  }

  if (bestStartScore >= 0.2) {
    console.log('Found start match with score:', bestStartScore);
    console.log('Start time:', bestStartMatch);
    console.log('Matched start text:', cleanTranscriptWords[bestStartIndex].text);
  } else {
    console.log('No good start match found');
    return null;
  }

  // Find best match for end, starting from after the start match
  let bestEndMatch = null;
  let bestEndScore = 0;
  let bestEndIndex = 0;

  // Look for end match incrementally, starting with 3 minutes and expanding if needed
  const WINDOW_SIZE = 180; // 3 minutes in seconds
  const MAX_WINDOWS = 5; // Try up to 15 minutes total
  let currentWindow = 1;

  while (currentWindow <= MAX_WINDOWS && !bestEndMatch) {
    console.log(`\nSearching in window ${currentWindow} (${currentWindow * 3} minutes)`);
    const searchEndIndex = bestStartIndex + (200 * currentWindow); // Increase search range with each window

    // Try to find the exact end segment within current window
    for (let i = bestStartIndex + 5; i < Math.min(searchEndIndex, cleanTranscriptWords.length - 3); i++) {
      const currentTimestamp = cleanTranscriptWords[i].timestamp;
      
      // Skip if we're beyond current window
      if (bestStartMatch && currentTimestamp - bestStartMatch > WINDOW_SIZE * currentWindow) {
        break;
      }

      let runningText = '';
      for (let j = 0; j < 10 && i + j < cleanTranscriptWords.length; j++) {
        runningText = cleanTranscriptWords[i + j].clean + ' ' + runningText;
        const score = calculateMatchScore(runningText.trim(), endWords);
        if (score > bestEndScore) {
          bestEndScore = score;
          bestEndMatch = cleanTranscriptWords[i + j].timestamp +
                        (cleanTranscriptWords[i + j].duration || 2);
          bestEndIndex = i + j;
          console.log('Found potential end match:', {
            score,
            text: runningText.trim(),
            target: endWords,
            time: bestEndMatch,
            window: `${currentWindow * 3} minutes`
          });
        }
      }
    }

    // If we found a good match, break out
    if (bestEndScore >= 0.3 && bestEndMatch !== null && bestStartMatch && bestEndMatch > bestStartMatch) {
      console.log('Found good match in window', currentWindow);
      break;
    } else {
      // Reset bestEndMatch but keep the score for comparison
      bestEndMatch = null;
      currentWindow++;
    }
  }

  // If we found a good end match, use it
  if (bestEndScore >= 0.3 && bestEndMatch !== null && bestStartMatch && bestEndMatch > bestStartMatch) {
    console.log('Using matched end with score:', bestEndScore);
    console.log('End time:', bestEndMatch);
    console.log('Matched end text:', cleanTranscriptWords[bestEndIndex].text);
    console.log('Clip duration:', bestEndMatch - bestStartMatch, 'seconds');
    return { start: bestStartMatch, end: bestEndMatch };
  }

  // Otherwise, look for the next sentence ending within the maximum search window
  console.log('Looking for sentence ending...');
  if (bestStartMatch) {
    const maxSearchIndex = Math.min(bestStartIndex + (200 * MAX_WINDOWS), cleanTranscriptWords.length);
    
    for (let i = bestStartIndex + 5; i < maxSearchIndex; i++) {
      const text = cleanTranscriptWords[i].text;
      if (text.match(/[.!?]$/)) {
        bestEndMatch = cleanTranscriptWords[i].timestamp +
                      (cleanTranscriptWords[i].duration || 2);
        console.log('Found sentence ending:', {
          text,
          time: bestEndMatch,
          duration: bestEndMatch - bestStartMatch
        });
        
        // If this makes for a very short clip, keep looking
        if (bestEndMatch - bestStartMatch < 10) {
          continue;
        }
        
        return {
          start: bestStartMatch,
          end: bestEndMatch
        };
      }
    }

    // If we still haven't found a good end, use a reasonable default duration
    const defaultEnd = Math.min(
      bestStartMatch + WINDOW_SIZE, // Default to 3 minutes
      words[words.length - 1].timestamp // Don't go past end of transcript
    );
    
    console.log('Using default end time:', defaultEnd);
    return {
      start: bestStartMatch,
      end: defaultEnd
    };
  }

  return null;
}

function calculateMatchScore(text1: string, text2: string): number {
  const words1 = text1.split(' ');
  const words2 = text2.split(' ');
  let matches = 0;
  let consecutiveMatches = 0;
  let maxConsecutiveMatches = 0;

  // Count matching words, being more lenient with matching
  for (let i = 0; i < Math.min(words1.length, words2.length); i++) {
    const word1 = words1[i];
    const word2 = words2[i];
    
    // Consider words matching if:
    // 1. They're exactly the same
    // 2. One contains the other
    // 3. They're at least 80% similar
    if (word1 === word2 || 
        word1.includes(word2) || 
        word2.includes(word1) ||
        calculateLevenshteinRatio(word1, word2) >= 0.8) {
      matches++;
      consecutiveMatches++;
      maxConsecutiveMatches = Math.max(maxConsecutiveMatches, consecutiveMatches);
    } else {
      consecutiveMatches = 0;
    }
  }

  // Calculate score based on both total matches and consecutive matches
  const matchRatio = matches / Math.max(words1.length, words2.length);
  const consecutiveBonus = maxConsecutiveMatches / Math.max(words1.length, words2.length);
  return (matchRatio * 0.6) + (consecutiveBonus * 0.4); // Weight total matches more than consecutive
}

function calculateLevenshteinRatio(s1: string, s2: string): number {
  const track = Array(s2.length + 1).fill(null).map(() =>
    Array(s1.length + 1).fill(null));
  for (let i = 0; i <= s1.length; i += 1) {
    track[0][i] = i;
  }
  for (let j = 0; j <= s2.length; j += 1) {
    track[j][0] = j;
  }
  for (let j = 1; j <= s2.length; j += 1) {
    for (let i = 1; i <= s1.length; i += 1) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator, // substitution
      );
    }
  }
  const distance = track[s2.length][s1.length];
  const maxLength = Math.max(s1.length, s2.length);
  return (maxLength - distance) / maxLength;
}

export async function realignClips(interviewId?: string): Promise<void> {
  try {
    // Filter clips if interviewId is provided
    const clipsToProcess = interviewId 
      ? clips.filter(clip => clip.interviewId === interviewId)
      : clips;

    if (clipsToProcess.length === 0) {
      console.log('No clips found to process');
      return;
    }

    // Group clips by interview
    const clipsByInterview = clipsToProcess.reduce((acc, clip) => {
      if (!acc[clip.interviewId]) {
        acc[clip.interviewId] = [];
      }
      acc[clip.interviewId].push(clip);
      return acc;
    }, {} as Record<string, Clip[]>);

    const updatedClips: Clip[] = [...clips];

    // Process each interview's clips
    for (const [currentInterviewId, interviewClips] of Object.entries(clipsByInterview)) {
      console.log(`\nProcessing clips for interview: ${currentInterviewId}`);

      // Read the transcript HTML
      const transcriptPath = path.join(process.cwd(), 'public', 'transcripts', `${currentInterviewId}.html`);
      const transcriptHtml = await fs.readFile(transcriptPath, 'utf-8');
      
      // Parse HTML and extract words with timestamps
      const dom = new JSDOM(transcriptHtml);
      const document = dom.window.document;
      const words: Word[] = [];
      
      const spans = document.querySelectorAll('span[data-m]');
      spans.forEach((span, index) => {
        const text = span.textContent?.trim();
        if (text) {
          const timestamp = parseInt(span.getAttribute('data-m') || '0', 10) / 1000;
          const duration = parseInt(span.getAttribute('data-d') || '2000', 10) / 1000;
          words.push({ text, timestamp, duration });
        }
      });

      // Process each clip
      for (const clip of interviewClips) {
        console.log(`\nProcessing clip: ${clip.title}`);
        console.log('Original transcript:', clip.transcript);
        console.log(`Original times: ${clip.startTime} -> ${clip.endTime}`);

        const match = findStartAndEndMatch(words, clip.transcript);
        if (match) {
          // Update the clip in the full clips array
          const clipIndex = updatedClips.findIndex(c => c.id === clip.id);
          if (clipIndex !== -1) {
            updatedClips[clipIndex] = {
              ...clip,
              startTime: match.start,
              endTime: match.end,
              duration: match.end - match.start
            };
            console.log(`Updated times: ${match.start} -> ${match.end}`);
          }
        } else {
          console.log('❌ No match found for clip');
        }
      }
    }

    // Write updated clips back to file
    const clipsContent = `import type { Clip } from '../types';

export const clips: Clip[] = ${JSON.stringify(updatedClips, null, 2)};

// Remove the dynamic functions and just export the static data
export default clips;`;

    await fs.writeFile(
      path.join(process.cwd(), 'src/data/clips.ts'),
      clipsContent,
      'utf-8'
    );

    console.log('\nSuccessfully updated clips file');
  } catch (error) {
    console.error('Error realigning clips:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  const interviewId = process.argv[2];
  realignClips(interviewId).catch(console.error);
} 