import os
import json
import spacy
from bs4 import BeautifulSoup
from typing import List, Dict, Any

class TranscriptProcessor:
    def __init__(self, transcripts_dir: str):
        self.transcripts_dir = transcripts_dir
        # Load English language model
        self.nlp = spacy.load("en_core_web_sm")

    def get_transcript_files(self) -> List[str]:
        """Get list of HTML transcript files"""
        return [f for f in os.listdir(self.transcripts_dir) 
                if f.endswith('.html')]

    def extract_text_from_html(self, html_file: str) -> List[Dict[str, str]]:
        """Extract text and speaker info from HTML transcript"""
        with open(os.path.join(self.transcripts_dir, html_file), 'r') as f:
            soup = BeautifulSoup(f.read(), 'html.parser')

        segments = []
        current_speaker = None
        current_text = []

        for span in soup.find_all('span'):
            if 'class' in span.attrs and 'speaker' in span['class']:
                # If we have accumulated text from previous speaker, save it
                if current_speaker and current_text:
                    segments.append({
                        'speaker': current_speaker,
                        'text': ' '.join(current_text)
                    })
                    current_text = []
                
                current_speaker = span.text.strip().rstrip(':')
            else:
                if current_speaker:
                    current_text.append(span.text.strip())

        # Add final segment
        if current_speaker and current_text:
            segments.append({
                'speaker': current_speaker,
                'text': ' '.join(current_text)
            })

        return segments

    def process_transcript(self, html_file: str) -> Dict[str, Any]:
        """Process a single transcript file"""
        print(f"Processing {html_file}...")
        
        # Extract text segments
        segments = self.extract_text_from_html(html_file)
        
        # Combine all text for entity extraction
        full_text = ' '.join(seg['text'] for seg in segments)
        
        # Process text with spaCy
        doc = self.nlp(full_text)
        
        # Extract entities
        entities = {
            'PERSON': [],
            'ORG': [],
            'GPE': [],  # Countries, cities, states
            'DATE': [],
            'PRODUCT': [],
            'EVENT': []
        }
        
        for ent in doc.ents:
            if ent.label_ in entities:
                # Only add unique entities
                if ent.text not in entities[ent.label_]:
                    entities[ent.label_].append(ent.text)
        
        return {
            'segments': segments,
            'entities': entities
        }

    def process_all_transcripts(self) -> Dict[str, Any]:
        """Process all transcript files in directory"""
        results = {}
        
        for html_file in self.get_transcript_files():
            video_id = html_file.replace('.html', '')
            results[video_id] = self.process_transcript(html_file)
            
        return results

    def save_results(self, results: Dict[str, Any], output_file: str):
        """Save processed results to JSON file"""
        with open(output_file, 'w') as f:
            json.dump(results, f, indent=2)

def main():
    # Initialize processor
    processor = TranscriptProcessor('public/transcripts')
    
    # Process all transcripts
    results = processor.process_all_transcripts()
    
    # Save results
    processor.save_results(results, 'public/processed_transcripts.json')
    
    print("Processing complete! Results saved to processed_transcripts.json")

if __name__ == "__main__":
    main() 