import weaviate, { ApiKey } from 'weaviate-ts-client';
import { VideoId } from '@/data/videos';

export interface TranscriptSegment {
  text: string;
  speaker: string;
  interviewId: VideoId;
  interviewTitle: string;
  timestamp: number;
  chapterTitle: string;
  thumbnail: string;
  _additional?: {
    certainty: number;
  };
}

if (!process.env.WEAVIATE_API_KEY) {
  throw new Error('WEAVIATE_API_KEY environment variable is not set');
}

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is not set');
}

if (!process.env.OPENAI_ORG_ID) {
  throw new Error('OPENAI_ORG_ID environment variable is not set');
}

if (!process.env.WEAVIATE_HOST) {
  throw new Error('WEAVIATE_HOST environment variable is not set');
}

// Create Weaviate client
const client = weaviate.client({
  scheme: 'https',
  host: process.env.WEAVIATE_HOST,
  apiKey: new ApiKey(process.env.WEAVIATE_API_KEY),
  headers: {
    'X-OpenAI-Api-Key': process.env.OPENAI_API_KEY,
    'X-OpenAI-Organization': process.env.OPENAI_ORG_ID
  }
});

// Define schema for transcripts
const TRANSCRIPT_CLASS_NAME = 'Transcript';

export async function setupSchema(): Promise<void> {
  try {
    // Check if schema exists
    const schema = await client.schema.getter().do();
    const exists = schema.classes?.some(c => c.class === TRANSCRIPT_CLASS_NAME);

    if (exists) {
      console.log('Deleting existing schema...');
      await client.schema
        .classDeleter()
        .withClassName(TRANSCRIPT_CLASS_NAME)
        .do();
      console.log('Existing schema deleted');
    }

    console.log('Creating new schema...');
    await client.schema
      .classCreator()
      .withClass({
        class: TRANSCRIPT_CLASS_NAME,
        description: 'A segment from an interview transcript',
        vectorizer: 'text2vec-openai',
        moduleConfig: {
          'text2vec-openai': {
            vectorizeClassName: false,
            model: 'ada',
            modelVersion: '002',
            type: 'text',
            vectorizePropertyName: false
          }
        },
        properties: [
          {
            name: 'text',
            dataType: ['text'],
            description: 'The transcript text',
            moduleConfig: {
              'text2vec-openai': {
                skip: false,
                vectorizePropertyName: false,
                vectorize: true
              }
            }
          },
          {
            name: 'speaker',
            dataType: ['text'],
            description: 'The speaker name',
            moduleConfig: {
              'text2vec-openai': {
                skip: true
              }
            }
          },
          {
            name: 'interviewId',
            dataType: ['text'],
            description: 'ID of the interview',
            moduleConfig: {
              'text2vec-openai': {
                skip: true
              }
            }
          },
          {
            name: 'interviewTitle',
            dataType: ['text'],
            description: 'Title of the interview',
            moduleConfig: {
              'text2vec-openai': {
                skip: true
              }
            }
          },
          {
            name: 'timestamp',
            dataType: ['number'],
            description: 'Timestamp in seconds',
            moduleConfig: {
              'text2vec-openai': {
                skip: true
              }
            }
          },
          {
            name: 'chapterTitle',
            dataType: ['text'],
            description: 'Title of the chapter this segment belongs to',
            moduleConfig: {
              'text2vec-openai': {
                skip: false,
                vectorizePropertyName: false,
                vectorize: true
              }
            }
          },
          {
            name: 'thumbnail',
            dataType: ['text'],
            description: 'URL of the interview thumbnail',
            moduleConfig: {
              'text2vec-openai': {
                skip: true
              }
            }
          },
        ],
      })
      .do();
    console.log('Schema created successfully');
  } catch (error) {
    console.error('Error setting up schema:', error);
    throw error;
  }
}

export async function addTranscriptSegment(segment: Omit<TranscriptSegment, '_additional'>): Promise<void> {
  try {
    await client.data
      .creator()
      .withClassName(TRANSCRIPT_CLASS_NAME)
      .withProperties(segment)
      .do();
  } catch (error) {
    console.error('Error adding transcript segment:', error);
    throw error;
  }
}

export async function searchTranscripts(query: string, limit: number): Promise<TranscriptSegment[]> {
  try {
    const result = await client.graphql
      .get()
      .withClassName(TRANSCRIPT_CLASS_NAME)
      .withFields('text speaker interviewId interviewTitle timestamp chapterTitle thumbnail _additional { certainty }')
      .withNearText({
        concepts: [query],
        certainty: 0.7,
      })
      .withLimit(limit)
      .do();

    return result.data.Get[TRANSCRIPT_CLASS_NAME];
  } catch (error) {
    console.error('Error searching transcripts:', error);
    throw error;
  }
} 