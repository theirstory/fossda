import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const COMMENTS_DIR = path.join(process.cwd(), 'data', 'notes', 'comments');

// Ensure comments directory exists
async function ensureCommentsDir() {
  try {
    await fs.mkdir(COMMENTS_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create comments directory:', error);
  }
}

function getCommentsPath(noteId: string): string {
  return path.join(COMMENTS_DIR, `${noteId}.json`);
}

// GET /api/notes/[id]/comments - Get all comments for a note
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureCommentsDir();
    const { id } = await params;
    const filePath = getCommentsPath(id);

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const comments = JSON.parse(content);
      return NextResponse.json(Array.isArray(comments) ? comments : []);
    } catch {
      // File doesn't exist, return empty array
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('Error reading comments:', error);
    return NextResponse.json(
      { error: 'Failed to read comments' },
      { status: 500 }
    );
  }
}

// POST /api/notes/[id]/comments - Create a new comment
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureCommentsDir();
    const { id } = await params;
    const body = await request.json();
    const { text, highlightedText, position } = body;

    const comment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      noteId: id,
      text,
      highlightedText,
      position,
      createdAt: new Date().toISOString(),
    };

    const filePath = getCommentsPath(id);
    let comments = [];

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      comments = JSON.parse(content);
    } catch {
      // File doesn't exist, start with empty array
    }

    comments.push(comment);
    await fs.writeFile(filePath, JSON.stringify(comments, null, 2), 'utf-8');

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}

