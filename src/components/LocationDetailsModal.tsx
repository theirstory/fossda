"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface LocationMention {
  location: string;
  interview_id: string;
  timestamp: number;
  context: string;
}

interface LocationDetailsModalProps {
  location: string;
  isOpen: boolean;
  onClose: () => void;
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function formatInterviewName(interviewId: string): string {
  return interviewId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

type ViewMode = 'all' | 'grouped';

export default function LocationDetailsModal({ location, isOpen, onClose }: LocationDetailsModalProps) {
  const [mentions, setMentions] = useState<LocationMention[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grouped');
  const [selectedInterview, setSelectedInterview] = useState<string>('all');
  const [collapsedInterviews, setCollapsedInterviews] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen && location) {
      setLoading(true);
      fetch('/locations.json')
        .then(res => res.json())
        .then((data: LocationMention[]) => {
          const filtered = data.filter(m => m.location === location);
          setMentions(filtered);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error loading location details:', err);
          setLoading(false);
        });
    }
  }, [isOpen, location]);

  // Group mentions by interview
  const mentionsByInterview = mentions.reduce((acc, mention) => {
    if (!acc[mention.interview_id]) {
      acc[mention.interview_id] = [];
    }
    acc[mention.interview_id].push(mention);
    return acc;
  }, {} as Record<string, LocationMention[]>);

  // Get unique interviews sorted by mention count
  const interviewStats = Object.entries(mentionsByInterview)
    .map(([id, mentions]) => ({ id, count: mentions.length }))
    .sort((a, b) => b.count - a.count);

  // Filter mentions based on selected interview
  const filteredMentions = selectedInterview === 'all' 
    ? mentions 
    : mentions.filter(m => m.interview_id === selectedInterview);

  const toggleInterviewCollapse = (interviewId: string) => {
    const newCollapsed = new Set(collapsedInterviews);
    if (newCollapsed.has(interviewId)) {
      newCollapsed.delete(interviewId);
    } else {
      newCollapsed.add(interviewId);
    }
    setCollapsedInterviews(newCollapsed);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{location}</h2>
              <p className="text-sm text-gray-600 mt-1">
                {mentions.length} {mentions.length === 1 ? 'mention' : 'mentions'} across {interviewStats.length} {interviewStats.length === 1 ? 'interview' : 'interviews'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* View Mode Toggle */}
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setViewMode('grouped')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'grouped'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                By Interview
              </button>
              <button
                onClick={() => setViewMode('all')}
                className={`px-4 py-2 text-sm font-medium transition-colors border-l border-gray-300 ${
                  viewMode === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                All Mentions
              </button>
            </div>

            {/* Interview Filter - always visible */}
            <select
              value={selectedInterview}
              onChange={(e) => setSelectedInterview(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">All Interviews ({mentions.length})</option>
              {interviewStats.map(({ id, count }) => (
                <option key={id} value={id}>
                  {formatInterviewName(id)} ({count})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading mentions...</p>
            </div>
          ) : mentions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No mentions found for this location.
            </div>
          ) : viewMode === 'grouped' ? (
            // Grouped by Interview View
            <div className="space-y-4">
              {interviewStats
                .filter(({ id }) => selectedInterview === 'all' || id === selectedInterview)
                .map(({ id, count }) => {
                const isCollapsed = collapsedInterviews.has(id);
                const interviewMentions = mentionsByInterview[id];
                
                return (
                  <div key={id} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Interview Header - Collapsible */}
                    <button
                      onClick={() => toggleInterviewCollapse(id)}
                      className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <svg
                          className={`w-5 h-5 text-gray-600 transition-transform ${
                            isCollapsed ? '' : 'rotate-90'
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="font-semibold text-gray-900">
                          {formatInterviewName(id)}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                          {count} {count === 1 ? 'mention' : 'mentions'}
                        </span>
                      </div>
                    </button>

                    {/* Interview Mentions */}
                    {!isCollapsed && (
                      <div className="p-4 space-y-4 bg-white">
                        {interviewMentions.map((mention, idx) => (
                          <div key={idx} className="border-l-2 border-blue-200 pl-4">
                            {/* Timestamp */}
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                                {formatTime(mention.timestamp)}
                              </span>
                            </div>

                            {/* Context */}
                            <p className="text-gray-700 leading-relaxed mb-3 text-sm">
                              {mention.context}
                            </p>

                            {/* Link to Interview */}
                            <Link
                              href={`/video/${mention.interview_id}?start=${mention.timestamp}`}
                              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                              onClick={onClose}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Watch this moment
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            // All Mentions View (with optional filter)
            <div className="space-y-6">
              {filteredMentions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No mentions found for the selected interview.
                </div>
              ) : (
                filteredMentions.map((mention, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    {/* Interview Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-blue-600">
                          {formatInterviewName(mention.interview_id)}
                        </span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-600 font-mono">
                          {formatTime(mention.timestamp)}
                        </span>
                      </div>
                    </div>

                    {/* Context */}
                    <p className="text-gray-700 leading-relaxed mb-3">
                      {mention.context}
                    </p>

                    {/* Link to Interview */}
                    <Link
                      href={`/video/${mention.interview_id}?start=${mention.timestamp}`}
                      className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                      onClick={onClose}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Watch this moment
                    </Link>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
