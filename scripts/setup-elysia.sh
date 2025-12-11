#!/bin/bash

# Setup script for Elysia with Weaviate
# This script helps set up Elysia to work with your Transcript collection

echo "🚀 Setting up Elysia for your Weaviate collection..."

# Check if Python 3.12 is installed
if ! command -v python3.12 &> /dev/null; then
    echo "❌ Python 3.12 is required but not found."
    echo "📦 Installing Python 3.12 via Homebrew..."
    
    if command -v brew &> /dev/null; then
        brew install python@3.12
    else
        echo "❌ Homebrew not found. Please install Python 3.12 manually:"
        echo "   Visit: https://www.python.org/downloads/"
        exit 1
    fi
fi

echo "✅ Python 3.12 found"

# Create virtual environment
echo "📦 Creating virtual environment..."
python3.12 -m venv .venv-elysia

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source .venv-elysia/bin/activate

# Install Elysia
echo "📥 Installing Elysia..."
pip install elysia-ai

echo ""
echo "✅ Elysia installation complete!"
echo ""
echo "📝 Next steps:"
echo "1. Make sure your .env file has the following variables:"
echo "   - WEAVIATE_HOST"
echo "   - WEAVIATE_API_KEY"
echo "   - OPENAI_API_KEY"
echo "   - OPENAI_ORG_ID (optional)"
echo ""
echo "2. Run the preprocessing script to prepare your Transcript collection:"
echo "   source .venv-elysia/bin/activate"
echo "   python scripts/preprocess-elysia.py"
echo ""
echo "3. Start Elysia:"
echo "   source .venv-elysia/bin/activate"
echo "   elysia start"
echo ""
echo "   Or use it in Python:"
echo "   python scripts/use-elysia.py"

