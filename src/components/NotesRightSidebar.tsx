"use client";

import { useState, useRef } from 'react';
import { SearchResult } from '@/lib/search';
import { Comment } from '@/app/notes/page';
import { Play, MessageSquare, X } from 'lucide-react';
import { Button } from './ui/button';
import VideoPlayer from './VideoPlayer';
import { MuxPlayerElement } from '@mux/mux-player-react';
import { PLAYBACK_IDS } from '@/config/playback-ids';
interface NotesRightSidebarProps {
  searchResults: SearchResult[];
  comments: Comment[];
  isSearching: boolean;
}

type NotesEditorWindow = Window & {
  insertTranscriptEmbed?: (result: SearchResult) => void;
  insertVideoEmbed?: (
    playbackId: string,
    interviewId: string,
    interviewTitle: string,
    thumbnail: string
  ) => void;
};

export default function NotesRightSidebar({
  searchResults,
  comments,
  isSearching,
}: NotesRightSidebarProps) {
  const [activeTab, setActiveTab] = useState<'search' | 'comments'>('search');
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const videoRef = useRef<MuxPlayerElement>(null);

  const handlePlayResult = (result: SearchResult) => {
    setSelectedResult(result);
    // Find playback ID for this interview
    const playbackId = PLAYBACK_IDS[result.interviewId as keyof typeof PLAYBACK_IDS];
    if (playbackId && videoRef.current) {
      videoRef.current.currentTime = result.timestamp;
      videoRef.current.play();
    }
  };

  const handleEmbedTranscript = (result: SearchResult) => {
    const w = window as NotesEditorWindow;
    if (w.insertTranscriptEmbed) {
      w.insertTranscriptEmbed(result);
    }
  };

  const handleEmbedVideo = (result: SearchResult) => {
    const playbackId = PLAYBACK_IDS[result.interviewId as keyof typeof PLAYBACK_IDS];
    const w = window as NotesEditorWindow;
    if (playbackId && w.insertVideoEmbed) {
      w.insertVideoEmbed(
        playbackId,
        result.interviewId,
        result.interviewTitle,
        result.thumbnail
      );
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-96 border-l border-gray-200 bg-white flex flex-col">
      <div className="border-b border-gray-200 flex">
        <button
          onClick={() => setActiveTab('search')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'search'
              ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Search Results
          {searchResults.length > 0 && (
            <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded-full">
              {searchResults.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'comments'
              ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Comments
          {comments.length > 0 && (
            <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded-full">
              {comments.length}
            </span>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'search' && (
          <div className="p-4">
            {isSearching ? (
              <div className="text-center text-gray-500 py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                Searching...
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>No search results yet.</p>
                <p className="text-sm mt-2">Select text and press Cmd/Ctrl+K to search</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedResult && (
                  <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
                    <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                      <span className="font-medium text-sm">{selectedResult.interviewTitle}</span>
                      <button
                        onClick={() => setSelectedResult(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="p-3">
                      <VideoPlayer
                        ref={videoRef}
                        playbackId={PLAYBACK_IDS[selectedResult.interviewId as keyof typeof PLAYBACK_IDS] || ''}
                        onPlayStateChange={() => {}}
                        chapters={[]}
                        thumbnail={selectedResult.thumbnail}
                      />
                    </div>
                  </div>
                )}
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm mb-1">{result.interviewTitle}</h4>
                        <p className="text-xs text-gray-500">
                          {result.chapterTitle} • {formatTime(result.timestamp)}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-3 line-clamp-3">
                      {result.text}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePlayResult(result)}
                        className="flex-1"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Play
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEmbedTranscript(result)}
                        className="flex-1"
                      >
                        Embed
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEmbedVideo(result)}
                        className="flex-1"
                      >
                        Video
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="p-4">
            {comments.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No comments yet.</p>
                <p className="text-sm mt-2">Select text and press Cmd/Ctrl+Shift+M to add a comment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="border border-gray-200 rounded-lg p-4 bg-yellow-50"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <MessageSquare className="h-4 w-4 mt-0.5 text-gray-500 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-1">Comment</p>
                        <p className="text-xs text-gray-500 mb-2 bg-white p-2 rounded border border-gray-200">
                          &ldquo;{comment.highlightedText}&rdquo;
                        </p>
                        <p className="text-sm text-gray-700">{comment.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

