import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const NOTES_DIR = path.join(process.cwd(), 'data', 'notes');

function getNotePath(id: string): string {
  return path.join(NOTES_DIR, `${id}.json`);
}

// GET /api/notes/[id] - Get a specific note
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const filePath = getNotePath(id);
    const content = await fs.readFile(filePath, 'utf-8');
    return NextResponse.json(JSON.parse(content));
  } catch (error) {
    console.error('Error reading note:', error);
    return NextResponse.json(
      { error: 'Note not found' },
      { status: 404 }
    );
  }
}

// PATCH /api/notes/[id] - Update a note
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const filePath = getNotePath(id);
    const body = await request.json();

    // Read existing note
    const existingContent = await fs.readFile(filePath, 'utf-8');
    const note = JSON.parse(existingContent);

    // Update note
    const updatedNote = {
      ...note,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    await fs.writeFile(filePath, JSON.stringify(updatedNote, null, 2), 'utf-8');
    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json(
      { error: 'Failed to update note' },
      { status: 500 }
    );
  }
}

// DELETE /api/notes/[id] - Delete a note
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const filePath = getNotePath(id);
    await fs.unlink(filePath);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json(
      { error: 'Failed to delete note' },
      { status: 500 }
    );
  }
}

