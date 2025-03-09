import { fetchStory } from './fetch-story';
import { clips } from '../src/data/clips';
import * as fs from 'fs/promises';
import * as path from 'path';
import type { Clip } from '../src/types';
import { JSDOM } from 'jsdom';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { videoData } from '../src/data/videos';
import { chapterData } from '../src/data/chapters';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const THEME_KEYWORDS = {
  'exposure': ['early', 'first', 'background', 'started', 'beginning', 'initially', 'introduced'],
  'mission-values': ['open source', 'free software', 'philosophy', 'belief', 'motivation', 'decision', 'choose', 'why', 'purpose'],
  'education': ['learn', 'study', 'university', 'school', 'college', 'professor', 'student', 'teach', 'influence'],
  'challenges': ['challenge', 'difficult', 'problem', 'issue', 'struggle', 'obstacle', 'risk', 'concern'],
  'projects': ['project', 'software', 'tool', 'application', 'develop', 'create', 'build', 'implement'],
  'community': ['community', 'people', 'team', 'contributor', 'collaboration', 'together', 'group', 'governance'],
  'evolution': ['change', 'grow', 'evolve', 'improve', 'progress', 'development', 'future', 'history']
} as const;

interface Word {
  text: string;
  timestamp: number;
}

interface GPTClipSuggestion {
  title: string;
  transcript: string;
  themes: string[];
  startTime: number;
  endTime: number;
}

function convertTimestamp(dataM: string): number {
  const num = parseInt(dataM, 10);
  return num / 1000; // Convert milliseconds to seconds
}

function formatTranscriptFilename(name: string): string {
  // Split the name into parts and convert to lowercase
  const parts = name.toLowerCase().split(' ');
  
  // If we have at least a first and last name
  if (parts.length >= 2) {
    return `${parts[0]}-${parts[parts.length - 1]}.html`;
  }
  
  // Fallback to just the name if we can't split it
  return `${name.toLowerCase().replace(/\s+/g, '-')}.html`;
}

