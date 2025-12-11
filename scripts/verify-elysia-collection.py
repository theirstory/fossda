#!/usr/bin/env python3
"""
Verify that the Transcript collection is properly set up for Elysia.
This script checks if the collection exists, is processed, and can be accessed.
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Elysia expects WCD_URL and WCD_API_KEY for Weaviate Cloud
# Map from WEAVIATE_HOST/WEAVIATE_API_KEY if WCD_URL is not set
if not os.getenv('WCD_URL') and os.getenv('WEAVIATE_HOST'):
    weaviate_host = os.getenv('WEAVIATE_HOST')
    if not weaviate_host.startswith('http'):
        weaviate_host = f'https://{weaviate_host}'
    os.environ['WCD_URL'] = weaviate_host

if not os.getenv('WCD_API_KEY') and os.getenv('WEAVIATE_API_KEY'):
    os.environ['WCD_API_KEY'] = os.getenv('WEAVIATE_API_KEY')

if not os.getenv('WEAVIATE_IS_LOCAL'):
    os.environ['WEAVIATE_IS_LOCAL'] = 'False'

try:
    from elysia.util.client import ClientManager
except ImportError:
    print("❌ Elysia is not installed")
    sys.exit(1)

def main():
    """Verify the Transcript collection setup."""
    
    # Validate environment variables
    required_vars = ['WCD_URL', 'WCD_API_KEY']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"❌ Missing required environment variables: {', '.join(missing_vars)}")
        sys.exit(1)
    
    print("🔍 Connecting to Weaviate...")
    print(f"   URL: {os.getenv('WCD_URL')}")
    
    try:
        # Use Elysia's ClientManager to connect
        client_manager = ClientManager()
        
        async def check_collections():
            async with client_manager.connect_to_async_client() as client:
                # Check if Transcript collection exists
                print("\n📊 Checking collections...")
                all_collections = await client.collections.list_all()
                # Filter out Elysia internal collections
                user_collections = [c for c in all_collections if not c.startswith("ELYSIA_")]
                print(f"   Found {len(user_collections)} user collections:")
                for coll in user_collections:
                    print(f"     - {coll}")
                
                if "Transcript" not in all_collections:
                    print("\n❌ Transcript collection not found!")
                    print("   Please make sure your collection is named 'Transcript' in Weaviate.")
                    return
                
                print("\n✅ Transcript collection found!")
                
                # Get collection info
                transcript_collection = client.collections.get("Transcript")
                config = transcript_collection.config.get()
                
                print(f"\n📋 Collection Details:")
                print(f"   Name: Transcript")
                vectorizer_name = "Unknown"
                if hasattr(config, 'vectorizer_config') and config.vectorizer_config:
                    vectorizer_name = config.vectorizer_config.name
                print(f"   Vectorizer: {vectorizer_name}")
                
                # Count objects
                aggregate_result = await transcript_collection.aggregate.over_all(total_count=True)
                total_count = aggregate_result.total_count
                print(f"   Total Objects: {total_count}")
                
                # Check if ELYSIA_METADATA__ collection exists
                print(f"\n🔍 Checking Elysia metadata...")
                if await client.collections.exists("ELYSIA_METADATA__"):
                    print("   ✅ ELYSIA_METADATA__ collection exists")
                    
                    metadata_collection = client.collections.get("ELYSIA_METADATA__")
                    
                    # Check if Transcript is in metadata
                    from weaviate.classes.query import Filter
                    metadata_objects = await metadata_collection.query.fetch_objects(
                        filters=Filter.by_property("name").equal("Transcript"),
                        limit=10
                    )
                    
                    if len(metadata_objects.objects) > 0:
                        print("   ✅ Transcript collection is processed by Elysia")
                        metadata = metadata_objects.objects[0]
                        print(f"   Metadata found:")
                        print(f"     - Name: {metadata.properties.get('name', 'N/A')}")
                        prompts = metadata.properties.get('prompts', [])
                        print(f"     - Prompts: {len(prompts)} prompts")
                    else:
                        print("   ⚠️  Transcript collection is NOT in Elysia metadata")
                        print("   This means the collection needs to be preprocessed.")
                        print("   Run: python scripts/preprocess-elysia.py")
                else:
                    print("   ⚠️  ELYSIA_METADATA__ collection does not exist")
                    print("   This means no collections have been preprocessed yet.")
                    print("   Run: python scripts/preprocess-elysia.py")
        
        import asyncio
        import nest_asyncio
        nest_asyncio.apply()
        
        async def run_check():
            await check_collections()
            await client_manager.close_clients()
        
        asyncio.run(run_check())
        
        print("\n💡 If the web interface still doesn't show the collection:")
        print("   1. Make sure you're using the same Weaviate credentials in the web interface")
        print("   2. Try clicking the refresh button in the Elysia web interface")
        print("   3. Check the Settings page to verify Weaviate connection")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()

