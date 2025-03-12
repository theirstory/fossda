import { NextResponse } from 'next/server';
import { videoData, VideoId } from '@/data/videos';
import type { VideoData } from '@/types/transcript';

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const id = params.id as VideoId;
  const video = videoData[id] as VideoData;

  if (!video) {
    return NextResponse.json(
      { error: 'Video not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ transcript: video.transcript || [] });
} 