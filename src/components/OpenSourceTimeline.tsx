"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { timelineEvents, TimelineEvent } from '@/data/timeline-events';
import { 
  Code2, 
  Building2, 
  FileText, 
  Users, 
  Cpu,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';

const categoryIcons = {
  software: Code2,
  organization: Building2,
  license: FileText,
  movement: Users,
  technology: Cpu,
};

const categoryColors = {
  software: 'bg-blue-100 text-blue-700 border-blue-300',
  organization: 'bg-green-100 text-green-700 border-green-300',
  license: 'bg-purple-100 text-purple-700 border-purple-300',
  movement: 'bg-orange-100 text-orange-700 border-orange-300',
  technology: 'bg-pink-100 text-pink-700 border-pink-300',
};

const categoryLabels = {
  software: 'Software',
  organization: 'Organization',
  license: 'License',
  movement: 'Movement',
  technology: 'Technology',
};

export default function OpenSourceTimeline() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [selectedDecade, setSelectedDecade] = useState<string>('all');

  // Group events by decade
  const decades = useMemo(() => {
    const decadeSet = new Set<number>();
    timelineEvents.forEach(event => {
      decadeSet.add(Math.floor(event.year / 10) * 10);
    });
    return Array.from(decadeSet).sort((a, b) => a - b);
  }, []);

  // Filter events
  const filteredEvents = useMemo(() => {
    return timelineEvents.filter(event => {
      const categoryMatch = selectedCategory === 'all' || event.category === selectedCategory;
      const decadeMatch = selectedDecade === 'all' || Math.floor(event.year / 10) * 10 === parseInt(selectedDecade);
      return categoryMatch && decadeMatch;
    }).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      if (a.month && b.month) return a.month - b.month;
      return 0;
    });
  }, [selectedCategory, selectedDecade]);

  const toggleExpanded = (eventId: string) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedEvents(newExpanded);
  };

  const formatDate = (event: TimelineEvent) => {
    if (event.month && event.day) {
      return new Date(event.year, event.month - 1, event.day).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } else if (event.month) {
      return new Date(event.year, event.month - 1).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      });
    }
    return event.year.toString();
  };

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        {/* Category Filter */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Filter by Category</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Events ({timelineEvents.length})
            </button>
            {Object.entries(categoryLabels).map(([key, label]) => {
              const Icon = categoryIcons[key as keyof typeof categoryIcons];
              const count = timelineEvents.filter(e => e.category === key).length;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    selectedCategory === key
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Decade Filter */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Filter by Decade</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedDecade('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedDecade === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Decades
            </button>
            {decades.map(decade => (
              <button
                key={decade}
                onClick={() => setSelectedDecade(decade.toString())}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedDecade === decade.toString()
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {decade}s
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-purple-200 to-pink-200 hidden md:block" />

        {/* Timeline events */}
        <div className="space-y-8">
          {filteredEvents.map((event) => {
            const Icon = categoryIcons[event.category];
            const isExpanded = expandedEvents.has(event.id);
            const hasInterviews = event.relatedInterviews && event.relatedInterviews.length > 0;

            return (
              <div key={event.id} className="relative">
                {/* Timeline dot */}
                <div className={`absolute left-8 -translate-x-1/2 w-6 h-6 rounded-full border-4 border-white shadow-lg hidden md:flex items-center justify-center ${
                  categoryColors[event.category].split(' ')[0]
                }`}>
                  <Icon className="w-3 h-3" />
                </div>

                {/* Content */}
                <div className="md:ml-20">
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl font-bold text-gray-900">
                              {event.year}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${categoryColors[event.category]}`}>
                              {categoryLabels[event.category]}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {event.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-1">
                            {formatDate(event)}
                          </p>
                        </div>
                        <Icon className={`w-8 h-8 flex-shrink-0 ${categoryColors[event.category].split(' ')[1]}`} />
                      </div>

                      {/* Description */}
                      <p className="text-gray-700 leading-relaxed mb-4">
                        {event.description}
                      </p>

                      {/* Related interviews toggle */}
                      {hasInterviews && (
                        <button
                          onClick={() => toggleExpanded(event.id)}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              Hide Related Interviews
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              Show {event.relatedInterviews?.length} Related Interview{event.relatedInterviews?.length !== 1 ? 's' : ''}
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Expanded related interviews */}
                    {isExpanded && hasInterviews && (
                      <div className="border-t border-gray-200 bg-gray-50 p-6">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">
                          Related Interviews
                        </h4>
                        <div className="space-y-3">
                          {event.relatedInterviews?.map((interview, idx) => (
                            <Link
                              key={idx}
                              href={interview.timestamp 
                                ? `/video/${interview.interviewId}?start=${interview.timestamp}`
                                : `/video/${interview.interviewId}`
                              }
                              className="block bg-white rounded-lg p-4 hover:shadow-md transition-shadow border border-gray-200"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900 mb-1">
                                    {interview.interviewTitle}
                                  </h5>
                                  {interview.context && (
                                    <p className="text-sm text-gray-600">
                                      {interview.context}
                                    </p>
                                  )}
                                </div>
                                <ExternalLink className="w-4 h-4 text-blue-600 flex-shrink-0" />
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">No events found for the selected filters.</p>
        </div>
      )}
    </div>
  );
}
