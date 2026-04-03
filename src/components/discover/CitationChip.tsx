"use client";

import { useChatStore } from '@/stores/useChatStore';
import type { Citation } from '@/app/api/discover/route';

interface CitationChipProps {
  index: number;
  citations: Citation[];
}

export function CitationChip({ index, citations }: CitationChipProps) {
  const setActiveCitation = useChatStore((s) => s.setActiveCitation);
  const setHoveredCitation = useChatStore((s) => s.setHoveredCitation);
  const citation = citations.find((c) => c.index === index);

  if (!citation) return <span>[{index}]</span>;

  return (
    <button
      type="button"
      onClick={() => setActiveCitation(citation)}
      onMouseEnter={() => setHoveredCitation(index)}
      onMouseLeave={() => setHoveredCitation(null)}
      className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 mx-0.5 text-[11px] font-bold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors cursor-pointer align-super leading-none"
      title={`${citation.speaker} — ${citation.chapterTitle}`}
    >
      {index}
    </button>
  );
}
