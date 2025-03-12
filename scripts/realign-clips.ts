import { promises as fs } from 'fs';
import * as path from 'path';
import { JSDOM } from 'jsdom';
import type { Clip } from '../src/types';

interface Word {
  text: string;
  timestamp: number;
  duration?: number;
}

function cleanText(text: string): string {
  return text
    .toLowerCase()
    // Remove speaker attribution with or without ellipses
    .replace(/^[^:]+:\s*(?:\.{3,}\s*)?/i, '')
    // Remove leading ellipses
    .replace(/^\.{3,}\s*/i, '')
    // Remove trailing ellipses
    .replace(/\s*\.{3,}$/i, '')
    // Remove other punctuation except periods
    .replace(/[,!?;:'"()\[\]{}]/g, '')
    // Replace multiple spaces with single space
    .replace(/\s+/g, ' ')
    .trim();
}

function splitIntoSegments(text: string): string[] {
  // Split on ellipses and periods, but keep the first segment if it's substantial
  const segments = text
    .split(/\.{3,}|\./g)
    .map(s => cleanText(s))
    .filter(s => s.length > 0 && s.split(' ').length >= 5);

  if (segments.length === 0) {
    // If no substantial segments found, try with the whole text
    const cleanedText = cleanText(text);
    if (cleanedText.length > 0) {
      return [cleanedText];
    }
  }

  return segments;
}

function findStartAndEndMatch(words: Word[], searchText: string, originalDuration?: number): { start: number; end: number } | null {
  // Clean and split the search text into segments
  const segments = splitIntoSegments(searchText);
  
  if (segments.length === 0) {
    console.log('No valid segments found in search text');
    return null;
  }

  // Create clean version of transcript words
  const cleanTranscriptWords = words.map(w => ({
    ...w,
    clean: cleanText(w.text)
  }));

  // Try to find any of the segments in the transcript
  let bestMatch: number | null = null;
  let bestScore = 0;
  let bestIndex = 0;
  let bestText = '';
  let matchedSegment = '';

  // Always try the first clear segment first
  const firstSegment = segments[0];
  console.log('\nTrying to match first clear segment:', firstSegment);

  // Look in a window around the expected start time if available
  const originalStartTime = words[0]?.timestamp || 0;
  console.log('Trying to find match near expected start time:', originalStartTime);
  
  // Look in a wider window around the expected start time
  const windowStart = Math.max(0, Math.floor(originalStartTime) - 30); // 30 seconds before
  const windowEnd = Math.min(words.length - 1, Math.floor(originalStartTime) + 300); // 5 minutes after
  
  for (let i = 0; i < cleanTranscriptWords.length; i++) {
    const timestamp = cleanTranscriptWords[i].timestamp;
    if (timestamp < windowStart) continue;
    if (timestamp > windowEnd) break;

    // Skip speaker attributions
    if (cleanTranscriptWords[i].text.includes(':')) continue;

    // Try different window sizes
    for (let windowSize = 15; windowSize <= 40; windowSize += 5) {
      let runningText = '';
      let wordCount = 0;
      let j = i;

      while (wordCount < windowSize && j < cleanTranscriptWords.length) {
        if (!cleanTranscriptWords[j].text.includes(':')) {
          runningText += cleanTranscriptWords[j].clean + ' ';
          wordCount++;
        }
        j++;
      }

      const score = calculateMatchScore(runningText.trim(), firstSegment);
      
      if (score > 0.3) { // Higher threshold for initial matches
        console.log(`Potential match (score ${score.toFixed(2)}):`, runningText.trim());
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = cleanTranscriptWords[i].timestamp;
        bestIndex = i;
        bestText = runningText.trim();
        matchedSegment = firstSegment;
      }
    }
  }

  // If we didn't find a good match near the expected time, search the whole transcript
  if (bestScore < 0.3) {
    console.log('\nNo good match found near expected time, searching entire transcript...');
    
    for (let i = 0; i < cleanTranscriptWords.length; i++) {
      // Skip speaker attributions
      if (cleanTranscriptWords[i].text.includes(':')) continue;

      // Try different window sizes
      for (let windowSize = 15; windowSize <= 40; windowSize += 5) {
        let runningText = '';
        let wordCount = 0;
        let j = i;

        while (wordCount < windowSize && j < cleanTranscriptWords.length) {
          if (!cleanTranscriptWords[j].text.includes(':')) {
            runningText += cleanTranscriptWords[j].clean + ' ';
            wordCount++;
          }
          j++;
        }

        const score = calculateMatchScore(runningText.trim(), firstSegment);
        
        if (score > 0.3) {
          console.log(`Potential match (score ${score.toFixed(2)}):`, runningText.trim());
        }
        
        if (score > bestScore) {
          bestScore = score;
          bestMatch = cleanTranscriptWords[i].timestamp;
          bestIndex = i;
          bestText = runningText.trim();
          matchedSegment = firstSegment;
        }
      }
    }
  }

  // Require a reasonable threshold for matches
  if (bestScore >= 0.3 && bestMatch !== null) {
    console.log('\nFound match:');
    console.log('Score:', bestScore.toFixed(2));
    console.log('Time:', bestMatch);
    console.log('Matched text:', bestText);
    console.log('Matched segment:', matchedSegment);
    
    // Try to find a good end point
    const segmentIndex = segments.indexOf(matchedSegment);
    const remainingSegments = segments.slice(segmentIndex + 1);
    
    if (remainingSegments.length > 0) {
      console.log('\nLooking for end segments:', remainingSegments);
      
      let bestEndMatch: number | null = null;
      let bestEndScore = 0;
      let bestEndIndex = 0;
      let bestEndText = '';

      // Look for end match in a narrower window (2 minutes)
      const searchEndIndex = Math.min(bestIndex + 120, cleanTranscriptWords.length - 1);
      
      for (let i = bestIndex + 5; i < searchEndIndex; i++) {
        if (cleanTranscriptWords[i].text.includes(':')) continue;
        
        // Try each remaining segment
        for (const endSegment of remainingSegments) {
          if (endSegment.split(' ').length < 5) continue;

          for (let windowSize = 15; windowSize <= 40; windowSize += 5) {
            let runningText = '';
            let wordCount = 0;
            let j = i;

            while (wordCount < windowSize && j < cleanTranscriptWords.length) {
              if (!cleanTranscriptWords[j].text.includes(':')) {
                runningText = cleanTranscriptWords[j].clean + ' ' + runningText;
                wordCount++;
              }
              j++;
            }

            const score = calculateMatchScore(runningText.trim(), endSegment);
            
            if (score > 0.3) { // Higher threshold for end matches
              console.log(`Potential end match (score ${score.toFixed(2)}):`, runningText.trim());
            }
            
            if (score > bestEndScore) {
              bestEndScore = score;
              const endWord = cleanTranscriptWords[Math.min(i + j - 1, cleanTranscriptWords.length - 1)];
              bestEndMatch = endWord.timestamp + (endWord.duration || 2);
              bestEndIndex = i + j - 1;
              bestEndText = runningText.trim();
            }
          }
        }
      }

      if (bestEndScore >= 0.3 && bestEndMatch !== null && bestEndMatch > bestMatch) {
        console.log('\nFound end match:');
        console.log('Score:', bestEndScore.toFixed(2));
        console.log('End time:', bestEndMatch);
        console.log('Matched text:', bestEndText);
        return { start: bestMatch, end: bestEndMatch };
      }
    }
    
    // If no end segment or no good end match found, use original duration or reasonable default
    const duration = originalDuration || 60; // Use original duration if available, otherwise 1 minute
    return {
      start: bestMatch,
      end: bestMatch + duration
    };
  }

  console.log('No good match found');
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

export async function realignClips(clips: Clip[], interviewId?: string): Promise<Clip[]> {
  try {
    // Filter clips if interviewId is provided
    const clipsToProcess = interviewId 
      ? clips.filter(clip => clip.interviewId === interviewId)
      : clips;

    if (clipsToProcess.length === 0) {
      console.log('No clips found to process');
      return clips;
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

        const originalDuration = clip.endTime - clip.startTime;
        const match = findStartAndEndMatch(words, clip.transcript, originalDuration);
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

    return updatedClips;
  } catch (error) {
    console.error('Error realigning clips:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  const interviewId = process.argv[2];
  if (!interviewId) {
    console.error('Please provide an interview ID as an argument');
    process.exit(1);
  }
  import('../src/data/clips').then(({ clips }) => {
    realignClips(clips, interviewId).then(async (updatedClips) => {
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
    }).catch(console.error);
  }).catch(console.error);
} 