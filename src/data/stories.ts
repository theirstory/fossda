import { ChapterMetadata } from "@/types/transcript";
import { chapterData } from "./chapters";
import { videoData } from "./videos";

export interface Story {
  id: string;
  title: string;
  interviewId: string;
  character: {
    name: string;
    role: string;
  };
  conflict: string;
  resolution: string;
  values: string[];
  themes: string[];
  lesson?: string;
  humor?: string;
  elicitingQuestion: string;
  timeRange: {
    start: number;
    end: number;
  };
  chapterRef: ChapterMetadata;
}

export interface GroupedStories {
  interviewId: string;
  interviewTitle: string;
  thumbnail: string;
  duration: string;
  stories: Story[];
}

// Sample stories from all interviews
export const stories: Story[] = [
  // Introduction to FOSSDA Stories
  {
    id: "open-source-impact",
    title: "The Impact of Open Source",
    interviewId: "introduction-to-fossda",
    character: {
      name: "Heather Meeker",
      role: "Open Source Advocate"
    },
    conflict: "Traditional software development was closed and proprietary",
    resolution: "Open source movement transformed software development, making it more accessible",
    values: ["Accessibility", "Collaboration", "Innovation"],
    themes: ["Open Source Impact", "Software Evolution"],
    lesson: "Open source has fundamentally changed how software is developed and distributed",
    elicitingQuestion: "How has open source changed the software industry?",
    timeRange: {
      start: 0,
      end: 27
    },
    chapterRef: chapterData["introduction-to-fossda"].metadata[0]
  },
  
  // Heather Meeker Stories
  {
    id: "early-career-transition",
    title: "From Law to Open Source",
    interviewId: "heather-meeker",
    character: {
      name: "Heather Meeker",
      role: "Open Source Lawyer"
    },
    conflict: "Traditional legal practice didn't align with emerging technology needs",
    resolution: "Pioneered open source legal practice and became a leading expert",
    values: ["Adaptability", "Innovation", "Expertise"],
    themes: ["Career Transition", "Legal Innovation"],
    lesson: "Sometimes the most rewarding path is the one you create yourself",
    elicitingQuestion: "What motivated you to specialize in open source law?",
    timeRange: {
      start: 69,
      end: 180
    },
    chapterRef: chapterData["heather-meeker"].metadata[1]
  },
  {
    id: "license-compliance",
    title: "The License Compliance Challenge",
    interviewId: "heather-meeker",
    character: {
      name: "Heather Meeker",
      role: "Open Source Lawyer"
    },
    conflict: "Companies struggling to understand and comply with open source licenses",
    resolution: "Development of clear compliance frameworks and best practices",
    values: ["Clarity", "Compliance", "Education"],
    themes: ["Legal Framework", "Business Strategy"],
    lesson: "Compliance can be achieved through education and clear guidelines",
    elicitingQuestion: "What are the biggest challenges in open source compliance?",
    timeRange: {
      start: 240,
      end: 360
    },
    chapterRef: chapterData["heather-meeker"].metadata[2]
  },

  // Deb Goodkin Stories
  {
    id: "freebsd-foundation-growth",
    title: "Growing the FreeBSD Foundation",
    interviewId: "deb-goodkin",
    character: {
      name: "Deb Goodkin",
      role: "Executive Director, FreeBSD Foundation"
    },
    conflict: "Limited resources and support for FreeBSD development",
    resolution: "Built sustainable funding model and expanded foundation's impact",
    values: ["Leadership", "Community Support", "Sustainability"],
    themes: ["Organizational Growth", "Community Building"],
    lesson: "Strong foundations enable community success",
    elicitingQuestion: "How did you transform the FreeBSD Foundation?",
    timeRange: {
      start: 50,
      end: 180
    },
    chapterRef: chapterData["deb-goodkin"].metadata[1]
  },
  {
    id: "community-building",
    title: "Building the FreeBSD Community",
    interviewId: "deb-goodkin",
    character: {
      name: "Deb Goodkin",
      role: "Executive Director, FreeBSD Foundation"
    },
    conflict: "Need to grow and diversify the FreeBSD community",
    resolution: "Created mentorship programs and outreach initiatives",
    values: ["Inclusivity", "Education", "Mentorship"],
    themes: ["Community Growth", "Diversity"],
    lesson: "Diverse communities build better software",
    elicitingQuestion: "What strategies worked best for growing the community?",
    timeRange: {
      start: 240,
      end: 360
    },
    chapterRef: chapterData["deb-goodkin"].metadata[2]
  },

  // Bruce Perens Stories (existing)
  {
    id: "steve-jobs-windows",
    title: "The Steve Jobs and Windows Story",
    interviewId: "bruce-perens",
    character: {
      name: "Bruce Perens",
      role: "Open Source Advocate"
    },
    conflict: "Steve Jobs switching to Windows and believing all computing would turn to Microsoft",
    resolution: "Bruce's resistance and belief in alternative systems",
    values: ["Independence of thought", "Technical conviction", "Willingness to disagree with authority"],
    themes: ["Technical Excellence", "Independence"],
    elicitingQuestion: "Can you tell me about a time when you had to stand up for your technical convictions?",
    timeRange: {
      start: 74.261,
      end: 156.4
    },
    chapterRef: chapterData["bruce-perens"].metadata[0]
  },
  {
    id: "distributed-trust",
    title: "The Distributed Trust Story",
    interviewId: "bruce-perens",
    character: {
      name: "Bruce Perens",
      role: "Debian Project Leader"
    },
    conflict: "Need to coordinate 50 developers who had never met in person",
    resolution: "Successfully created a working operating system that even flew on the space shuttle",
    values: ["Trust in community", "Belief in collaboration", "Distributed leadership"],
    themes: ["Trust in Community", "Technical Excellence", "Long-term Impact"],
    lesson: "Open source enables effective collaboration even without physical meetings",
    elicitingQuestion: "What was the most surprising success you had in coordinating open source developers?",
    timeRange: {
      start: 180,
      end: 240
    },
    chapterRef: chapterData["bruce-perens"].metadata[1]
  }
];

// Helper function to group stories by interview
export function groupStoriesByInterview(stories: Story[]): GroupedStories[] {
  const grouped = stories.reduce((acc, story) => {
    const group = acc.find(g => g.interviewId === story.interviewId);
    if (group) {
      group.stories.push(story);
    } else {
      // Get interview details from chapterData
      const interviewData = chapterData[story.interviewId];
      // Get duration from videoData
      const duration = videoData[story.interviewId].duration;
      // Special case for introduction video thumbnail
      const thumbnailName = story.interviewId === "introduction-to-fossda" ? "fossda-intro" : story.interviewId;
      acc.push({
        interviewId: story.interviewId,
        interviewTitle: interviewData.title,
        thumbnail: `/thumbnails/${thumbnailName}.png`,
        duration: duration,
        stories: [story]
      });
    }
    return acc;
  }, [] as GroupedStories[]);

  // Sort stories within each group by their start time
  return grouped.map(group => ({
    ...group,
    stories: group.stories.sort((a, b) => a.timeRange.start - b.timeRange.start)
  }));
} 