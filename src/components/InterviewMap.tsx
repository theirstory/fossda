"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { locationCoordinates } from '@/data/locationCoordinates';
import { videoData } from '@/data/videos';
import Link from 'next/link';

// Fix for default marker icon in Next.js
import L from 'leaflet';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationMention {
  location: string;
  interview_id: string;
  timestamp: number;
  context: string;
}

interface GroupedLocation {
  location: string;
  coordinates: [number, number];
  mentions: LocationMention[];
}

// Component to fit bounds after markers are loaded
function FitBounds({ bounds }: { bounds: LatLngBounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
}

export default function InterviewMap() {
  const [locations, setLocations] = useState<GroupedLocation[]>([]);
  const [mounted, setMounted] = useState(false);
  const [bounds, setBounds] = useState<LatLngBounds>(new LatLngBounds([]));

  useEffect(() => {
    setMounted(true);
    
    // Load locations data
    fetch('/locations.json')
      .then(res => res.json())
      .then((data: LocationMention[]) => {
        // Group mentions by location
        const grouped: Record<string, LocationMention[]> = {};
        data.forEach(mention => {
          if (!grouped[mention.location]) {
            grouped[mention.location] = [];
          }
          grouped[mention.location].push(mention);
        });

        // Convert to array with coordinates
        const locationsWithCoords: GroupedLocation[] = [];
        const newBounds = new LatLngBounds([]);
        
        Object.entries(grouped).forEach(([location, mentions]) => {
          const coords = locationCoordinates[location];
          if (coords) {
            locationsWithCoords.push({
              location,
              coordinates: coords,
              mentions
            });
            newBounds.extend(coords);
          }
        });

        setLocations(locationsWithCoords);
        setBounds(newBounds);
      })
      .catch(err => console.error('Error loading locations:', err));
  }, []);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (!mounted) {
    return (
      <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={[37.8715, -122.2730]} // Default to Berkeley
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {bounds.isValid() && <FitBounds bounds={bounds} />}
        
        {locations.map((loc, idx) => (
          <Marker key={idx} position={loc.coordinates}>
            <Popup maxWidth={400} maxHeight={300}>
              <div className="p-2">
                <h3 className="font-bold text-lg mb-2">{loc.location}</h3>
                <p className="text-sm text-gray-600 mb-3">
                  {loc.mentions.length} mention{loc.mentions.length !== 1 ? 's' : ''} across interviews
                </p>
                
                <div className="max-h-60 overflow-y-auto space-y-3">
                  {loc.mentions.slice(0, 5).map((mention, mIdx) => {
                    const video = videoData[mention.interview_id as keyof typeof videoData];
                    return (
                      <div key={mIdx} className="border-l-2 border-blue-500 pl-3 py-1">
                        <Link
                          href={`/video/${mention.interview_id}?start=${Math.floor(mention.timestamp)}`}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm block mb-1"
                        >
                          {video?.title || mention.interview_id}
                        </Link>
                        <p className="text-xs text-gray-500 mb-1">
                          at {formatTime(mention.timestamp)}
                        </p>
                        <p className="text-xs text-gray-700 italic line-clamp-2">
                          &quot;{mention.context}&quot;
                        </p>
                      </div>
                    );
                  })}
                  {loc.mentions.length > 5 && (
                    <p className="text-xs text-gray-500 italic">
                      ...and {loc.mentions.length - 5} more mentions
                    </p>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
