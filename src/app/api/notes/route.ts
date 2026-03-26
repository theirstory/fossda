import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const NOTES_DIR = path.join(process.cwd(), 'data', 'notes');

// Ensure notes directory exists
async function ensureNotesDir() {
  try {
    await fs.mkdir(NOTES_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create notes directory:', error);
  }
}

// GET /api/notes - List all notes
export async function GET() {
  try {
    await ensureNotesDir();
    const files = await fs.readdir(NOTES_DIR);
    const notes = await Promise.all(
      files
        .filter(file => file.endsWith('.json'))
        .map(async (file) => {
          const filePath = path.join(NOTES_DIR, file);
          const content = await fs.readFile(filePath, 'utf-8');
          return JSON.parse(content);
        })
    );
    return NextResponse.json(notes.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    ));
  } catch (error) {
    console.error('Error reading notes:', error);
    return NextResponse.json(
      { error: 'Failed to read notes' },
      { status: 500 }
    );
  }
}

// POST /api/notes - Create a new note
export async function POST(request: Request) {
  try {
    await ensureNotesDir();
    const body = await request.json();
    const { title, content } = body;

    const note = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: title || 'Untitled Note',
      content: content || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const filePath = path.join(NOTES_DIR, `${note.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(note, null, 2), 'utf-8');

    return NextResponse.json(note);
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
}

