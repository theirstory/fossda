import { NextResponse } from 'next/server';
import Mux from '@mux/mux-node';

const muxClient = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function POST(request: Request) {
  try {
    const { title, file } = await request.json();

    const asset = await muxClient.video.assets.create({
      input: file,
      playback_policy: 'public',
      mp4_support: 'standard'
    });

    return NextResponse.json({ 
      playbackId: asset.playback_ids?.[0]?.id,
      assetId: asset.id 
    });
  } catch (error) {
    console.error('Error uploading to Mux:', error);
    return NextResponse.json(
      { error: 'Failed to upload video' },
      { status: 500 }
    );
  }
} 