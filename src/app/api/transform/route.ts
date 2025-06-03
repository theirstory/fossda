import { NextResponse } from 'next/server';
import { clips } from '@/data/clips';
import { Clip } from '@/types';

interface TimelineItem {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  duration: number;
  chapter: {
    id: string;
    title: string;
  };
  interviewId: string;
  interviewTitle: string;
  transcript: string;
  themes: string[];
}

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    
    // Convert prompt to lowercase for case-insensitive matching
    const promptLower = prompt.toLowerCase();
    
    // Define keywords for different categories
    const womenKeywords = ['women', 'woman', 'female', 'gender'];
    const earlyExperienceKeywords = ['early', 'first', 'begin', 'start', 'initial', 'exposure', 'childhood'];
    const communityKeywords = ['community', 'collaboration', 'together', 'group', 'team'];
    
    let filteredClips: Clip[] = clips;
    let message = 'All clips returned as no specific filter matched';
    
    // Filter based on keywords in prompt
    if (womenKeywords.some(keyword => promptLower.includes(keyword))) {
      filteredClips = clips.filter(clip => 
        clip.transcript.toLowerCase().includes('women') ||
        clip.transcript.toLowerCase().includes('woman') ||
        clip.transcript.toLowerCase().includes('female') ||
        clip.themes.includes('gender')
      );
      message = 'Filtered clips related to women in technology';
    } else if (earlyExperienceKeywords.some(keyword => promptLower.includes(keyword))) {
      filteredClips = clips.filter(clip => 
        clip.themes.includes('exposure') ||
        clip.themes.includes('education') ||
        clip.chapter.title.toLowerCase().includes('early') ||
        clip.title.toLowerCase().includes('early') ||
        clip.transcript.toLowerCase().includes('first') ||
        clip.transcript.toLowerCase().includes('begin')
      );
      message = 'Filtered clips about early experiences and exposure';
    } else if (communityKeywords.some(keyword => promptLower.includes(keyword))) {
      filteredClips = clips.filter(clip => 
        clip.themes.includes('community') ||
        clip.transcript.toLowerCase().includes('community') ||
        clip.transcript.toLowerCase().includes('collaboration')
      );
      message = 'Filtered clips about community and collaboration';
    }
    
    // Sort by startTime if chronological order is requested
    if (promptLower.includes('chronological') || promptLower.includes('timeline')) {
      filteredClips.sort((a, b) => a.startTime - b.startTime);
      message += ' (sorted chronologically)';
    }
    
    // Transform clips to timeline items
    const timelineItems: TimelineItem[] = filteredClips.map(clip => ({
      id: clip.id,
      title: clip.title,
      startTime: clip.startTime,
      endTime: clip.endTime,
      duration: clip.duration,
      chapter: clip.chapter,
      interviewId: clip.interviewId,
      interviewTitle: clip.interviewTitle,
      transcript: clip.transcript,
      themes: clip.themes
    }));
    
    return NextResponse.json({
      success: true,
      message,
      data: timelineItems
    });
  } catch (error) {
    console.error('Error in transform API:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to transform clips',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 