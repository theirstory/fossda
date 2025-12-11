import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    const { rawResponse, question } = body;

    if (!rawResponse || typeof rawResponse !== 'string') {
      return NextResponse.json(
        { error: 'rawResponse is required and must be a string' },
        { status: 400 }
      );
    }

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'question is required and must be a string' },
        { status: 400 }
      );
    }

    // Format the response using OpenAI
    const prompt = `You are a research assistant helping users understand open source interviews. The following is a raw response from an AI system that queried an archive of interviews. Your task is to reformat and improve this response to make it clearer, better structured, and more readable.

Rules:
1. Start with a clear topic sentence that does NOT repeat the question
2. Use proper Markdown formatting:
   - Use ## for section headings when discussing different topics or people
   - Use ### for subsections
   - Use bullet points (-) for lists with proper spacing
   - Use **bold** for emphasis on key terms, names, and important concepts
   - Use > for notable quotes from interviewees
3. Keep paragraphs short and well-structured. Start paragraphs with one or a few words that summarize the paragraph. Bold the first few words of key paragraphs to make them stand out using ** surrounding the words.
4. Preserve any citations [1], [2], etc. that are already in the text, placing them AFTER punctuation at the end of sentences
5. Ensure perfect grammar and professional tone
6. NEVER use asterisks (**) in the middle of words, but feel free to surround words or phrases with them to make key phrases stand out
7. NEVER combine or merge citation numbers
8. Keep citations sequential (1, 2, 3, etc.)
9. If the response discusses multiple people or topics, use headings to separate them
10. NEVER include the question in your response - start directly with your answer
11. Maintain the original meaning and information - only improve structure and clarity
12. If the response is already well-formatted, make minimal changes

User's Question: ${question}

Raw Response to Format:
${rawResponse}

Please reformat this response to be clearer, better structured, and more readable while preserving all citations and information.`;

    // Create a new ReadableStream for streaming the formatted response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [
              { 
                role: "system", 
                content: "You are a precise and articulate AI that reformats and improves text responses using Markdown formatting. Never repeat or reference the question - start directly with the reformatted content. Preserve all citations and factual information."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            temperature: 0.3,
            max_tokens: 2000,
            stream: true,
          });

          for await (const chunk of completion) {
            const chunkContent = chunk.choices[0]?.delta?.content || '';
            if (chunkContent) {
              const data = { type: 'content', content: chunkContent };
              controller.enqueue(new TextEncoder().encode(JSON.stringify(data) + '\n'));
            }
          }
        } catch (error) {
          console.error('Formatting error:', error);
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
    console.error('Error processing formatting request:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

