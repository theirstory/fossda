import { setupSchema, addTranscriptSegment } from "@/lib/search";
import { clips } from "@/data/clips";
import { videoData } from "@/data/videos";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Setup schema
    await setupSchema();
    console.log('Schema setup complete');

    // Add test data
    console.log(`Adding ${clips.length} clips as test data...`);
    for (const clip of clips) {
      await addTranscriptSegment({
        text: clip.transcript,
        timestamp: clip.startTime,
        interviewId: clip.interviewId,
        interviewTitle: clip.interviewTitle,
        thumbnail: videoData[clip.interviewId].thumbnail,
        chapterTitle: clip.chapter.title,
      });
    }

    return NextResponse.json({ message: `Schema setup and test data import complete. Imported ${clips.length} clips.` });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: `Failed to setup: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
} 