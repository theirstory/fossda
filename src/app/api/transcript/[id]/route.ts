import { NextResponse } from 'next/server';
import { videoData } from '@/data/videos';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(
  _: Request,
  props: RouteParams
) {
  const { id } = await props.params;
  const video = videoData[id];

  if (!video || !video.transcript) {
    return NextResponse.json(
      { error: 'Transcript not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ transcript: video.transcript });
} 