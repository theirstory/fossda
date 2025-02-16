import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // First, let's log what we're trying to read
    const filePath = path.join(process.cwd(), 'public', 'transcripts', `${params.id}.html`);
    console.log('Attempting to read:', filePath);
    
    const html = await fs.readFile(filePath, 'utf-8');
    return NextResponse.json({ html });
  } catch (error) {
    console.error('Error loading transcript:', error);
    return NextResponse.json({ error: 'Transcript not found' }, { status: 404 });
  }
} 