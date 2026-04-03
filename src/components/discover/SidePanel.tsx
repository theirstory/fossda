"use client";

import { useChatStore } from '@/stores/useChatStore';
import { PLAYBACK_IDS } from '@/config/playback-ids';
import { videoData, VideoId } from '@/data/videos';
import VideoPlayer from '@/components/VideoPlayer';
import { X, ExternalLink, ArrowLeft, Clock, FileText, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import type { Citation } from '@/app/api/discover/route';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function CitationRow({
  citation,
  onClick,
  isHighlighted,
}: {
  citation: Citation;
  onClick: () => void;
  isHighlighted: boolean;
}) {
  const rowRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isHighlighted && rowRef.current) {
      rowRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isHighlighted]);

  return (
    <button
      ref={rowRef}
      type="button"
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 hover:bg-gray-50 transition-colors border-t ${
        isHighlighted ? 'bg-blue-50 ring-1 ring-blue-300' : ''
      }`}
    >
      <div className="flex items-start gap-2">
        <span className="inline-flex items-center justify-center h-5 w-5 bg-blue-600 text-white text-[11px] font-bold rounded-full shrink-0 mt-0.5">
          {citation.index}
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-medium truncate">{citation.chapterTitle}</div>
            <div className="text-xs text-muted-foreground shrink-0">
              {formatTime(citation.timestamp)}
            </div>
          </div>
          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
            {citation.text}
          </p>
        </div>
      </div>
    </button>
  );
}

function RecordingGroup({
  interviewId,
  citations,
  onSelectCitation,
  hoveredCitationIndex,
}: {
  interviewId: string;
  citations: Citation[];
  onSelectCitation: (citation: Citation) => void;
  hoveredCitationIndex: number | null;
}) {
  const hasHighlighted = citations.some((c) => c.index === hoveredCitationIndex);
  const [isOpen, setIsOpen] = useState(true);
  const video = videoData[interviewId as VideoId];

  // Auto-expand if a hovered citation is in this group
  useEffect(() => {
    if (hasHighlighted && !isOpen) {
      setIsOpen(true);
    }
  }, [hasHighlighted, isOpen]);

  if (!video) return null;

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
      >
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
            isOpen ? '' : '-rotate-90'
          }`}
        />
        <div className="relative h-10 w-10 shrink-0 rounded overflow-hidden bg-gray-100">
          <Image
            src={video.thumbnail}
            alt={citations[0].speaker}
            fill
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1 text-left">
          <div className="text-sm font-medium truncate">{video.title}</div>
          <div className="text-xs text-muted-foreground">
            {citations.length} {citations.length === 1 ? 'source' : 'sources'}
          </div>
        </div>
      </button>
      {isOpen && (
        <div>
          {citations.map((citation) => (
            <CitationRow
              key={citation.index}
              citation={citation}
              onClick={() => onSelectCitation(citation)}
              isHighlighted={citation.index === hoveredCitationIndex}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SourcesListView() {
  const sidePanelCitations = useChatStore((s) => s.sidePanelCitations);
  const sidePanelQuery = useChatStore((s) => s.sidePanelQuery);
  const setActiveCitation = useChatStore((s) => s.setActiveCitation);
  const closeSidePanel = useChatStore((s) => s.closeSidePanel);
  const hoveredCitationIndex = useChatStore((s) => s.hoveredCitationIndex);

  // Group citations by recording
  const grouped = sidePanelCitations.reduce<Record<string, Citation[]>>((acc, citation) => {
    const key = citation.interviewId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(citation);
    return acc;
  }, {});

  const orderedKeys = Object.keys(grouped);

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium leading-snug">{sidePanelQuery}</h3>
          <button
            type="button"
            onClick={closeSidePanel}
            className="shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="text-xs text-blue-600 font-medium">
          Sources ({sidePanelCitations.length})
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {orderedKeys.map((interviewId) => (
          <RecordingGroup
            key={interviewId}
            interviewId={interviewId}
            citations={grouped[interviewId]}
            onSelectCitation={setActiveCitation}
            hoveredCitationIndex={hoveredCitationIndex}
          />
        ))}
      </div>
    </div>
  );
}

function CitationDetailView() {
  const activeCitation = useChatStore((s) => s.activeCitation);
  const backToSources = useChatStore((s) => s.backToSources);
  const closeSidePanel = useChatStore((s) => s.closeSidePanel);
  const sidePanelCitations = useChatStore((s) => s.sidePanelCitations);

  if (!activeCitation) return null;

  const interviewId = activeCitation.interviewId as VideoId;
  const playbackId = PLAYBACK_IDS[interviewId as keyof typeof PLAYBACK_IDS];
  const video = videoData[interviewId];

  if (!playbackId || !video) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-3 border-b">
          <button
            type="button"
            onClick={backToSources}
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to sources ({sidePanelCitations.length})
          </button>
          <button
            type="button"
            onClick={closeSidePanel}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4 text-sm text-muted-foreground">
          Video not available for this citation.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium leading-snug">
            <span className="inline-flex items-center justify-center h-5 w-5 bg-blue-600 text-white text-[11px] font-bold rounded-full mr-1.5 align-text-bottom">
              {activeCitation.index}
            </span>
            {activeCitation.speaker}
          </h3>
          <button
            type="button"
            onClick={closeSidePanel}
            className="shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={backToSources}
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to sources ({sidePanelCitations.length})
          </button>
          <Link
            href={`/video/${activeCitation.interviewId}?t=${Math.floor(activeCitation.timestamp)}`}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Open full interview"
          >
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <VideoPlayer
          playbackId={playbackId}
          onPlayStateChange={() => {}}
          chapters={[]}
          thumbnail={video.thumbnail}
          startTime={activeCitation.timestamp}
        />

        <div className="p-4 space-y-3">
          <div>
            <div className="text-xs text-muted-foreground">
              {activeCitation.chapterTitle}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
              <Clock className="h-3 w-3" />
              <span>{formatTime(activeCitation.timestamp)}</span>
            </div>
          </div>

          <Link
            href={`/video/${activeCitation.interviewId}?tab=transcript&t=${Math.floor(activeCitation.timestamp)}`}
            className="flex items-center justify-center gap-2 w-full py-2.5 border border-blue-600 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
          >
            <FileText className="h-4 w-4" />
            Open Full Transcript
          </Link>

          <blockquote className="border-l-2 border-blue-300 pl-3 text-sm text-gray-700 italic leading-relaxed">
            &ldquo;{activeCitation.text}&rdquo;
          </blockquote>
        </div>
      </div>
    </div>
  );
}

export function SidePanel() {
  const sidePanelView = useChatStore((s) => s.sidePanelView);

  if (sidePanelView === 'citation') {
    return <CitationDetailView />;
  }

  return <SourcesListView />;
}
