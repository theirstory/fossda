# Elysia Integration Guide

This guide explains how to use Elysia in your Next.js application.

## Architecture

Elysia is a Python package, so we've created a Python API server that wraps Elysia functionality. Your Next.js app communicates with this server via HTTP.

```
Next.js App → Elysia API Server (Python) → Elysia → Weaviate
```

## Setup

### 1. Start the Elysia API Server

In a separate terminal, start the Elysia API server:

```bash
npm run elysia:server
```

Or manually:

```bash
source .venv-elysia/bin/activate
python scripts/elysia-api-server.py
```

The server will start on `http://localhost:8001` by default.

### 2. Configure Environment Variables

Add to your `.env` file (optional, defaults shown):

```env
ELYSIA_API_URL=http://localhost:8001
ELYSIA_API_PORT=8001
```

## Usage

### Option 1: Use the Elysia API Route

We've created a new API route at `/api/ask-elysia` that uses Elysia:

```typescript
// In your frontend code
const response = await fetch('/api/ask-elysia', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ question: 'What are the main themes?' }),
});

const data = await response.json();
console.log(data.response); // Elysia's answer
```

### Option 2: Use the Elysia Client Directly

Import and use the Elysia client in your code:

```typescript
import { askElysia, checkElysiaHealth } from '@/lib/elysia';

// Check if Elysia is available
const health = await checkElysiaHealth();
if (health.status === 'ok') {
  // Ask a question
  const result = await askElysia('What did they say about open source?');
  console.log(result.response);
  console.log(result.objects); // Relevant Weaviate objects
}
```

### Option 3: Replace the Existing `/api/ask` Route

You can modify `src/app/api/ask/route.ts` to use Elysia instead of the manual search + OpenAI approach:

```typescript
import { askElysia } from '@/lib/elysia';

export async function POST(request: Request) {
  const { question } = await request.json();
  
  try {
    const result = await askElysia(question);
    // Format and return the response
    return NextResponse.json({ response: result.response });
  } catch (error) {
    // Fallback to existing implementation if Elysia fails
    // ... existing code ...
  }
}
```

## API Endpoints

### Elysia API Server Endpoints

- `GET /` - Health check
- `GET /health` - Detailed health check with connection status
- `POST /ask` - Ask a question

#### POST /ask

Request:
```json
{
  "question": "What are the main themes?",
  "collection_names": ["Transcript"]
}
```

Response:
```json
{
  "response": "The main themes discussed include...",
  "objects": [...]
}
```

## Advantages of Using Elysia

1. **Agentic Decision Making**: Elysia uses a decision tree to choose the best tools and strategies
2. **Automatic Tool Selection**: No need to manually decide between query, aggregate, etc.
3. **Better Context Understanding**: Elysia understands your data structure and can make smarter queries
4. **Extensible**: Easy to add custom tools and workflows

## Troubleshooting

### Elysia API Server Not Running

If you get a connection error, make sure the server is running:

```bash
npm run elysia:server
```

### Port Conflicts

If port 8001 is in use, set a different port:

```env
ELYSIA_API_PORT=8002
```

### Environment Variables

Make sure your `.env` file has:
- `WEAVIATE_HOST` or `WCD_URL`
- `WEAVIATE_API_KEY` or `WCD_API_KEY`
- `OPENAI_API_KEY`

The Elysia API server automatically maps `WEAVIATE_HOST` to `WCD_URL` if needed.

## Development Workflow

1. Start the Elysia API server in one terminal:
   ```bash
   npm run elysia:server
   ```

2. Start your Next.js app in another terminal:
   ```bash
   npm run dev
   ```

3. Use Elysia in your code via the `/api/ask-elysia` route or the `askElysia` function.

## Production Deployment

For production, you'll want to:

1. Run the Elysia API server as a service (systemd, PM2, etc.)
2. Set `ELYSIA_API_URL` to your production server URL
3. Ensure the Python virtual environment is available in production
4. Consider using a process manager like PM2 or supervisor

Example PM2 configuration:

```json
{
  "name": "elysia-api",
  "script": "scripts/elysia-api-server.py",
  "interpreter": ".venv-elysia/bin/python",
  "env": {
    "ELYSIA_API_PORT": "8001"
  }
}
```

