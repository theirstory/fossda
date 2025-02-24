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
    // Validate content type
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 415 }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { question } = body;

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Question is required and must be a string' },
        { status: 400 }
      );
    }

    // Search for relevant transcript segments
    let results;
    try {
      results = await searchTranscripts(question, 5);
    } catch (err) {
      console.error('Search error:', err);
      return NextResponse.json(
        { error: 'Failed to search transcripts' },
        { status: 500 }
      );
    }

    if (!results || results.length === 0) {
      return NextResponse.json(
        { error: 'No relevant results found' },
        { status: 404 }
      );
    }

    // Group segments by interview and chapter
    const groupedSegments = results.reduce((acc: GroupedSegments, segment: TranscriptSegment) => {
      const key = `${segment.interviewId}:${segment.chapterTitle}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(segment);
      return acc;
    }, {});

    // Format quotes
    const quotes = Object.entries(groupedSegments).map(([key, segments]: [string, TranscriptSegment[]]) => {
      const [interviewId, chapterTitle] = key.split(':');
      const videoTitle = videoData[interviewId]?.title || 'Unknown Speaker';
      const speaker = videoTitle.split(' - ')[0];
      
      // Combine nearby segments
      const combinedText = segments
        .sort((a: TranscriptSegment, b: TranscriptSegment) => a.timestamp - b.timestamp)
        .map((s: TranscriptSegment) => s.text)
        .join(' ');

      return {
        text: combinedText,
        interviewId,
        title: chapterTitle,
        timestamp: segments[0].timestamp,
        speaker,
        relevance: `This quote from ${speaker} discusses ${chapterTitle.toLowerCase()} and has a semantic similarity score of ${(segments[0]._additional.certainty * 100).toFixed(1)}%.`,
      };
    }) as Quote[];

    // Generate a response using the most relevant quotes
    const response = {
      text: `Based on the interviews, I found several relevant perspectives on your question. Here are the most relevant quotes from our archive:`,
      quotes: quotes.sort((a: Quote, b: Quote) => {
        const matchA = results.find((r: TranscriptSegment) => r.timestamp === a.timestamp);
        const matchB = results.find((r: TranscriptSegment) => r.timestamp === b.timestamp);
        const scoreA = matchA ? matchA._additional.certainty : 0;
        const scoreB = matchB ? matchB._additional.certainty : 0;
        return scoreB - scoreA;
      }),
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error('Error processing request:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 