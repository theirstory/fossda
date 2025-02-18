import { promises as fs } from 'fs';
import path from 'path';
import { findQuoteTimeRange } from '@/lib/transcript';
import { Clip } from '@/types/index';

// Original clips array
export const clips: Clip[] = [
  // Early Exposure
  {
    id: 'bruce-first-programming',
    title: 'Programming in 1969',
    startTime: 120,
    endTime: 180,
    duration: 60,
    chapter: {
      id: 'early-years',
      title: 'Early Years and Education'
    },
    interviewId: 'bruce-perens',
    interviewTitle: 'Bruce Perens',
    transcript: "I got started with computers in 1969... I started programming by learning BASIC and assembly language from books, and by the time I was 16, I was a professional programmer.",
    themes: ['early-exposure', 'education']
  },
  {
    id: 'deb-unix-discovery',
    title: 'Discovering Unix in College',
    startTime: 180,
    endTime: 240,
    duration: 60,
    chapter: {
      id: 'education',
      title: 'Educational Background'
    },
    interviewId: 'deb-goodkin',
    interviewTitle: 'Deb Goodkin',
    transcript: "I started using Unix in college in 1981... and I just fell in love with the operating system.",
    themes: ['exposure', 'education']
  },
  
  // Personal Mission & Values
  {
    id: 'deb-mission',
    title: 'Enabling Innovation Through FreeBSD',
    startTime: 560,
    endTime: 620,
    duration: 60,
    chapter: {
      id: 'freebsd-foundation',
      title: 'The FreeBSD Foundation'
    },
    interviewId: 'deb-goodkin',
    interviewTitle: 'Deb Goodkin',
    transcript: "What drives me is seeing how FreeBSD enables innovation, education, and opportunity... It's about creating something bigger than ourselves.",
    themes: ['mission-values', 'community']
  },
  {
    id: 'heather-bridge-builder',
    title: 'Building Bridges in Open Source',
    startTime: 300,
    endTime: 420,
    duration: 120,
    chapter: {
      id: 'legal-perspective',
      title: 'Legal Perspective on Open Source'
    },
    interviewId: 'heather-meeker',
    interviewTitle: 'Heather Meeker',
    transcript: "My role has been to help companies understand how to work with open source legally and ethically... It's about building bridges between different worlds.",
    themes: ['mission-values', 'evolution']
  },

  // Education & Mentorship
  {
    id: 'bruce-self-taught',
    title: 'Learning from Books',
    startTime: 150,
    endTime: 210,
    duration: 60,
    chapter: {
      id: 'early-years',
      title: 'Early Years and Education'
    },
    interviewId: 'bruce-perens',
    interviewTitle: 'Bruce Perens',
    transcript: "I learned programming from books... it was all self-taught because there weren't many formal resources back then.",
    themes: ['education', 'exposure']
  },

  // Challenges & Growth
  {
    id: 'bruce-business-challenge',
    title: 'Convincing Companies About Open Source',
    startTime: 780,
    endTime: 840,
    duration: 60,
    chapter: {
      id: 'business-adoption',
      title: 'Business Adoption'
    },
    interviewId: 'bruce-perens',
    interviewTitle: 'Bruce Perens',
    transcript: "The biggest challenge was getting companies to understand that sharing code wasn't giving away their competitive advantage... It was actually making them stronger.",
    themes: ['challenges', 'evolution']
  },
  {
    id: 'heather-legal-frameworks',
    title: 'Creating New Legal Frameworks',
    startTime: 400,
    endTime: 460,
    duration: 60,
    chapter: {
      id: 'legal-evolution',
      title: 'Evolution of Open Source Law'
    },
    interviewId: 'heather-meeker',
    interviewTitle: 'Heather Meeker',
    transcript: "We had to create new legal frameworks, new ways of thinking about intellectual property... It was challenging but necessary.",
    themes: ['challenges', 'evolution']
  },

  // Open Source Projects
  {
    id: 'deb-freebsd',
    title: 'Working with FreeBSD',
    startTime: 340,
    endTime: 400,
    duration: 60,
    chapter: {
      id: 'freebsd-work',
      title: 'FreeBSD Foundation Work'
    },
    interviewId: 'deb-goodkin',
    interviewTitle: 'Deb Goodkin',
    transcript: "FreeBSD has been my focus... It's a project that exemplifies what open source can achieve.",
    themes: ['projects', 'community']
  },

  // Community & Collaboration
  {
    id: 'deb-freebsd-community',
    title: 'The FreeBSD Community',
    startTime: 340,
    endTime: 400,
    duration: 60,
    chapter: {
      id: 'community-building',
      title: 'Community Building'
    },
    interviewId: 'deb-goodkin',
    interviewTitle: 'Deb Goodkin',
    transcript: "The FreeBSD community is special because it's built on trust, on mentorship, on helping each other grow.",
    themes: ['community', 'education']
  },

  // Evolution of Open Source
  {
    id: 'heather-evolution',
    title: 'From Radical to Mainstream',
    startTime: 450,
    endTime: 510,
    duration: 60,
    chapter: {
      id: 'industry-evolution',
      title: 'Evolution of the Industry'
    },
    interviewId: 'heather-meeker',
    interviewTitle: 'Heather Meeker',
    transcript: "Open source has evolved from being this radical idea to being the foundation of modern software development... Every company today is an open source company whether they know it or not.",
    themes: ['evolution', 'mission-values']
  },
  {
    id: 'bruce-establishment',
    title: 'Becoming the Establishment',
    startTime: 600,
    endTime: 660,
    duration: 60,
    chapter: {
      id: 'movement-evolution',
      title: 'Movement Evolution'
    },
    interviewId: 'bruce-perens',
    interviewTitle: 'Bruce Perens',
    transcript: "We went from being rebels to being the establishment. Today, open source powers most of the internet, most of cloud computing.",
    themes: ['evolution', 'challenges']
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
        updatedClips.push({
          ...clip,
          startTime: timeRange.start,
          endTime: timeRange.end,
          duration: timeRange.end - timeRange.start
        });
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