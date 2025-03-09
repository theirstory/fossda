import Mux from '@mux/mux-node';

interface ThumbnailOptions {
  time?: number;
  width?: number;
  height?: number;
}

// Initialize Mux client lazily
function getMuxClient() {
  if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
    throw new Error('Missing Mux credentials in environment variables');
  }

  return new Mux({
    tokenId: process.env.MUX_TOKEN_ID,
    tokenSecret: process.env.MUX_TOKEN_SECRET
  });
}

interface MuxAssetResponse {
  id: string;
  status: string;
  playback_ids?: Array<{
    id: string;
    policy: string;
  }>;
}

export async function createMuxAsset(videoUrl: string) {
  try {
    const { video: Video } = getMuxClient();
    const asset = await Video.assets.create({
      input: [{ url: videoUrl }],
      playback_policy: ['public'],
    });

    return asset;
  } catch (error) {
    console.error('Error creating Mux asset:', error);
    throw error;
  }
}

export async function getMuxAsset(assetId: string) {
  try {
    const { video: Video } = getMuxClient();
    const asset = await Video.assets.retrieve(assetId);
    return asset;
  } catch (error) {
    console.error('Error getting Mux asset:', error);
    throw error;
  }
}

export function getMuxPlaybackId(asset: MuxAssetResponse) {
  return asset.playback_ids?.[0]?.id;
}

export function generateMuxThumbnailUrl(playbackId: string, options: ThumbnailOptions = {}) {
  const { time, width = 640, height = 360 } = options;
  const baseUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg`;
  const params = new URLSearchParams();
  
  if (time) params.append('time', time.toString());
  if (width) params.append('width', width.toString());
  if (height) params.append('height', height.toString());
  
  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

export function generateMuxStreamUrl(playbackId: string) {
  return `https://stream.mux.com/${playbackId}.m3u8`;
} 