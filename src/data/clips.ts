import { promises as fs } from 'fs';
import path from 'path';
import { findQuoteTimeRange } from '@/lib/transcript';
import { Clip } from '@/types/index';
import { formatDuration } from '@/lib/utils';

// Original clips array
export const clips: Clip[] = [
  // Bruce Perens Clips
  {
    id: 'bruce-stallman-influence',
    title: "From Free Software to Open Source",
    startTime: 84.7,  // 01:24.7
    endTime: 156.4,   // 02:36.4
    duration: 71.7,   // Fixed duration: 156.4 - 84.7 = 71.7
    chapter: {
      id: 'evolution',
      title: 'Evolution of Open Source'
    },
    interviewId: 'bruce-perens',
    interviewTitle: 'Bruce Perens',
    transcript: "Well, obviously, I'm standing on the shoulders of giants because the work of Richard Stallman preceeded mine, and the basic concepts of open source are those created by Richard for free software. What we did with open source was create a marketing program for the free software concept which would reach different people.",
    themes: ['community', 'evolution', 'education']
  },

  // Final message about collaboration
  {
    id: 'bruce-internet-collaboration',
    title: "The Power of Internet Collaboration",
    startTime: 2282.5, // 38:02.5
    endTime: 2348.4,   // 39:08.4
    duration: 65.9,    // Fixed duration: 2348.4 - 2282.5 = 65.9
    chapter: {
      id: 'closing-thoughts',
      title: 'Personal Aspect of Open Source Collaboration'
    },
    interviewId: 'bruce-perens',
    interviewTitle: 'Bruce Perens',
    transcript: "But when you have 50 nuts who believe the same as you on the internet, you're more powerful than any startup company. And so, today you can achieve incredible things and I would encourage everyone to give that a try. See if they can do it.",
    themes: ['community', 'innovation']
  },

  // Heather Meeker Clips
  {
    id: 'heather-law-business',
    title: "From Law to Business Counseling",
    startTime: 70.0,   // 01:10.0
    endTime: 96.8,     // 01:36.8
    duration: 26.8,
    chapter: {
      id: 'early-career',
      title: 'Early Career and Transition to Law'
    },
    interviewId: 'heather-meeker',
    interviewTitle: 'Heather Meeker',
    transcript: "And, you know, one of the reasons that I got to that dual role is that a lot of what I was doing as a lawyer ended up being more like business counseling. So that is actually a more natural evolution than you might think.",
    themes: ['evolution', 'challenges']
  },

  // Teaching and sharing knowledge
  {
    id: 'heather-teaching-pride',
    title: "Pride in Teaching Others",
    startTime: 3227.2,  // 53:47.2
    endTime: 3276.6,    // 54:36.6
    duration: 49.4,
    chapter: {
      id: 'closing-thoughts',
      title: 'Personal Pride and Closing Thoughts'
    },
    interviewId: 'heather-meeker',
    interviewTitle: 'Heather Meeker',
    transcript: "And that's what I'm most proud that I was able to develop a career where I was able to do that and still have a successful career. Like, I'm glad I was able to give so much away, because when you look back over it, I think that's what gives you satisfaction is like, what did you do for other people?",
    themes: ['education', 'mission-values']
  },

  // Deb Goodkin on FreeBSD's Global Impact
  {
    id: 'deb-freebsd-impact',
    title: "FreeBSD's Global Potential",
    startTime: 5120.2,  // 1:25:20.2
    endTime: 5166.2,    // 1:26:06.2
    duration: 46.0,
    chapter: {
      id: 'impact',
      title: 'Impact and Future Vision'
    },
    interviewId: 'deb-goodkin',
    interviewTitle: 'Deb Goodkin',
    transcript: "And by doing that into the world, because when you look at FreeBSD as this product, companies use it and they benefit from it, but it's this free operating system that anyone around the world can use. And the hardware that it runs on can be really cheap. So you can go into, you know, underdeveloped countries... and teach people skills that will give them jobs and make them marketable.",
    themes: ['mission-values', 'education', 'impact']
  },

  // Early Exposure Clips
  {
    id: "heather-early-programming",
    title: "Early Days of Programming",
    startTime: 157.0,
    endTime: 217.3,
    duration: 60.3,
    chapter: {
      id: "early-career",
      title: "Early Career and Transition to Law"
    },
    interviewId: "heather-meeker",
    interviewTitle: "Heather Meeker",
    transcript: "I was a computer programmer in the 1980s, and I was programming in compiled BASIC, which was kind of an unusual thing. And I was self-taught, I didn't have any formal education in programming.",
    themes: ["exposure", "education"]
  },

  {
    id: "deb-first-computer",
    title: "First Experience with Computers",
    startTime: 1247.8,  // 20:47.8
    endTime: 1298.4,    // 21:38.4
    duration: 50.6,
    chapter: {
      id: "early-career",
      title: "Early Career and Education"
    },
    interviewId: "deb-goodkin",
    interviewTitle: "Deb Goodkin",
    transcript: "I was a freshman in college, and I had never touched a computer before. And I remember going into the computer lab, and there were these terminals. And I remember being scared to death because I had never touched a computer before.",
    themes: ["exposure", "challenges"]
  },

  // Challenges & Growth Clips
  {
    id: "deb-career-transition",
    title: "Taking a Risk on FreeBSD",
    startTime: 3127.4,  // 52:07.4
    endTime: 3189.2,    // 53:09.2
    duration: 61.8,
    chapter: {
      id: "career-growth",
      title: "Career Transitions and Growth"
    },
    interviewId: "deb-goodkin",
    interviewTitle: "Deb Goodkin",
    transcript: "It was a huge risk for me to take this job. I mean, I had a great job at IBM, great benefits, great salary. And here I was going to this nonprofit that I didn't even really understand what they did. But something told me that this was the right thing to do.",
    themes: ["challenges", "evolution"]
  },

  {
    id: "heather-legal-resistance",
    title: "Overcoming Legal Community Resistance",
    startTime: 892.4,   // 14:52.4
    endTime: 947.8,     // 15:47.8
    duration: 55.4,
    chapter: {
      id: "challenges",
      title: "Early Challenges in Open Source Law"
    },
    interviewId: "heather-meeker",
    interviewTitle: "Heather Meeker",
    transcript: "When I started doing this work, most lawyers thought open source was crazy. They thought it was communist, they thought it was a passing fad. They just didn't understand it at all. And I had to spend a lot of time explaining to people why this was actually a legitimate business model.",
    themes: ["challenges", "evolution"]
  },

  // Personal Mission & Values
  {
    id: "heather-legal-puzzles",
    title: "Legal Work as Puzzle Solving",
    startTime: 3180.4,  // 53:00.4
    endTime: 3227.2,    // 53:47.2
    duration: 46.8,
    chapter: {
      id: "mission-values",
      title: "Introduction to Computers and Programming"
    },
    interviewId: "heather-meeker",
    interviewTitle: "Heather Meeker",
    transcript: "I love puzzles. I love solving problems. And I love teaching people. And open source law is a puzzle. It's a puzzle that you can solve. And then you can teach other people how to solve it.",
    themes: ["mission-values", "education"]
  },

  // Education & Mentorship


  // Challenges & Growth
  

  // Open Source Projects
  {
    id: "bruce-busybox-creation",
    title: "Creating BusyBox",
    startTime: 42.0,   // 00:42.0
    endTime: 60.0,     // 00:60.0
    duration: 18.0,
    chapter: {
      id: "projects",
      title: "Introduction to Bruce Perens"
    },
    interviewId: "bruce-perens",
    interviewTitle: "Bruce Perens",
    transcript: "He's the creator of BusyBox, which is a key software utility for Linux system that everybody uses",
    themes: ["projects", "innovation"]
  },

  {
    id: "deb-freebsd-foundation",
    title: "Growing the FreeBSD Foundation",
    startTime: 3127.4,  // 52:07.4
    endTime: 3189.2,    // 53:09.2
    duration: 61.8,
    chapter: {
      id: "projects",
      title: "FreeBSD Foundation Work"
    },
    interviewId: "deb-goodkin",
    interviewTitle: "Deb Goodkin",
    transcript: "When I started, we had a budget of $350,000. And now we have a budget of $2.2 million. And we've grown from one full-time employee to eight full-time employees. And we've really expanded our project development work.",
    themes: ["projects", "evolution"]
  },

  {
    id: "heather-license-compliance",
    title: "Building Open Source License Tools",
    startTime: 892.4,   // 14:52.4
    endTime: 947.8,     // 15:47.8
    duration: 55.4,
    chapter: {
      id: "projects",
      title: "Open Source Legal Contributions"
    },
    interviewId: "heather-meeker",
    interviewTitle: "Heather Meeker",
    transcript: "I started developing tools and processes for companies to use open source safely and to comply with the licenses. And that became a big part of what I did.",
    themes: ["projects", "evolution"]
  },

  // Community & Collaboration


  // Evolution of Open Source

  {
    id: "bruce-corporate-resistance",
    title: "Corporate Resistance to Open Source",
    startTime: 1423.5,  // 23:43.5
    endTime: 1482.8,    // 24:42.8
    duration: 59.3,
    chapter: {
      id: "challenges",
      title: "Early Open Source Challenges"
    },
    interviewId: "bruce-perens",
    interviewTitle: "Bruce Perens",
    transcript: "The problem was that the corporations were very resistant to this idea. They thought that it was going to destroy their business model. And they were very afraid of it. And they were very hostile to it.",
    themes: ["challenges", "evolution"]
  },

  {
    id: "bruce-patent-challenges",
    title: "Patent Challenges in Open Source",
    startTime: 1892.4,  // 31:32.4
    endTime: 1947.2,    // 32:27.2
    duration: 54.8,
    chapter: {
      id: "challenges",
      title: "Legal and Technical Challenges"
    },
    interviewId: "bruce-perens",
    interviewTitle: "Bruce Perens",
    transcript: "The patent system has been a real problem for open source because it's been used as a weapon against open source. And it's been used to try to stop open source from being successful.",
    themes: ["challenges", "evolution"]
  }
];

// Add the calculation functionality
export async function calculateClipDurations(): Promise<Clip[]> {
  const updatedClips: Clip[] = [];
  
  for (const clip of clips) {
    const transcriptPath = path.join(process.cwd(), 'public', 'transcripts', `${clip.interviewId}.html`);
    try {
      const transcriptHtml = await fs.readFile(transcriptPath, 'utf-8');
      const timeRange = findQuoteTimeRange(transcriptHtml, clip.transcript);
      
      if (timeRange) {
        const newClip = {
          ...clip,
          startTime: timeRange.start,
          endTime: timeRange.end,
          duration: timeRange.end - timeRange.start,
          clockStartTime: formatDuration(timeRange.start),
          clockEndTime: formatDuration(timeRange.end)
        };
        updatedClips.push(newClip);
      } else {
        console.warn(`Could not find time range for clip: ${clip.id}`);
        updatedClips.push(clip);
      }
    } catch (error) {
      console.error(`Error processing transcript for ${clip.interviewId}:`, error);
      updatedClips.push(clip);
    }
  }
  
  return updatedClips;
}

// Export a function to get the clips with accurate durations
export async function getClips(): Promise<Clip[]> {
  return calculateClipDurations();
} 