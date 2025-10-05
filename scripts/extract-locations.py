#!/usr/bin/env python3
"""
Extract location mentions from FOSSDA interview transcripts.
Creates a JSON file with locations, their context, and timestamps.
"""

import re
import json
from pathlib import Path
from bs4 import BeautifulSoup
from typing import List, Dict, Tuple

# Common locations to look for (you can expand this list)
# Format: (location_name, case_sensitive, word_boundary_required)
LOCATIONS = [
    # Cities
    ('San Francisco', False, True),
    ('Oakland', False, True),
    ('Berkeley', False, True),
    ('Mountain View', False, True),
    ('Palo Alto', False, True),
    ('Boston', False, True),
    ('Cambridge', False, True),
    ('New York', False, True),
    ('Seattle', False, True),
    ('Portland', False, True),
    ('Austin', False, True),
    ('Chicago', False, True),
    ('Los Angeles', False, True),
    ('San Diego', False, True),
    ('San Jose', False, True),
    ('Paris', False, True),
    ('London', False, True),
    ('Berlin', False, True),
    ('Munich', False, True),
    ('Amsterdam', False, True),
    ('Helsinki', False, True),
    ('Tokyo', False, True),
    ('Beijing', False, True),
    ('Shanghai', False, True),
    ('Bangalore', False, True),
    ('Tel Aviv', False, True),
    ('Toronto', False, True),
    ('Montreal', False, True),
    ('Vancouver', False, True),
    ('Sydney', False, True),
    ('Melbourne', False, True),
    
    # Universities
    ('UC Berkeley', False, True),
    ('Stanford', False, True),
    ('MIT', True, True),  # Case-sensitive to avoid "Mitchell", "admit", etc.
    ('Carnegie Mellon', False, True),
    ('Harvard', False, True),
    ('University of Wisconsin', False, True),
    ('University of California', False, True),
    
    # Regions/States
    ('California', False, True),
    ('Massachusetts', False, True),
    ('Texas', False, True),
    ('Washington', False, True),
    ('Oregon', False, True),
    ('Illinois', False, True),
    ('Colorado', False, True),
    ('Florida', False, True),
    ('Silicon Valley', False, True),
    ('Bay Area', False, True),
    ('East Bay', False, True),
    
    # Countries
    ('United States', False, True),
    ('USA', True, True),  # Case-sensitive acronym
    ('America', False, True),
    ('Canada', False, True),
    ('Mexico', False, True),
    ('England', False, True),
    ('France', False, True),
    ('Germany', False, True),
    ('Italy', False, True),
    ('Spain', False, True),
    ('Netherlands', False, True),
    ('Finland', False, True),
    ('Sweden', False, True),
    ('Norway', False, True),
    ('Denmark', False, True),
    ('Japan', False, True),
    ('China', False, True),
    ('India', False, True),
    ('Israel', False, True),
    ('Australia', False, True),
    
    # Landmarks
    ('Golden Gate Bridge', False, True),
    ('Elba Island', False, True),
]

def extract_text_with_timestamp(span) -> Tuple[str, int]:
    """Extract text and timestamp from a span element."""
    text = span.get_text()
    timestamp_ms = span.get('data-m', 0)
    try:
        timestamp = int(timestamp_ms) / 1000  # Convert to seconds
    except:
        timestamp = 0
    return text, timestamp

def get_context(words: List[Tuple[str, int]], index: int, context_size: int = 15) -> Tuple[str, int]:
    """Get surrounding context for a location mention."""
    start = max(0, index - context_size)
    end = min(len(words), index + context_size + 1)
    
    context_words = words[start:end]
    context_text = ' '.join([w[0] for w in context_words])
    timestamp = words[index][1]
    
    return context_text, timestamp

def extract_locations_from_transcript(html_path: Path, interview_id: str) -> List[Dict]:
    """Extract location mentions from a single transcript."""
    with open(html_path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')
    
    # Extract all words with timestamps
    spans = soup.find_all('span', {'data-m': True})
    words = [extract_text_with_timestamp(span) for span in spans]
    
    # Create full text for searching (preserve original case)
    full_text = ' '.join([w[0] for w in words])
    
    locations_found = []
    seen_positions = set()
    
    # Search for location mentions (longest first to avoid partial matches)
    sorted_locations = sorted(LOCATIONS, key=lambda x: len(x[0]), reverse=True)
    
    for location, case_sensitive, word_boundary in sorted_locations:
        # Build regex pattern
        pattern_str = re.escape(location)
        
        # Add word boundaries if required
        if word_boundary:
            pattern_str = r'\b' + pattern_str + r'\b'
        
        # Compile with appropriate flags
        flags = 0 if case_sensitive else re.IGNORECASE
        pattern = re.compile(pattern_str, flags)
        
        # Find all matches
        for match in pattern.finditer(full_text):
            pos = match.start()
            
            # Skip if we've already found a location at this position
            if pos in seen_positions:
                continue
            
            # Mark this position as seen
            for i in range(pos, match.end()):
                seen_positions.add(i)
            
            # Find the word index for this position
            char_count = 0
            word_index = 0
            for i, (word, _) in enumerate(words):
                if char_count >= pos:
                    word_index = i
                    break
                char_count += len(word) + 1  # +1 for space
            
            context, ts = get_context(words, word_index)
            locations_found.append({
                'location': location,
                'interview_id': interview_id,
                'timestamp': ts,
                'context': context.strip()
            })
    
    return locations_found

def main():
    """Main function to process all transcripts."""
    transcripts_dir = Path(__file__).parent.parent / 'public' / 'transcripts'
    output_file = Path(__file__).parent.parent / 'src' / 'data' / 'locations.json'
    
    all_locations = []
    
    # Process each HTML transcript
    for html_file in transcripts_dir.glob('*.html'):
        interview_id = html_file.stem
        print(f"Processing {interview_id}...")
        
        locations = extract_locations_from_transcript(html_file, interview_id)
        all_locations.extend(locations)
        print(f"  Found {len(locations)} location mentions")
    
    # Remove duplicates (same location, interview, and timestamp)
    unique_locations = []
    seen = set()
    for loc in all_locations:
        key = (loc['location'], loc['interview_id'], loc['timestamp'])
        if key not in seen:
            seen.add(key)
            unique_locations.append(loc)
    
    # Save to JSON
    output_file.parent.mkdir(parents=True, exist_ok=True)
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(unique_locations, f, indent=2, ensure_ascii=False)
    
    print(f"\nExtracted {len(unique_locations)} unique location mentions")
    print(f"Saved to {output_file}")
    
    # Print summary
    location_counts = {}
    for loc in unique_locations:
        location_counts[loc['location']] = location_counts.get(loc['location'], 0) + 1
    
    print("\nTop 10 most mentioned locations:")
    for location, count in sorted(location_counts.items(), key=lambda x: x[1], reverse=True)[:10]:
        print(f"  {location}: {count} mentions")

if __name__ == '__main__':
    main()
