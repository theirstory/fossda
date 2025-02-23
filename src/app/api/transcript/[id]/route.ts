import { NextResponse } from 'next/server';
import { videoData } from '@/data/videos';

export async function GET({ params }: { params: { id: string } }) {
  const id = params.id;
  const video = videoData[id];

  if (!video || !video.transcript) {
    return NextResponse.json(
      { error: 'Transcript not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ transcript: video.transcript });
} 