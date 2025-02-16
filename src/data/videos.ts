import { VideoData } from "@/types/transcript";

export const videoData: Record<string, VideoData> = {
  "introduction-to-fossda": {
    id: "introduction-to-fossda",
    title: "Introduction to FOSSDA",
    transcript: [
      {
        start: 0,
        end: 5.2,
        text: "Welcome to the open source stories, digital archive, or FOSSDA."
      },
      // ... more transcript segments
    ],
    insights: {
      entities: [
        {
          name: "Open Source",
          type: "concept",
          occurrences: [0, 15.5, 45.2]
        }
        // ... more entities
      ],
      topics: [
        {
          name: "Software Licensing",
          timestamps: [12.5, 35.8]
        }
        // ... more topics
      ]
    }
  }
}; 