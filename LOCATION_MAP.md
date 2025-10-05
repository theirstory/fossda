# FOSSDA Geographic Location Map

An interactive map showing all locations mentioned in FOSSDA interviews, with the ability to click on excerpts and jump directly to those moments in the videos.

## Features

### 🗺️ Interactive Map
- **543 location mentions** extracted from 15 interviews
- **Leaflet-based** open-source mapping library
- **Clustered markers** for locations mentioned multiple times
- **Responsive design** works on desktop and mobile

### 📍 Location Extraction
- Automated Python script extracts location mentions from HTML transcripts
- Captures surrounding context (±15 words)
- Preserves timestamps for video linking
- Handles multi-word locations (e.g., "San Francisco", "UC Berkeley")

### 🎬 Video Integration
- Click on any excerpt to jump directly to that moment in the interview
- Timestamps preserved with millisecond accuracy
- Context shows what was being discussed when the location was mentioned

## Top Locations Mentioned

1. **Berkeley** - 133 mentions
2. **MIT** - 108 mentions  
3. **California** - 43 mentions
4. **USA** - 35 mentions
5. **Stanford** - 32 mentions
6. **America** - 23 mentions
7. **Italy** - 16 mentions
8. **China** - 16 mentions
9. **Massachusetts** - 13 mentions
10. **Paris** - 10 mentions

## Technical Implementation

### Location Extraction Script

**File**: `scripts/extract-locations.py`

```python
# Extracts locations from HTML transcripts
# Outputs: src/data/locations.json
python3 scripts/extract-locations.py
```

**Process**:
1. Parses HTML transcripts using BeautifulSoup
2. Searches for predefined location names
3. Extracts surrounding context (15 words before/after)
4. Captures timestamp from `data-m` attribute
5. Outputs JSON with location, interview_id, timestamp, context

### Geocoding

**File**: `src/data/locationCoordinates.ts`

- Manual mapping of location names to [latitude, longitude] coordinates
- Covers ~90 locations including cities, universities, regions, countries
- Easy to extend with new locations

### Map Component

**File**: `src/components/InterviewMap.tsx`

- React-Leaflet wrapper component
- Loads location data from `/locations.json`
- Groups mentions by location
- Creates markers with popups showing:
  - Location name
  - Number of mentions
  - Up to 5 excerpts with context
  - Links to jump to video timestamp

### Map Page

**File**: `src/app/map/page.tsx`

- Full-page map view
- Dynamic import to avoid SSR issues with Leaflet
- Hero section with description
- Statistics panel
- Usage instructions

## Usage

### Viewing the Map

Navigate to `/map` to see the interactive location map.

### Adding New Locations

1. **Add to location list** in `scripts/extract-locations.py`:
   ```python
   LOCATIONS = {
       'Your New Location',
       # ... existing locations
   }
   ```

2. **Add coordinates** in `src/data/locationCoordinates.ts`:
   ```typescript
   'Your New Location': [latitude, longitude],
   ```

3. **Re-run extraction**:
   ```bash
   python3 scripts/extract-locations.py
   cp src/data/locations.json public/locations.json
   ```

### Customizing the Map

**Change map style**:
```typescript
// In InterviewMap.tsx
<TileLayer
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  // Change to different tile provider
/>
```

**Adjust marker clustering**:
```typescript
// Modify popup maxHeight/maxWidth
<Popup maxWidth={400} maxHeight={300}>
```

**Change default view**:
```typescript
<MapContainer
  center={[37.8715, -122.2730]} // Change center
  zoom={2} // Change zoom level
/>
```

## Data Structure

### locations.json
```json
[
  {
    "location": "Berkeley",
    "interview_id": "cat-allman",
    "timestamp": 12345.67,
    "context": "...surrounding text with location mention..."
  }
]
```

### locationCoordinates.ts
```typescript
{
  "Berkeley": [37.8715, -122.2730],
  "MIT": [42.3601, -71.0942]
}
```

## Dependencies

- `leaflet` - Open-source mapping library
- `react-leaflet` - React wrapper for Leaflet
- `beautifulsoup4` (Python) - HTML parsing for extraction

## Future Enhancements

1. **Marker Clustering** - Group nearby markers at low zoom levels
2. **Heat Map View** - Show density of mentions
3. **Timeline Filter** - Filter by interview date
4. **Speaker Filter** - Show only locations mentioned by specific speakers
5. **Route Visualization** - Show connections between locations
6. **Search Functionality** - Search for specific locations
7. **Export Data** - Download location data as CSV/JSON
8. **NLP Enhancement** - Use NER (Named Entity Recognition) for better location extraction

## Accessibility

- Keyboard navigation supported
- Screen reader friendly popups
- High contrast markers
- Descriptive alt text and labels

## Performance

- Lazy loading with dynamic import
- Efficient marker rendering
- Optimized popup content
- Responsive image loading

## License

Part of the FOSSDA Gallery project.
