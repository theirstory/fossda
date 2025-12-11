import { NextResponse } from 'next/server';
import { askElysia } from '@/lib/elysia';

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

    // Use Elysia to answer the question
    try {
      const result = await askElysia(question, ['Transcript']);
      
      return NextResponse.json({
        response: result.response,
        objects: result.objects,
      });
    } catch (err) {
      console.error('Elysia error:', err);
      
      // Check if it's a connection error
      if (err instanceof Error && err.message.includes('fetch')) {
        return NextResponse.json(
          { 
            error: 'Elysia API server is not running. Please start it with: npm run elysia:server',
            details: err.message 
          },
          { status: 503 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to process question with Elysia', details: err instanceof Error ? err.message : 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error('Error processing request:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

