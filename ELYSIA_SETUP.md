# Elysia Setup Guide

This guide will help you set up [Elysia](https://github.com/weaviate/elysia) to work with your Transcript collection in Weaviate.

## Prerequisites

- Python 3.12 (Elysia requires Python 3.12+)
- Your Weaviate cluster credentials in `.env` file
- OpenAI API key (for the LLM and vectorization)

## Quick Start

### 1. Install Python 3.12 (if needed)

If you don't have Python 3.12, install it via Homebrew:

```bash
brew install python@3.12
```

### 2. Run the Setup Script

The setup script will:
- Check for Python 3.12
- Create a virtual environment
- Install Elysia

```bash
./scripts/setup-elysia.sh
```

Or manually:

```bash
# Create virtual environment
python3.12 -m venv .venv-elysia

# Activate it
source .venv-elysia/bin/activate

# Install Elysia
pip install elysia-ai
```

### 3. Configure Environment Variables

Make sure your `.env` file contains:

```env
WEAVIATE_HOST=your-weaviate-host
WEAVIATE_API_KEY=your-api-key
OPENAI_API_KEY=your-openai-key
OPENAI_ORG_ID=your-org-id  # Optional
```

For Weaviate Cloud, you can also use:
```env
WCD_URL=your-weaviate-cloud-url
WCD_API_KEY=your-weaviate-cloud-key
WEAVIATE_IS_LOCAL=False
```

### 4. Preprocess Your Collection

Before using Elysia, you need to preprocess your Transcript collection:

```bash
source .venv-elysia/bin/activate
python scripts/preprocess-elysia.py
```

This will analyze your collection and prepare it for Elysia's agentic framework.

### 5. Use Elysia

#### Option A: Web Interface

Start the Elysia web app:

```bash
source .venv-elysia/bin/activate
elysia start
```

Then open `http://localhost:8000` in your browser.

#### Option B: Python API

Use Elysia programmatically:

```bash
source .venv-elysia/bin/activate
python scripts/use-elysia.py
```

Or in your own Python code:

```python
import elysia
from dotenv import load_dotenv

load_dotenv()

tree = elysia.Tree()

# Ask questions about your transcripts
response, objects = tree(
    "What are the main themes discussed in the interviews?",
    collection_names=["Transcript"]
)

print(response)
```

## What Elysia Does

Elysia is an agentic platform that uses a decision tree to:
- Understand your questions about the Transcript collection
- Decide which tools to use (query, aggregate, etc.)
- Retrieve relevant information from Weaviate
- Generate intelligent responses using LLMs

## Troubleshooting

### Python 3.12 Not Found
- Install via Homebrew: `brew install python@3.12`
- Or download from [python.org](https://www.python.org/downloads/)

### Collection Not Found
- Make sure your Weaviate cluster is accessible
- Verify the collection name is "Transcript" (case-sensitive)
- Check your `WEAVIATE_HOST` and `WEAVIATE_API_KEY` in `.env`

### Preprocessing Errors
- Ensure your collection has data
- Check that OpenAI API key is valid
- Verify Weaviate connection settings

### Elysia Timeout Errors
- Some smaller local models may struggle with long context
- Consider using OpenAI models or larger local models
- See [Elysia documentation](https://github.com/weaviate/elysia) for model recommendations

## Resources

- [Elysia GitHub Repository](https://github.com/weaviate/elysia)
- [Elysia Documentation](https://elysia.readthedocs.io/)
- [Elysia Demo](https://elysia.weaviate.io/)

