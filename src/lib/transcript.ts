import { ChapterMetadata } from "@/types/transcript";

export interface TranscriptChapter {
  title: string;
  startTime: number;
  text: string;
}

export function addTimecodesToTranscript(html: string, chapters: ChapterMetadata[] = []): string {
  let processedHtml = html;
  
  // Sort chapters by start time
  const sortedChapters = [...chapters].sort((a, b) => a.time.start - b.time.start);
  
  // First add timecodes to paragraphs
  const parser = new DOMParser();
  const doc = parser.parseFromString(processedHtml, 'text/html');
  const paragraphs = doc.querySelectorAll('p');
  
  paragraphs.forEach((p) => {
    const firstSpan = p.querySelector('span[data-m]');
    if (firstSpan) {
      const startTime = parseInt(firstSpan.getAttribute('data-m') || '0', 10);
      const timeCode = document.createElement('div');
      timeCode.className = 'text-xs text-gray-500 mb-1';
      timeCode.textContent = formatTimecode(startTime / 1000);
      p.insertBefore(timeCode, p.firstChild);
    }
  });

  processedHtml = doc.body.innerHTML;

  // Add first chapter title at the very beginning
  if (sortedChapters.length > 0) {
    const firstChapter = sortedChapters[0];
    const firstChapterHeading = `
      <div class="bg-gray-50 border-l-4 border-gray-900 pl-4 py-4 mb-8 cursor-pointer hover:bg-gray-100 transition-colors" data-chapter-time="${firstChapter.time.start * 1000}">
        <h2 class="text-xl font-bold text-gray-900">
          ${firstChapter.title}
        </h2>
      </div>
    `;
    processedHtml = firstChapterHeading + processedHtml;
  }

  // Then add remaining chapter headings
  sortedChapters.slice(1).forEach(chapter => {
    const timeMs = chapter.time.start * 1000;
    const regex = new RegExp(`<span[^>]*?data-m="(\\d+)"[^>]*?>([^<]+)</span>`, 'g');
    let lastSentenceEnd = -1;
    let lastMatch = '';
    
    let match;
    while ((match = regex.exec(processedHtml)) !== null) {
      const spanTime = parseInt(match[1], 10);
      const text = match[2];
      
      if (spanTime > timeMs) break;
      
      if (text.match(/[.!?]\s*$/)) {
        lastSentenceEnd = spanTime;
        lastMatch = match[0];
      }
    }
    
    if (lastSentenceEnd !== -1) {
      const chapterHeading = `
        </p>
        <div class="bg-gray-50 border-l-4 border-gray-900 pl-4 py-4 my-8 cursor-pointer hover:bg-gray-100 transition-colors" data-chapter-time="${chapter.time.start * 1000}">
          <h2 class="text-xl font-bold text-gray-900">
            ${chapter.title}
          </h2>
        </div>
        <p>
      `;
      
      processedHtml = processedHtml.replace(
        lastMatch,
        lastMatch + chapterHeading
      );
    }
  });

  return processedHtml;
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

interface TimeRange {
  start: number;
  end: number;
}

export function findQuoteTimeRange(html: string, quote: string): TimeRange | null {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Clean up the quote and transcript text for comparison
  const cleanQuote = quote.trim().toLowerCase().replace(/\s+/g, ' ');
  
  // Get all spans with timestamps
  const spans = Array.from(doc.querySelectorAll('span[data-m]'));
  
  let matchStart = -1;
  let matchEnd = -1;
  let currentText = '';
  
  // Build up text and look for match
  for (let i = 0; i < spans.length; i++) {
    const span = spans[i];
    const text = span.textContent?.trim() || '';
    if (!text) continue;
    
    currentText += ' ' + text;
    currentText = currentText.toLowerCase().trim();
    
    if (matchStart === -1 && currentText.includes(cleanQuote.slice(0, 30))) {
      matchStart = parseInt(span.getAttribute('data-m') || '0', 10);
    }
    
    if (matchStart !== -1 && currentText.includes(cleanQuote.slice(-30))) {
      matchEnd = parseInt(span.getAttribute('data-m') || '0', 10);
      // Add approximate duration of last span
      if (span.getAttribute('data-d')) {
        matchEnd += parseInt(span.getAttribute('data-d') || '0', 10);
      } else {
        matchEnd += 2000; // Add 2 seconds as fallback
      }
      break;
    }
  }
  
  if (matchStart === -1 || matchEnd === -1) {
    console.warn('Could not find exact match for quote:', cleanQuote);
    return null;
  }
  
  return {
    start: matchStart / 1000, // Convert to seconds
    end: matchEnd / 1000
  };
} 