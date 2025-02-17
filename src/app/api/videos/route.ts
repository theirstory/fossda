import { NextResponse } from 'next/server';
import Mux from '@mux/mux-node';
import fs from 'fs';

const muxClient = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function POST(request: Request) {
  try {
    const { title, file } = await request.json();

    // Create the video asset
    const asset = await muxClient.video.assets.create({
      input: file,
      playback_policy: 'public',
      mp4_support: 'standard'
    });

    // Add captions to the asset
    const srtPath = 'public/transcripts/introduction-to-fossda.srt';
    const srtContent = fs.readFileSync(srtPath, 'utf-8');

    await muxClient.video.assets.createTrack(asset.id, {
      language_code: 'en',
      type: 'text',
      text_type: 'subtitles',
      name: 'English',
      closed_captions: true,
      status: 'ready',
      passthrough: 'English subtitles',
      url: srtContent
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