import { NextResponse } from 'next/server';
import Mux from '@mux/mux-node';

const muxClient = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function POST(request: Request) {
  try {
    const { assetId, startTime, endTime } = await request.json();

    const clip = await muxClient.video.assets.create({
      input: [{
        url: `mux://assets/${assetId}`,
        start_time: startTime,
        end_time: endTime
      }],
      playback_policy: ['public']
    });

    return NextResponse.json({ 
      playbackId: clip.playback_ids?.[0]?.id,
      assetId: clip.id 
    });
  } catch (error) {
    console.error('Error creating clip:', error);
    return NextResponse.json(
      { error: 'Failed to create clip' },
      { status: 500 }
    );
  }
} 