"use client";

import { useState, useEffect, useCallback } from 'react';
import NotesEditor from '@/components/NotesEditor';
import NotesSidebar from '@/components/NotesSidebar';
import NotesRightSidebar from '@/components/NotesRightSidebar';
import { SearchResult } from '@/lib/search';

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  noteId: string;
  text: string;
  highlightedText: string;
  position: number;
  createdAt: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const loadNotes = useCallback(async () => {
    try {
      const response = await fetch('/api/notes');
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
        if (data.length > 0) {
          setActiveNoteId((current) => current ?? data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  }, []);

  // Load notes on mount
  useEffect(() => {
    void loadNotes();
  }, [loadNotes]);

  // Load comments for active note
  useEffect(() => {
    if (activeNoteId) {
      loadComments(activeNoteId);
    } else {
      setComments([]);
    }
  }, [activeNoteId]);

  const loadComments = async (noteId: string) => {
    try {
      const response = await fetch(`/api/notes/${noteId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const createNote = async () => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Untitled Note',
          content: ''
        })
      });
      if (response.ok) {
        const newNote = await response.json();
        setNotes([...notes, newNote]);
        setActiveNoteId(newNote.id);
      }
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  const updateNote = async (noteId: string, updates: Partial<Note>) => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (response.ok) {
        const updatedNote = await response.json();
        setNotes(notes.map(n => n.id === noteId ? updatedNote : n));
      }
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setNotes(notes.filter(n => n.id !== noteId));
        if (activeNoteId === noteId) {
          const remainingNotes = notes.filter(n => n.id !== noteId);
          setActiveNoteId(remainingNotes.length > 0 ? remainingNotes[0].id : null);
        }
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddComment = async (noteId: string, text: string, highlightedText: string, position: number) => {
    try {
      const response = await fetch(`/api/notes/${noteId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, highlightedText, position })
      });
      if (response.ok) {
        const newComment = await response.json();
        setComments([...comments, newComment]);
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const activeNote = notes.find(n => n.id === activeNoteId);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden" style={{ direction: 'ltr' }}>
      <NotesSidebar
        notes={notes}
        activeNoteId={activeNoteId}
        onSelectNote={setActiveNoteId}
        onCreateNote={createNote}
        onDeleteNote={deleteNote}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeNote ? (
          <NotesEditor
            note={activeNote}
            onUpdate={(updates) => updateNote(activeNoteId!, updates)}
            onSearch={handleSearch}
            onAddComment={(text, highlightedText, position) => 
              handleAddComment(activeNoteId!, text, highlightedText, position)
            }
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-lg mb-2">No note selected</p>
              <p className="text-sm">Create a new note to get started</p>
            </div>
          </div>
        )}
      </div>
      <NotesRightSidebar
        searchResults={searchResults}
        comments={comments}
        isSearching={isSearching}
      />
    </div>
  );
}

