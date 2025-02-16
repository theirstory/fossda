export interface TranscriptChapter {
  title: string;
  startTime: number;
  text: string;
}

export function addTimecodesToTranscript(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const paragraphs = doc.querySelectorAll('p');
  
  paragraphs.forEach((p) => {
    const firstSpan = p.querySelector('span[data-m]');
    if (firstSpan) {
      const startTime = parseInt(firstSpan.getAttribute('data-m') || '0', 10);
      const timeCode = document.createElement('div');
      timeCode.className = 'timecode';
      timeCode.textContent = formatTimecode(startTime / 1000);
      
      // Find the speaker element
      const speaker = p.querySelector('.speaker');
      if (speaker) {
        // Insert timecode before the speaker
        speaker.parentNode?.insertBefore(timeCode, speaker);
      }
    }
  });
  
  return doc.body.innerHTML;
}

function formatTimecode(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Update chapter parsing to include more meaningful sections
export function parseTranscriptChapters(html: string): TranscriptChapter[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const paragraphs = doc.querySelectorAll('p');
  
  const chapters: TranscriptChapter[] = [];
  
  const chapterMarkers = [
    {
      text: 'Welcome to the open source',
      title: 'Introduction'
    },
    {
      text: 'started really from people',
      title: 'Origins of Open Source'
    },
    {
      text: 'capture the personal stories',
      title: 'Purpose of FOSSDA'
    },
    {
      text: 'tell my own story',
      title: 'Personal Background'
    },
    {
      text: 'open source licenses',
      title: 'Open Source Licensing'
    }
  ];
  
  paragraphs.forEach((p) => {
    const firstSpan = p.querySelector('span[data-m]');
    if (firstSpan) {
      const startTime = parseInt(firstSpan.getAttribute('data-m') || '0', 10) / 1000;
      const text = p.textContent?.trim() || '';
      
      const marker = chapterMarkers.find(m => text.includes(m.text));
      if (marker) {
        chapters.push({
          title: marker.title,
          startTime,
          text
        });
      }
    }
  });
  
  return chapters;
} 