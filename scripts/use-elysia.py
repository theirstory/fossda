#!/usr/bin/env python3
"""
Example script showing how to use Elysia with your Transcript collection.
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Check if elysia is installed
try:
    import elysia
except ImportError:
    print("❌ Elysia is not installed. Please run:")
    print("   source .venv-elysia/bin/activate")
    print("   pip install elysia-ai")
    sys.exit(1)

def main():
    """Example usage of Elysia with the Transcript collection."""
    
    # Elysia expects WCD_URL and WCD_API_KEY for Weaviate Cloud
    # Map from WEAVIATE_HOST/WEAVIATE_API_KEY if WCD_URL is not set
    if not os.getenv('WCD_URL') and os.getenv('WEAVIATE_HOST'):
        weaviate_host = os.getenv('WEAVIATE_HOST')
        # Ensure it starts with https:// if not already
        if not weaviate_host.startswith('http'):
            weaviate_host = f'https://{weaviate_host}'
        os.environ['WCD_URL'] = weaviate_host
    
    if not os.getenv('WCD_API_KEY') and os.getenv('WEAVIATE_API_KEY'):
        os.environ['WCD_API_KEY'] = os.getenv('WEAVIATE_API_KEY')
    
    # Set WEAVIATE_IS_LOCAL if not set
    if not os.getenv('WEAVIATE_IS_LOCAL'):
        os.environ['WEAVIATE_IS_LOCAL'] = 'False'
    
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
    
    print("🌳 Initializing Elysia Tree...")
    tree = elysia.Tree()
    
    # Example queries you can ask about your transcripts
    example_queries = [
        "What are the main themes discussed in the interviews?",
        "What did the speakers say about open source philosophy?",
        "What challenges did they mention?",
        "What are the 10 most interesting quotes about community?",
    ]
    
    print("\n📝 Example queries you can ask:")
    for i, query in enumerate(example_queries, 1):
        print(f"   {i}. {query}")
    
    print("\n💡 Try asking a question about your transcripts:")
    print("   (Type 'exit' to quit)")
    print()
    
    while True:
        try:
            question = input("❓ Your question: ").strip()
            
            if question.lower() in ['exit', 'quit', 'q']:
                print("👋 Goodbye!")
                break
            
            if not question:
                continue
            
            print("\n🤔 Thinking...")
            
            # Query Elysia with your Transcript collection
            response, objects = tree(
                question,
                collection_names=["Transcript"]
            )
            
            print(f"\n💬 Response:\n{response}\n")
            
            if objects:
                print(f"📚 Found {len(objects)} relevant objects\n")
            
        except KeyboardInterrupt:
            print("\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"❌ Error: {e}")
            print("Please make sure:")
            print("1. Your Weaviate cluster is accessible")
            print("2. The Transcript collection has been preprocessed (run preprocess-elysia.py)")
            print("3. Your environment variables are set correctly")

if __name__ == "__main__":
    main()

