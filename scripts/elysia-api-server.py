#!/usr/bin/env python3
"""
Elysia API Server
A FastAPI server that wraps Elysia functionality for use with Next.js
"""

import os
import sys
import asyncio
import nest_asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import uvicorn
import json
import re

# Patch asyncio to allow nested event loops (needed for Elysia)
nest_asyncio.apply()

# Load environment variables
load_dotenv()

# Elysia expects WCD_URL and WCD_API_KEY for Weaviate Cloud
# Map from WEAVIATE_HOST/WEAVIATE_API_KEY if WCD_URL is not set
# IMPORTANT: Do this BEFORE importing Elysia modules
if not os.getenv('WCD_URL') and os.getenv('WEAVIATE_HOST'):
    weaviate_host = os.getenv('WEAVIATE_HOST')
    if not weaviate_host.startswith('http'):
        weaviate_host = f'https://{weaviate_host}'
    os.environ['WCD_URL'] = weaviate_host

if not os.getenv('WCD_API_KEY') and os.getenv('WEAVIATE_API_KEY'):
    os.environ['WCD_API_KEY'] = os.getenv('WEAVIATE_API_KEY')

if not os.getenv('WEAVIATE_IS_LOCAL'):
    os.environ['WEAVIATE_IS_LOCAL'] = 'False'

# Import Elysia after setting environment variables
try:
    import elysia
except ImportError:
    print("❌ Elysia is not installed. Please run:")
    print("   source .venv-elysia/bin/activate")
    print("   pip install elysia-ai")
    sys.exit(1)

app = FastAPI(title="Elysia API Server")

# Configure CORS to allow requests from Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Elysia Tree (lazy initialization)
tree = None

def get_tree():
    """Get or initialize the Elysia Tree."""
    global tree
    if tree is None:
        tree = elysia.Tree()
    return tree


def clean_elysia_response(text: str) -> str:
    """
    Remove Elysia's internal reasoning/meta-commentary from the response.
    Filters out phrases like "I am querying...", "Now searching...", etc.
    """
    if not text:
        return text
    
    # Patterns to remove (Elysia's internal reasoning steps)
    patterns_to_remove = [
        r'I (will|am) (begin|beginning|starting|querying|retrieving|searching|gathering|synthesizing|refining|finalizing)',
        r'Now (searching|querying|retrieving|gathering|synthesizing)',
        r'I have (gathered|retrieved|collected|found)',
        r'I (am|will) now (synthesizing|refining|finalizing|completing)',
        r'This (archive|collection) (contains|reveals|provides|offers)',
        r'Among the (collection\'s|archive\'s)',
        r'From a (policy|perspective)',
        r'Moreover,',
        r'Furthermore,',
        r'Similarly,',
    ]
    
    # Split into sentences
    sentences = re.split(r'(?<=[.!?])\s+', text)
    cleaned_sentences = []
    
    for sentence in sentences:
        # Check if sentence starts with any of the patterns
        should_remove = False
        for pattern in patterns_to_remove:
            if re.match(pattern, sentence, re.IGNORECASE):
                should_remove = True
                break
        
        # Also remove very short sentences that are just meta-commentary
        if len(sentence.strip()) < 20 and any(word in sentence.lower() for word in ['querying', 'retrieving', 'gathering', 'synthesizing']):
            should_remove = True
        
        if not should_remove:
            cleaned_sentences.append(sentence)
    
    # Join back together
    cleaned = ' '.join(cleaned_sentences)
    
    # Remove duplicate content (Elysia sometimes repeats itself)
    # Split by paragraphs and remove duplicates
    paragraphs = cleaned.split('\n\n')
    seen = set()
    unique_paragraphs = []
    for para in paragraphs:
        para_stripped = para.strip()
        # Use first 50 chars as a signature to detect duplicates
        signature = para_stripped[:50].lower() if len(para_stripped) > 50 else para_stripped.lower()
        if signature not in seen and len(para_stripped) > 20:
            seen.add(signature)
            unique_paragraphs.append(para)
    
    return '\n\n'.join(unique_paragraphs).strip()


class QuestionRequest(BaseModel):
    question: str
    collection_names: list[str] = ["Transcript"]


class QuestionResponse(BaseModel):
    response: str
    objects: list = []


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "ok", "service": "Elysia API Server"}


@app.post("/ask", response_model=QuestionResponse)
async def ask_question(request: QuestionRequest):
    """
    Ask a question using Elysia.
    
    Args:
        request: QuestionRequest with question and collection names
        
    Returns:
        QuestionResponse with the answer and relevant objects
    """
    try:
        tree = get_tree()
        
        # Query Elysia - run in executor to avoid event loop conflicts
        loop = asyncio.get_event_loop()
        response, objects = await loop.run_in_executor(
            None,
            lambda: tree(
                request.question,
                collection_names=request.collection_names
            )
        )
        
        # Clean up the response to remove meta-commentary
        cleaned_response = clean_elysia_response(response)
        
        return QuestionResponse(
            response=cleaned_response,
            objects=objects if objects else []
        )
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Error in ask_question: {error_details}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing question: {str(e)}"
        )


