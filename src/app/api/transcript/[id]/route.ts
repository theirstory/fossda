import { NextRequest, NextResponse } from 'next/server';
import { videoData, VideoId } from '@/data/videos';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id as VideoId;
  const video = videoData[id];

  if (!video || !video.transcript) {
    return NextResponse.json(
      { error: 'Transcript not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ transcript: video.transcript });
} 