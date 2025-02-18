import { calculateClipDurations } from '../src/data/clips';

async function main() {
  const clips = await calculateClipDurations();
  console.log(JSON.stringify(clips, null, 2));
}

main().catch(console.error); 