async function analyzeTranscriptWithGPT(transcript: string, storyId: string): Promise<GPTClipSuggestion[]> {
  const prompt = `Go through the transcript of oral history interview. Find 5 to 10 clips that align to the themes of:  
  
exposure: How did you first get into computers, technology, or programming?  
  
mission-values: What got you into open source specifically? What personal beliefs, values, or experiences have shaped who you are?  
  
education: Who were people, areas of study, or ideas that have influenced you?  
  
challenges: What have been challenges you or the open source community have faced?  
  
projects: What open source projects have you been involved with?  
  
community: What can you tell me about how people have come together as a community?  
  
evolution: How has open source changed over time?  
  
Return your response as a JSON object with a "clips" array containing 5-10 clip objects. Here is an example of the expected format:

{
  "clips": [
    {
      "id": "perens-stallman-influence",
      "title": "From Free Software to Open Source",
      "startTime": 74.261,
      "endTime": 156.4,
      "duration": 82.139,
      "chapter": {
        "id": "evolution",
        "title": "The Genesis of Open Source Involvement"
      },
      "interviewId": "bruce-perens",
      "interviewTitle": "Bruce Perens",
      "transcript": "Heather Meeker: How'd you decide to get involved in/create this movement of open source? Bruce Perens: Well, obviously, I'm standing on the shoulders of giants because the work of Richard Stallman preceeded mine...",
      "themes": ["evolution", "mission-values", "community"]
    }
  ]
}

Make sure the time codes and the transcript excerpts are accurate in the clip metadata.  
  
The timecode data is within the transcript HTML file under the data-m attribute. In our clip metadata, transform the number so that the last three digits of what you get from the data-m attribute come after a decimal point. So, e.g., data-m="1842754" would be converted to "startTime": 1842.754. The endTime of a clip should correspond to the transformed data-m value of the next word after the last word in the transcript for the clip.

Transcript:
${transcript}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert in analyzing interviews about open source software and technology. Your task is to identify meaningful clips that would be valuable for viewers. Always return exactly the JSON format specified, with a clips array containing 5-10 entries. Each clip must include all fields shown in the example: id, title, startTime, endTime, duration, chapter (with id and title), interviewId, interviewTitle, transcript, and themes."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    // Fix TypeScript error by asserting content is not null
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    const result = JSON.parse(content);
    if (!result.clips || !Array.isArray(result.clips) || result.clips.length === 0) {
      throw new Error('Invalid response format from OpenAI: missing or empty clips array');
    }

    return result.clips;
  } catch (error) {
    console.error('Error analyzing transcript with GPT:', error);
    throw error;
  }
}

async function createClipsFromStory(interviewId: string) {
  try {
    // Get video data
    const video = videoData[interviewId];
    if (!video) {
      throw new Error(`No video data found for ${interviewId}`);
    }

    // Get chapter data
    const chapters = chapterData[interviewId];
    if (!chapters) {
      throw new Error(`No chapter data found for ${interviewId}`);
    }

    // Read HTML transcript
    const transcriptPath = path.join(process.cwd(), 'public', 'transcripts', `${interviewId}.html`);
    const transcriptHtml = await fs.readFile(transcriptPath, 'utf-8');

    // Parse HTML
    const dom = new JSDOM(transcriptHtml);
    const document = dom.window.document;

    // Extract words with timestamps
    const words: Word[] = [];
    const spans = document.querySelectorAll('span[data-m]');
    spans.forEach(span => {
      const text = span.textContent?.trim();
      if (text) {
        words.push({
          text,
          timestamp: convertTimestamp(span.getAttribute('data-m') || '0')
        });
      }
    });

    // Extract plain text transcript for GPT analysis
    const plainTranscript = words
      .map(word => word.text)
      .filter(text => text.trim().length > 0)
      .join(' ');
    
    // Get clip suggestions from GPT
    console.log('Analyzing transcript with GPT...');
    const clipSuggestions = await analyzeTranscriptWithGPT(plainTranscript, interviewId);
    
    // Transform GPT suggestions into clips
    const newClips: Clip[] = await Promise.all(clipSuggestions.map(async suggestion => {
      const cleanId = suggestion.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Find the chapter that contains this clip's start time
      const chapterMetadata = chapters.metadata.find((chapter, index) => {
        const nextChapter = chapters.metadata[index + 1];
        const start = chapter.time.start;
        const end = nextChapter ? nextChapter.time.start : Infinity;
        return suggestion.startTime >= start && suggestion.startTime < end;
      });

      return {
        id: `${interviewId}-${cleanId}`,
        title: suggestion.title,
        startTime: suggestion.startTime,
        endTime: suggestion.endTime,
        duration: suggestion.endTime - suggestion.startTime,
        chapter: {
          id: chapterMetadata?.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || cleanId,
          title: chapterMetadata?.title || suggestion.title
        },
        interviewId: interviewId,
        interviewTitle: video.title || 'Untitled Interview',
        transcript: suggestion.transcript,
        themes: suggestion.themes
      };
    })).then(clips => clips.filter(clip => {
      const MIN_DURATION = 10;    // 10 seconds minimum
      const MAX_DURATION = 300;   // 5 minutes maximum
      return clip.duration >= MIN_DURATION && clip.duration <= MAX_DURATION;
    }));

    // Combine with existing clips
    const updatedClips = [...clips, ...newClips];

    // Format the clips array as a string with proper indentation
    const clipsContent = `import type { Clip } from '../types';

export const clips: Clip[] = ${JSON.stringify(updatedClips, null, 2)};

// Remove the dynamic functions and just export the static data
export default clips;`;

    // Write the updated clips back to the file
    await fs.writeFile(
      path.join(process.cwd(), 'src/data/clips.ts'),
      clipsContent,
      'utf-8'
    );

    console.log(`Successfully added ${newClips.length} clips from interview!`);
    console.log('\nNew clips:');
    newClips.forEach(clip => {
      console.log(`\n${clip.title}`);
      console.log(`Duration: ${Math.floor(clip.duration)}s`);
      console.log(`Themes: ${clip.themes.join(', ')}`);
      console.log(`Transcript: ${clip.transcript}`);
    });

  } catch (error) {
    console.error('Error creating clips:', error);
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
  createClipsFromStory(interviewId).catch(console.error);
}

export { createClipsFromStory }; 