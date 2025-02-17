// import { NextResponse } from 'next/server';
// import Mux from '@mux/mux-node';

// const muxClient = new Mux({
//   tokenId: process.env.MUX_TOKEN_ID!,
//   tokenSecret: process.env.MUX_TOKEN_SECRET!,
// });

// export async function POST(request: Request) {
//   try {
//     // Get the asset ID from your playback ID
//     const playbackId = process.env.NEXT_PUBLIC_MUX_PLAYBACK_ID!;
    
//     // First get the asset ID from the playback ID
//     const { data: assets } = await muxClient.video.assets.list({
//       playback_ids: playbackId
//     });
    
//     const assetId = assets[0]?.id;
//     if (!assetId) {
//       throw new Error('Asset not found');
//     }

//     // Create a text track with a unique name
//     await muxClient.video.assets.createTrack(assetId, {
//       url: 'https://gist.githubusercontent.com/overZellis133/cefab9de41be50ebf214d4cc812991ef/raw/1630a931edbf999e85d4c686a96bdcda284368f6/introduction-to-fossda',
//       type: 'text',
//       text_type: 'subtitles',
//       closed_captions: true,
//       language_code: 'en',
//       name: 'English Subtitles ' + new Date().toISOString()  // Make the name unique
//     });

//     return NextResponse.json({ success: true, assetId });
//   } catch (error) {
//     console.error('Error adding captions:', error);
//     return NextResponse.json(
//       { error: 'Failed to add captions', details: error },
//       { status: 500 }
//     );
//   }
// }

// export async function GET() {
//   // ... implementation
// } 