@app.post("/ask/stream")
async def ask_question_stream(request: QuestionRequest):
    """
    Ask a question using Elysia with streaming updates via async_run.
    Returns Server-Sent Events (SSE) with incremental status and content updates.
    """
    async def generate():
        try:
            from elysia.util.client import ClientManager
            import uuid
            
            tree = get_tree()
            client_manager = ClientManager()
            query_id = str(uuid.uuid4())
            
            # Send initial status
            yield f"data: {json.dumps({'type': 'status', 'message': 'Initializing...'})}\n\n"
            
            accumulated_content = ""
            all_objects = []
            last_status = ""
            
            # Use async_run to get incremental updates
            async for result in tree.async_run(
                request.question,
                collection_names=request.collection_names,
                client_manager=client_manager,
                query_id=query_id,
                close_clients_after_completion=True,
            ):
                if result is None:
                    continue
                
                # Convert result to frontend format if it has to_frontend method
                frontend_result = None
                if hasattr(result, 'to_frontend'):
                    try:
                        frontend_result = await result.to_frontend("", "", query_id)
                    except Exception as e:
                        print(f"Error converting result to frontend: {e}")
                        continue
                elif isinstance(result, dict):
                    frontend_result = result
                
                if not frontend_result:
                    continue
                
                result_type = frontend_result.get("type", "")
                payload = frontend_result.get("payload", {})
                
                # Status updates
                if result_type == "status":
                    status_text = payload.get("text", "") if isinstance(payload, dict) else str(payload)
                    if status_text and status_text != last_status:
                        last_status = status_text
                        yield f"data: {json.dumps({'type': 'status', 'message': status_text})}\n\n"
                
                # Tree updates (decision steps)
                elif result_type == "tree_update":
                    if isinstance(payload, dict):
                        reasoning = payload.get("reasoning", "")
                        if reasoning:
                            # Don't send reasoning as status, it's too verbose
                            pass
                
                # Text/Response content
                elif result_type in ["text", "response", "text_with_title"]:
                    text_content = ""
                    if isinstance(payload, dict):
                        text_content = payload.get("text", payload.get("content", ""))
                    elif isinstance(payload, str):
                        text_content = payload
                    
                    if text_content:
                        # Clean and send incremental content
                        cleaned = clean_elysia_response(text_content)
                        # Only send new content that hasn't been sent
                        if cleaned and cleaned != accumulated_content:
                            # Find the new part - check if cleaned is an extension of accumulated
                            if accumulated_content and cleaned.startswith(accumulated_content):
                                new_content = cleaned[len(accumulated_content):]
                            elif not accumulated_content:
                                # First chunk
                                new_content = cleaned
                            else:
                                # Different content, might be a replacement - don't send as incremental
                                # Just update accumulated but don't stream it (will send in final response)
                                accumulated_content = cleaned
                                new_content = None
                            
                            if new_content:
                                accumulated_content = cleaned
                                yield f"data: {json.dumps({'type': 'content', 'content': new_content})}\n\n"
                
                # Result objects
                elif result_type == "result":
                    if isinstance(payload, dict):
                        result_objects = payload.get("objects", [])
                        if result_objects:
                            all_objects.extend(result_objects)
                            yield f"data: {json.dumps({'type': 'objects', 'count': len(all_objects)})}\n\n"
                
                # Completion
                elif result_type == "completed":
                    # Get final text from conversation history
                    final_text = accumulated_content
                    if hasattr(tree, 'tree_data') and hasattr(tree.tree_data, 'conversation_history'):
                        if tree.tree_data.conversation_history:
                            final_text = tree.tree_data.conversation_history[-1].get("content", accumulated_content)
                    
                    # Clean final text
                    cleaned_final = clean_elysia_response(final_text)
                    
                    # Only send remaining content if it's actually new
                    if cleaned_final != accumulated_content:
                        # Check if final is an extension of accumulated
                        if accumulated_content and cleaned_final.startswith(accumulated_content):
                            remaining = cleaned_final[len(accumulated_content):]
                            if remaining:
                                yield f"data: {json.dumps({'type': 'content', 'content': remaining})}\n\n"
                        elif not accumulated_content:
                            # No accumulated content yet, send the full final
                            yield f"data: {json.dumps({'type': 'content', 'content': cleaned_final})}\n\n"
                        # If it's completely different, just use final in response
                    
                    # Get final objects from tree
                    final_objects = all_objects
                    if hasattr(tree, 'retrieved_objects') and tree.retrieved_objects:
                        final_objects = tree.retrieved_objects
                    
                    # Send final response with the cleaned final text (not accumulated, to avoid duplicates)
                    yield f"data: {json.dumps({'type': 'response', 'response': cleaned_final, 'objects': final_objects})}\n\n"
                    yield f"data: {json.dumps({'type': 'done'})}\n\n"
                    break
            
            # Cleanup
            if client_manager.is_client:
                await client_manager.close_clients()
            
        except Exception as e:
            import traceback
            error_details = traceback.format_exc()
            print(f"Error in ask_question_stream: {error_details}")
            yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")


@app.get("/health")
async def health():
    """Health check with Elysia connection status."""
    try:
        tree = get_tree()
        return {
            "status": "ok",
            "elysia_initialized": tree is not None,
            "weaviate_url": os.getenv('WCD_URL', 'Not set'),
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }


if __name__ == "__main__":
    port = int(os.getenv("ELYSIA_API_PORT", "8001"))
    print(f"🚀 Starting Elysia API Server on port {port}")
    print(f"📚 Collection: Transcript")
    print(f"🌐 CORS enabled for http://localhost:3000")
    # Disable uvloop to avoid conflicts with Elysia's nest_asyncio
    uvicorn.run(app, host="0.0.0.0", port=port, loop="asyncio")

