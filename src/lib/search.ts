import weaviate, { WeaviateClient } from 'weaviate-ts-client';

export interface SearchResult {
  text: string;
  timestamp: number;
  interviewId: string;
  interviewTitle: string;
  confidence: number;
  thumbnail: string;
  chapterTitle: string;
}

interface TranscriptResult {
  text: string;
  timestamp: number;
  interviewId: string;
  interviewTitle: string;
  thumbnail: string;
  chapterTitle: string;
  _additional?: {
    certainty?: number;
  };
}

let client: WeaviateClient;

export function getClient() {
  if (!client) {
    const host = process.env.WEAVIATE_HOST;
    const apiKey = process.env.WEAVIATE_API_KEY;
    const openAIKey = process.env.OPENAI_API_KEY;

    if (!host) {
      throw new Error('Missing WEAVIATE_HOST environment variable');
    }

    if (!apiKey) {
      throw new Error('Missing WEAVIATE_API_KEY environment variable');
    }

    if (!openAIKey) {
      throw new Error('Missing OPENAI_API_KEY environment variable');
    }

    try {
      client = weaviate.client({
        scheme: 'https',
        host,
        apiKey: new weaviate.ApiKey(apiKey),
        headers: {
          'X-OpenAI-Api-Key': openAIKey,
        },
      });
    } catch (error) {
      console.error('Error initializing Weaviate client:', error);
      throw new Error('Failed to initialize Weaviate client. Please check your configuration.');
    }
  }
  return client;
}

export async function deleteSchema() {
  const client = getClient();
  try {
    console.log('Deleting existing schema...');
    await client.schema.classDeleter().withClassName('Transcript').do();
    console.log('Schema deleted successfully');
  } catch (error) {
    // Ignore errors if the class doesn't exist
    console.log('Error deleting schema (might not exist):', error);
  }
}

export async function setupSchema() {
  const client = getClient();

  try {
    // First delete existing schema
    await deleteSchema();

    // Create new schema
    console.log('Creating Transcript schema...');
    await client.schema
      .classCreator()
      .withClass({
        class: 'Transcript',
        description: 'A segment of interview transcript',
        vectorizer: 'text2vec-openai',
        moduleConfig: {
          'text2vec-openai': {
            vectorizeClassName: false,
            model: 'ada',
            modelVersion: '002',
            type: 'text',
          },
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
              },
            },
          },
          {
            name: 'timestamp',
            dataType: ['number'],
            description: 'The timestamp in seconds',
          },
          {
            name: 'interviewId',
            dataType: ['text'],
            description: 'The ID of the interview',
          },
          {
            name: 'interviewTitle',
            dataType: ['text'],
            description: 'The title of the interview',
          },
          {
            name: 'thumbnail',
            dataType: ['text'],
            description: 'The URL of the interview thumbnail',
          },
          {
            name: 'chapterTitle',
            dataType: ['text'],
            description: 'The title of the chapter containing this segment',
          },
        ],
      })
      .do();
    console.log('Transcript schema created successfully');
  } catch (error) {
    console.error('Error setting up schema:', error);
    throw error;
  }
}

export async function searchTranscripts(query: string): Promise<SearchResult[]> {
  if (!query.trim()) {
    throw new Error('Search query cannot be empty');
  }

  const client = getClient();

  try {
    console.log('Searching Weaviate for:', query);
    const result = await client.graphql
      .get()
      .withClassName('Transcript')
      .withFields('text timestamp interviewId interviewTitle thumbnail chapterTitle _additional { certainty }')
      .withHybrid({
        query,
        alpha: 0.75, // Increase weight of keyword matching vs vector search
        properties: ['text^2', 'chapterTitle^0.5'], // Weight text higher than chapter title
      })
      .withWhere({
        path: ['text'],
        operator: 'Like',
        valueText: '* * * * *', // Ensure at least 5 words
      })
      .withLimit(20) // Increase initial limit to get more candidates
      .do();

    console.log('Search response:', JSON.stringify(result, null, 2));

    if (!result.data?.Get?.Transcript) {
      console.log('No results found');
      return [];
    }

    // Filter results by certainty and content quality
    const filteredResults = result.data.Get.Transcript
      .filter((item: TranscriptResult) => {
        // Skip certainty check if _additional is not present
        const certainty = item._additional?.certainty;
        if (certainty !== undefined && certainty < 0.7) return false;
        
        // Count words (more accurate than simple split)
        const wordCount = item.text.trim()
          .split(/\s+/)
          .filter((word: string) => word.length > 0).length;
        
        // Require at least 30 words
        if (wordCount < 30) return false;
        
        return true;
      })
      .map((item: TranscriptResult) => ({
        text: item.text,
        timestamp: item.timestamp,
        interviewId: item.interviewId,
        interviewTitle: item.interviewTitle,
        thumbnail: item.thumbnail,
        chapterTitle: item.chapterTitle,
        confidence: item._additional?.certainty ?? 1.0, // Default to 1.0 if certainty is not present
      }))
      .sort((a: SearchResult, b: SearchResult) => b.confidence - a.confidence); // Sort by confidence in descending order

    return filteredResults;
  } catch (error) {
    console.error('Error searching Weaviate:', error);
    throw error;
  }
}

export async function addTranscriptSegment(segment: {
  text: string;
  timestamp: number;
  interviewId: string;
  interviewTitle: string;
  thumbnail: string;
  chapterTitle: string;
}) {
  const client = getClient();

  try {
    console.log('Adding transcript segment:', segment);
    await client.data
      .creator()
      .withClassName('Transcript')
      .withProperties({
        text: segment.text,
        timestamp: segment.timestamp,
        interviewId: segment.interviewId,
        interviewTitle: segment.interviewTitle,
        thumbnail: segment.thumbnail,
        chapterTitle: segment.chapterTitle,
      })
      .do();
    console.log('Transcript segment added successfully');
  } catch (error) {
    console.error('Error adding transcript segment:', error);
    throw error;
  }
} 