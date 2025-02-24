import { NextResponse } from 'next/server';
import { searchTranscripts } from '@/lib/weaviate';
import { videoData } from '@/data/videos';

interface TranscriptSegment {
  text: string;
  speaker: string;
  interviewId: string;
  timestamp: number;
  chapterTitle: string;
  _additional: {
    certainty: number;
  };
}

interface GroupedSegments {
  [key: string]: TranscriptSegment[];
}

interface Quote {
  text: string;
  interviewId: string;
  title: string;
  timestamp: number;
  speaker: string;
  relevance: string;
}

export async function POST(request: Request) {
  try {
    // Log the raw request
    const rawBody = await request.text();
    console.log('Raw request body:', rawBody);

    // Parse the JSON manually
    let questionData;
    try {
      questionData = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('Error parsing request JSON:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { question } = questionData;
    console.log('Parsed question:', question);

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Question is required and must be a string' },
        { status: 400 }
      );
    }

    // Test Weaviate connection
    try {
      // Search for relevant transcript segments
      console.log('Searching transcripts with question:', question);
      const results = await searchTranscripts(question, 5) as TranscriptSegment[];
      console.log('Search results:', results);

      if (!results || results.length === 0) {
        return NextResponse.json(
          { error: 'No relevant results found' },
          { status: 404 }
        );
      }

      // Group segments by interview and chapter
      const groupedSegments = results.reduce((acc: GroupedSegments, segment) => {
        const key = `${segment.interviewId}:${segment.chapterTitle}`;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(segment);
        return acc;
      }, {});

      // Format quotes
      const quotes = Object.entries(groupedSegments).map(([key, segments]) => {
        const [interviewId, chapterTitle] = key.split(':');
        const videoTitle = videoData[interviewId]?.title || 'Unknown Speaker';
        const speaker = videoTitle.split(' - ')[0];
        
        // Combine nearby segments
        const combinedText = segments
          .sort((a, b) => a.timestamp - b.timestamp)
          .map(s => s.text)
          .join(' ');

        return {
          text: combinedText,
          interviewId,
          title: chapterTitle,
          timestamp: segments[0].timestamp,
          speaker,
          relevance: `This quote from ${speaker} discusses ${chapterTitle.toLowerCase()} and has a semantic similarity score of ${(segments[0]._additional.certainty * 100).toFixed(1)}%.`,
        };
      });

      // Generate a response using the most relevant quotes
      const response = {
        text: `Based on the interviews, I found several relevant perspectives on your question. Here are the most relevant quotes from our archive:`,
        quotes: quotes.sort((a: Quote, b: Quote) => {
          const matchA = results.find(r => r.timestamp === a.timestamp);
          const matchB = results.find(r => r.timestamp === b.timestamp);
          const scoreA = matchA ? matchA._additional.certainty : 0;
          const scoreB = matchB ? matchB._additional.certainty : 0;
          return scoreB - scoreA;
        }),
      };

      console.log('Sending response:', response);
      return NextResponse.json(response);
    } catch (weaviateError) {
      console.error('Weaviate error:', weaviateError);
      return NextResponse.json(
        { error: 'Error connecting to search service' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Error processing question:', error);
    return NextResponse.json(
      { error: 'Failed to process question' },
      { status: 500 }
    );
  }
} 