import { Clip } from '@/types/index';
import { VideoId } from '@/data/videos';

interface TheirStoryAPIResponse {
  id: string;
  title: string;
  transcript: string;
  startTime: number;
  endTime: number;
  metadata: {
    interviewId: VideoId;
    interviewTitle: string;
    chapter: {
      id: string;
      title: string;
    };
    themes: string[];
  };
}

export async function fetchInterview(interviewId: string): Promise<Clip[]> {
  try {
    const response = await fetch(`https://theirstory.github.io/theirstory-api/interviews/${interviewId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: TheirStoryAPIResponse[] = await response.json();
    
    // Transform the API response into our Clip format
    return data.map(item => ({
      id: item.id,
      title: item.title,
      startTime: item.startTime,
      endTime: item.endTime,
      duration: item.endTime - item.startTime,
      chapter: {
        id: item.metadata.chapter.id,
        title: item.metadata.chapter.title
      },
      interviewId: item.metadata.interviewId,
      interviewTitle: item.metadata.interviewTitle,
      transcript: item.transcript,
      themes: item.metadata.themes
    }));
  } catch (error) {
    console.error('Error fetching interview:', error);
    throw error;
  }
} 