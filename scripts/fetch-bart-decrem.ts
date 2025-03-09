import { fetchInterview } from '../src/lib/theirstory';
import { clips } from '../src/data/clips';
import fs from 'fs/promises';
import path from 'path';

async function main() {
  try {
    // Fetch Bart Decrem's interview
    console.log('Fetching Bart Decrem interview...');
    const bartDecremClips = await fetchInterview('bart-decrem');

    // Combine with existing clips
    const updatedClips = [...clips, ...bartDecremClips];

    // Format the clips array as a string with proper indentation
    const clipsContent = `import { Clip } from '@/types/index';

export const clips: Clip[] = ${JSON.stringify(updatedClips, null, 2)};

// Remove the dynamic functions and just export the static data
export default clips;`;

    // Write the updated clips back to the file
    await fs.writeFile(
      path.join(process.cwd(), 'src/data/clips.ts'),
      clipsContent,
      'utf-8'
    );

    console.log('Successfully added Bart Decrem interview clips!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main(); 