#!/usr/bin/env python3
"""
Preprocess the Transcript collection for Elysia.
This script connects to your Weaviate cluster and preprocesses the collection
so it can be used with Elysia's agentic framework.
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Elysia expects WCD_URL and WCD_API_KEY for Weaviate Cloud
# Map from WEAVIATE_HOST/WEAVIATE_API_KEY if WCD_URL is not set
# IMPORTANT: Do this BEFORE importing Elysia modules
if not os.getenv('WCD_URL') and os.getenv('WEAVIATE_HOST'):
    weaviate_host = os.getenv('WEAVIATE_HOST')
    # Ensure it starts with https:// if not already
    if not weaviate_host.startswith('http'):
        weaviate_host = f'https://{weaviate_host}'
    os.environ['WCD_URL'] = weaviate_host

if not os.getenv('WCD_API_KEY') and os.getenv('WEAVIATE_API_KEY'):
    os.environ['WCD_API_KEY'] = os.getenv('WEAVIATE_API_KEY')

# Set WEAVIATE_IS_LOCAL if not set (assume cloud if using WCD_URL)
if not os.getenv('WEAVIATE_IS_LOCAL'):
    os.environ['WEAVIATE_IS_LOCAL'] = 'False'

# Check if elysia is installed
try:
    from elysia.preprocessing.collection import preprocess
except ImportError:
    print("❌ Elysia is not installed. Please run:")
    print("   source .venv-elysia/bin/activate")
    print("   pip install elysia-ai")
    sys.exit(1)

def main():
    """Preprocess the Transcript collection for Elysia."""
    
    # Validate environment variables
    required_vars = ['WCD_URL', 'WCD_API_KEY', 'OPENAI_API_KEY']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"❌ Missing required environment variables: {', '.join(missing_vars)}")
        print("Please make sure your .env file contains:")
        print("  - WCD_URL (or WEAVIATE_HOST)")
        print("  - WCD_API_KEY (or WEAVIATE_API_KEY)")
        print("  - OPENAI_API_KEY")
        sys.exit(1)
    
    print("🔍 Connecting to Weaviate...")
    print(f"   URL: {os.getenv('WCD_URL')}")
    print(f"   API Key: {'*' * 20}...{os.getenv('WCD_API_KEY')[-4:] if len(os.getenv('WCD_API_KEY', '')) > 4 else '****'}")
    
    # The collection name from your codebase
    collection_name = "Transcript"
    
    print(f"📊 Preprocessing collection: {collection_name}")
    print("   This may take a few minutes depending on the size of your collection...")
    
    try:
        preprocess(collection_names=[collection_name])
        print(f"✅ Successfully preprocessed {collection_name} collection!")
        print("")
        print("🎉 Your collection is now ready to use with Elysia!")
        print("")
        print("You can now:")
        print("1. Start the Elysia app: elysia start")
        print("2. Or use it in Python (see scripts/use-elysia.py)")
    except Exception as e:
        print(f"❌ Error preprocessing collection: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

