"use client";

import { useState } from 'react';
import { Plus, Trash2, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Note } from '@/app/notes/page';
import { format } from 'date-fns';

interface NotesSidebarProps {
  notes: Note[];
  activeNoteId: string | null;
  onSelectNote: (noteId: string) => void;
  onCreateNote: () => void;
  onDeleteNote: (noteId: string) => void;
}

export default function NotesSidebar({
  notes,
  activeNoteId,
  onSelectNote,
  onCreateNote,
  onDeleteNote
}: NotesSidebarProps) {
  const [hoveredNoteId, setHoveredNoteId] = useState<string | null>(null);

  const handleDelete = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this note?')) {
      onDeleteNote(noteId);
    }
  };

  return (
    <div className="w-64 border-r border-gray-200 bg-gray-50 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <Button
          onClick={onCreateNote}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {notes.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No notes yet. Create one to get started!
          </div>
        ) : (
          <div className="p-2">
            {notes.map((note) => (
              <div
                key={note.id}
                className={`group relative p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                  activeNoteId === note.id
                    ? 'bg-blue-100 border border-blue-300'
                    : 'hover:bg-gray-100 border border-transparent'
                }`}
                onClick={() => onSelectNote(note.id)}
                onMouseEnter={() => setHoveredNoteId(note.id)}
                onMouseLeave={() => setHoveredNoteId(null)}
              >
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 mt-0.5 text-gray-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {note.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {format(new Date(note.updatedAt), 'MMM d, yyyy')}
                    </div>
                  </div>
                  {hoveredNoteId === note.id && (
                    <button
                      onClick={(e) => handleDelete(e, note.id)}
                      className="opacity-70 hover:opacity-100 text-red-500 flex-shrink-0"
                      title="Delete note"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

