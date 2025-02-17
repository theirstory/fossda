import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const filePath = path.join(process.cwd(), 'public', 'transcripts', 'introduction-to-fossda.vtt');
  const vttContent = fs.readFileSync(filePath, 'utf-8');
  
  return new NextResponse(vttContent, {
    headers: {
      'Content-Type': 'text/vtt',
      'Access-Control-Allow-Origin': '*'
    }
  });
} 