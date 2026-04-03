import { searchTranscripts, SearchResult } from '@/lib/search';
import { getAnthropicClient } from '@/lib/anthropic';
import { videoData, VideoId } from '@/data/videos';

export interface Citation {
  index: number;
  text: string;
  speaker: string;
  interviewId: string;
  timestamp: number;
  chapterTitle: string;
  interviewTitle: string;
}

interface RequestBody {
  messages: { role: 'user' | 'assistant'; content: string }[];
  query: string;
}

function sseEvent(data: Record<string, unknown>): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

function buildCitations(results: SearchResult[]): Citation[] {
  return results.map((segment, i) => {
    const videoTitle = videoData[segment.interviewId as VideoId]?.title || 'Unknown Speaker';
    const speaker = videoTitle.split(' - ')[0];
    return {
      index: i + 1,
      text: segment.text,
      speaker,
      interviewId: segment.interviewId,
      timestamp: segment.timestamp,
      chapterTitle: segment.chapterTitle,
      interviewTitle: segment.interviewTitle,
    };
  });
}

function buildSystemPrompt(citations: Citation[]): string {
  const sourcesBlock = citations
    .map(
      (c) =>
        `[${c.index}] ${c.speaker} — "${c.chapterTitle}" (timestamp ${Math.floor(c.timestamp)}s):\n"${c.text}"`
    )
    .join('\n\n');

  return `You are a knowledgeable research assistant for the FOSSDA (Free and Open Source Software Digital Archive) project. You help users explore interviews with key figures in the open source movement.

Answer the user's question based on the following interview transcript sources. Follow these rules strictly:

1. Place citations like [1], [2] etc. AFTER the quote or claim they support, never before it. For example: "quote text" [1], not [1] "quote text".
2. NEVER use ranges like [3-5] or grouped citations like [3, 4]. Always write them separately: [3][4][5].
3. Include direct quotes from the transcripts when they are compelling or illustrative.
4. Use proper Markdown formatting: **bold** for emphasis, > for block quotes, ## for section headings if needed.
5. Keep responses thorough but focused. Aim for 150-300 words.
6. If the sources don't contain enough information to answer, say so honestly.
7. Maintain a warm, scholarly tone appropriate for an oral history archive.

Sources:
${sourcesBlock}`;
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return new Response(JSON.stringify({ error: 'Content-Type must be application/json' }), {
        status: 415,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let body: RequestBody;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { messages, query } = body;
    if (!query || typeof query !== 'string') {
      return new Response(JSON.stringify({ error: 'query is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          controller.enqueue(
            encoder.encode(sseEvent({ type: 'status', content: 'Searching the archive...' }))
          );

          let results: SearchResult[];
          try {
            results = await searchTranscripts(query);
            results = results.slice(0, 10);
          } catch (err) {
            console.error('Weaviate search error:', err);
            controller.enqueue(
              encoder.encode(sseEvent({ type: 'error', content: 'Failed to search transcripts' }))
            );
            controller.close();
            return;
          }

          if (!results || results.length === 0) {
            controller.enqueue(
              encoder.encode(
                sseEvent({ type: 'error', content: 'No relevant results found for your question.' })
              )
            );
            controller.close();
            return;
          }

          const citations = buildCitations(results);

          controller.enqueue(
            encoder.encode(sseEvent({ type: 'citations', citations }))
          );

          controller.enqueue(
            encoder.encode(sseEvent({ type: 'status', content: 'Generating response...' }))
          );

          const systemPrompt = buildSystemPrompt(citations);

          const conversationMessages: { role: 'user' | 'assistant'; content: string }[] = [];
          if (messages && messages.length > 0) {
            for (const msg of messages) {
              if (msg.role === 'user' || msg.role === 'assistant') {
                conversationMessages.push({ role: msg.role, content: msg.content });
              }
            }
          }
          conversationMessages.push({ role: 'user', content: query });

          const anthropic = getAnthropicClient();
          const anthropicStream = anthropic.messages.stream({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1024,
            system: systemPrompt,
            messages: conversationMessages,
          });

          for await (const event of anthropicStream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              controller.enqueue(
                encoder.encode(sseEvent({ type: 'text', content: event.delta.text }))
              );
            }
          }

          controller.enqueue(encoder.encode(sseEvent({ type: 'done' })));
        } catch (error) {
          console.error('Stream error:', error);
          controller.enqueue(
            encoder.encode(sseEvent({ type: 'error', content: 'An unexpected error occurred.' }))
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err) {
    console.error('Error processing request:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
