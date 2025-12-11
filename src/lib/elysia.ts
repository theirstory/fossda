/**
 * Elysia API Client
 * Client for interacting with the Elysia Python API server
 */

const ELYSIA_API_URL = process.env.ELYSIA_API_URL || 'http://localhost:8001';

export interface ElysiaQuestionRequest {
  question: string;
  collection_names?: string[];
}

export interface ElysiaObject {
  text?: string;
  speaker?: string;
  interviewId?: string;
  interviewTitle?: string;
  timestamp?: number;
  chapterTitle?: string;
  thumbnail?: string;
  [key: string]: string | number | undefined;
}

export interface ElysiaQuestionResponse {
  response: string;
  objects: ElysiaObject[];
}

export interface ElysiaHealthResponse {
  status: string;
  elysia_initialized?: boolean;
  weaviate_url?: string;
  error?: string;
}

/**
 * Check if the Elysia API server is healthy
 */
export async function checkElysiaHealth(): Promise<ElysiaHealthResponse> {
  try {
    const response = await fetch(`${ELYSIA_API_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Elysia API returned ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Elysia health check failed:', error);
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Ask a question using Elysia
 */
export async function askElysia(
  question: string,
  collectionNames: string[] = ['Transcript']
): Promise<ElysiaQuestionResponse> {
  const response = await fetch(`${ELYSIA_API_URL}/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question,
      collection_names: collectionNames,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `Elysia API returned ${response.status}`);
  }

  return await response.json();
}

/**
 * Ask a question using Elysia with streaming updates
 */
export async function askElysiaStream(
  question: string,
  collectionNames: string[] = ['Transcript'],
  onUpdate: (data: {
    type: 'status' | 'content' | 'objects' | 'response' | 'done' | 'error';
    message?: string;
    content?: string;
    response?: string;
    objects?: ElysiaObject[];
    count?: number;
    error?: string;
  }) => void
): Promise<void> {
  const response = await fetch(`${ELYSIA_API_URL}/ask/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question,
      collection_names: collectionNames,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    onUpdate({
      type: 'error',
      error: error.detail || `Elysia API returned ${response.status}`,
    });
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    onUpdate({ type: 'error', error: 'Failed to get response stream' });
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          onUpdate(data);
        } catch (e) {
          console.error('Error parsing SSE data:', e);
        }
      }
    }
  }
}

/**
 * Format an Elysia response using OpenAI for better structure and readability
 */
export async function formatElysiaResponse(
  rawResponse: string,
  question: string,
  onUpdate: (content: string) => void
): Promise<string> {
  const response = await fetch('/api/format-elysia-response', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      rawResponse,
      question,
    }),
  });

  if (!response.ok) {
    throw new Error(`Formatting API returned ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Failed to get response stream');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let formattedContent = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.trim()) {
        try {
          const data = JSON.parse(line);
          if (data.type === 'content' && data.content) {
            formattedContent += data.content;
            onUpdate(formattedContent);
          }
        } catch (e) {
          console.error('Error parsing formatting stream:', e);
        }
      }
    }
  }

  return formattedContent;
}

