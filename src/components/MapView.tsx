"use client";

import dynamic from 'next/dynamic';

// Dynamically import the map component to avoid SSR issues with Leaflet
const InterviewMap = dynamic(() => import('@/components/InterviewMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Loading map...</p>
    </div>
  ),
});

export default function MapView() {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Interactive Location Map</h2>
        <p className="text-gray-600">
          This map shows all locations mentioned across the FOSSDA interview collection. 
          Each marker represents a place discussed in one or more interviews. 
          Click on any marker to see the context and jump directly to that moment in the video.
        </p>
      </div>
      
      <InterviewMap />
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-1">📍 Click Markers</h3>
          <p className="text-blue-700">
            Click any marker to see interview excerpts mentioning that location
          </p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-1">🎬 Jump to Video</h3>
          <p className="text-green-700">
            Click on an excerpt to jump directly to that moment in the interview
          </p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <h3 className="font-semibold text-purple-900 mb-1">🗺️ Explore</h3>
          <p className="text-purple-700">
            Zoom and pan to explore different regions and their connections to open source history
          </p>
        </div>
      </div>
    </>
  );
}
