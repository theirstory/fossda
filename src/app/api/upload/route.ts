import { NextResponse } from 'next/server';
import { createMuxAsset } from '../../../lib/mux';

export async function POST(request: Request) {
  try {
    // Check for environment variables
    if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
      return NextResponse.json(
        { error: 'Mux credentials not configured' },
        { status: 500 }
      );
    }

    const { videoUrl } = await request.json();

    if (!videoUrl) {
      return NextResponse.json(
        { error: 'Video URL is required' },
        { status: 400 }
      );
    }

    const asset = await createMuxAsset(videoUrl);

    return NextResponse.json(asset);
  } catch (error) {
    console.error('Error in upload route:', error);
    return NextResponse.json(
      { error: 'Failed to process video' },
      { status: 500 }
    );
  }
} 