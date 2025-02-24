import { NextResponse } from 'next/server';
import { searchTranscripts, TranscriptSegment } from '@/lib/weaviate';
import { videoData } from '@/data/videos';
import OpenAI from 'openai';

interface Quote {
  text: string;
  interviewId: string;
  title: string;
  timestamp: number;
  speaker: string;
  relevance: string;
}

interface QuoteGroups {
  cited: Quote[];
  uncited: Quote[];
}

// Define stream response types
interface ContentMessage {
  type: 'content';
  content: string;
}

interface QuotesMessage {
  type: 'quotes';
  quotes: QuoteGroups;
}

type StreamMessage = ContentMessage | QuotesMessage;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function formatTimestamp(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export async function POST(request: Request) {
  try {
    // Validate content type
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 415 }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { question } = body;

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Question is required and must be a string' },
        { status: 400 }
      );
    }

    // Search for relevant transcript segments
    let results: TranscriptSegment[];
    try {
      results = await searchTranscripts(question, 5);
    } catch (err) {
      console.error('Search error:', err);
      return NextResponse.json(
        { error: 'Failed to search transcripts' },
        { status: 500 }
      );
    }

    if (!results || results.length === 0) {
      return NextResponse.json(
        { error: 'No relevant results found' },
        { status: 404 }
      );
    }

    // Format quotes and prepare context for GPT
    const quotes: Quote[] = results.map((segment) => {
      const videoTitle = videoData[segment.interviewId]?.title || 'Unknown Speaker';
      const speaker = videoTitle.split(' - ')[0];
      
      return {
        text: segment.text,
        interviewId: segment.interviewId,
        title: segment.chapterTitle,
        timestamp: segment.timestamp,
        speaker,
        relevance: `This quote from ${speaker} discusses ${segment.chapterTitle.toLowerCase()} at ${formatTimestamp(segment.timestamp)} and has a semantic similarity score of ${(segment._additional?.certainty ?? 0 * 100).toFixed(1)}%.`,
      };
    });

    // Prepare context for GPT
    const context = quotes.map((quote, index) => {
      return `[${index + 1}] ${quote.speaker} (${quote.title}): "${quote.text}"`;
    }).join('\n\n');

    // Generate response using GPT
    const prompt = `You are a research assistant helping users understand open source interviews. Based on the following context from our interviews, provide a clear and concise answer to the user's question.

Rules:
1. Start with a clear topic sentence that does NOT repeat the question
2. Use proper Markdown formatting:
   - The question will be automatically added as a heading - do not add it yourself
   - Use ## for section headings if needed
   - Use bullet points with proper spacing
   - Use **bold** for emphasis
   - Use > for notable quotes. E.g. you could use a quote from the interviewee to start a paragraph.
3. Keep paragraphs short and well-structured. Start paragraphs with one or a few words that summarize the paragraph. Because we're using Markdown, bold the first word of the paragraph to make it stand out using ** surrounding the words.
4. Place citations [1], [2], etc. AFTER punctuation at the end of sentences
5. Keep the total response under 150 words
6. Ensure perfect grammar and professional tone
7. NEVER use asterisks (**) in the middle of words, but feel free to surround words or phrases with them to make key phrases stand out. E.g. a phrase that starts the beginning of a paragraph with a colon which serves as a heading for the paragraph.
8. NEVER combine or merge citation numbers
9. Keep citations sequential (1, 2, 3, etc.)
10. Start your response with a clear topic sentence, followed by supporting points
11. NEVER include the question in your response - start directly with your answer

Example citation placement:
❌ The open source movement [1] has transformed software development.
✅ The open source movement has transformed software development [1].

Question: ${question}

Context:
${context}

Remember to maintain high standards of clarity and grammar while staying under the 150-word limit.`;

    // Create a new ReadableStream for streaming the response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [
              { 
                role: "system", 
                content: "You are a precise and articulate AI that provides clear, well-structured responses using Markdown formatting. Never repeat or reference the question - start directly with your response content."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            temperature: 0.2,
            max_tokens: 300,
            stream: true,
          });

          const citedQuoteIndexes = new Set<number>();
          let content = '';

          for await (const chunk of completion) {
            const chunkContent = chunk.choices[0]?.delta?.content || '';
            if (chunkContent) {
              content += chunkContent;
              // Extract citation numbers from the content
              const citations = content.match(/\[(\d+)\]/g) || [];
              citations.forEach(citation => {
                const index = parseInt(citation.match(/\d+/)?.[0] || '0') - 1;
                if (index >= 0) citedQuoteIndexes.add(index);
              });
              
              const data: StreamMessage = { type: 'content', content: chunkContent };
              controller.enqueue(new TextEncoder().encode(JSON.stringify(data) + '\n'));
            }
          }

          // After completion, send the quotes
          const citedQuotes = quotes.filter((_, index) => citedQuoteIndexes.has(index));
          const uncitedQuotes = quotes.filter((_, index) => !citedQuoteIndexes.has(index));

          const quotesData: StreamMessage = { 
            type: 'quotes', 
            quotes: {
              cited: citedQuotes,
              uncited: uncitedQuotes
            }
          };
          controller.enqueue(new TextEncoder().encode(JSON.stringify(quotesData) + '\n'));
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (err) {
    console.error('Error processing request:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 