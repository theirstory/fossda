import { NextResponse } from 'next/server';
import { searchTranscripts } from '@/lib/search';

async function handleSearch(query: string | null) {
  if (!query || typeof query !== 'string') {
    return NextResponse.json(
      { error: 'Query is required and must be a string' },
      { status: 400 }
    );
  }

  try {
    const results = await searchTranscripts(query);
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}

// GET /api/search?q=... - Perform semantic search
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  return handleSearch(searchParams.get('q'));
}

// POST /api/search - Perform semantic search
export async function POST(request: Request) {
  const body = await request.json();
  return handleSearch(body.query);
}
