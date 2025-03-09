import dotenv from 'dotenv';
import * as path from 'path';
import Mux from '@mux/mux-node';

// Load environment variables from .env.local only
const envPath = path.join(process.cwd(), '.env.local');
console.log('Loading environment variables from:', envPath);

const envLocalResult = dotenv.config({ path: envPath, override: true });
if (envLocalResult.error) {
  console.error('Error loading .env.local:', envLocalResult.error);
  process.exit(1);
}

console.log('\nEnvironment variables loaded:', envLocalResult.parsed);

console.log('\nTesting Mux credentials...');
console.log('MUX_TOKEN_ID:', process.env.MUX_TOKEN_ID);
console.log('MUX_TOKEN_SECRET:', process.env.MUX_TOKEN_SECRET?.slice(0, 10) + '...');

const muxClient = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!
});

async function testMuxConnection() {
  try {
    const { video } = muxClient;
    const assets = await video.assets.list({ limit: 1 });
    console.log('\nSuccessfully connected to Mux!');
    console.log('Retrieved first asset:', assets.data[0]?.id || 'No assets found');
  } catch (error) {
    console.error('\nError connecting to Mux:', error);
    process.exit(1);
  }
}

testMuxConnection(); 