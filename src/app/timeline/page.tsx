'use client';

import Timeline from "@/components/Timeline";
import { videoData } from "@/data/videos";

interface TimelineItem {
  id: string;
  title: string;
  cardTitle: string;
  cardSubtitle: string;
  cardDetailedText: string;
}

export default function TimelinePage() {
  // Convert videos to timeline items
  const timelineItems: TimelineItem[] = Object.entries(videoData).map(([id, video]) => ({
    id,
    title: video.title,
    cardTitle: video.title,
    cardSubtitle: video.summary,
    cardDetailedText: video.sentence,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Interview Timeline</h1>
      <Timeline items={timelineItems} />
    </div>
  );
} 