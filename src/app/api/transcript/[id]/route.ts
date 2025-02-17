// import { NextRequest } from 'next/server';
// import { promises as fs } from 'fs';
// import path from 'path';

// export async function GET(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const transcriptPath = path.join(process.cwd(), 'public', 'transcripts', `${params.id}.html`);
//     const transcriptHtml = await fs.readFile(transcriptPath, 'utf-8');
    
//     return new Response(transcriptHtml, {
//       headers: {
//         'Content-Type': 'text/html',
//       },
//     });
//   } catch (error) {
//     console.error('Error reading transcript:', error);
//     return new Response('Transcript not found', { status: 404 });
//   }
// } 