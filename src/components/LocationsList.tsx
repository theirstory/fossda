"use client";

import { useEffect, useState } from 'react';
import { locationCoordinates } from '@/data/locationCoordinates';
import LocationDetailsModal from './LocationDetailsModal';

interface LocationMention {
  location: string;
  interview_id: string;
  timestamp: number;
  context: string;
}

interface LocationCount {
  location: string;
  count: number;
  hasCoordinates: boolean;
}

type SortField = 'name' | 'count';
type SortOrder = 'asc' | 'desc';

export default function LocationsList() {
  const [locations, setLocations] = useState<LocationCount[]>([]);
  const [sortField, setSortField] = useState<SortField>('count');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Load locations data
    fetch('/locations.json')
      .then(res => res.json())
      .then((data: LocationMention[]) => {
        // Count mentions per location
        const counts: Record<string, number> = {};
        data.forEach(mention => {
          counts[mention.location] = (counts[mention.location] || 0) + 1;
        });

        // Convert to array
        const locationArray: LocationCount[] = Object.entries(counts).map(([location, count]) => ({
          location,
          count,
          hasCoordinates: !!locationCoordinates[location]
        }));

        setLocations(locationArray);
      })
      .catch(err => console.error('Error loading locations:', err));
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle order if clicking same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to descending for new field
      setSortField(field);
      setSortOrder(field === 'count' ? 'desc' : 'asc');
    }
  };

  const filteredAndSortedLocations = locations
    .filter(loc => 
      searchQuery === '' || 
      loc.location.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.location.localeCompare(b.location);
      } else {
        comparison = a.count - b.count;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const totalMentions = locations.reduce((sum, loc) => sum + loc.count, 0);

  const handleLocationClick = (location: string) => {
    setSelectedLocation(location);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLocation(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">All Locations</h2>
        <p className="text-gray-600 mb-4">
          Complete list of all locations mentioned in the interviews
        </p>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{locations.length}</div>
            <div className="text-xs text-gray-600">Unique Locations</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{totalMentions}</div>
            <div className="text-xs text-gray-600">Total Mentions</div>
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search locations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-4">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
                >
                  Location
                  {sortField === 'name' && (
                    <span className="text-blue-600">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              </th>
              <th className="text-right py-3 px-4">
                <button
                  onClick={() => handleSort('count')}
                  className="flex items-center justify-end gap-2 font-semibold text-gray-700 hover:text-gray-900 ml-auto"
                >
                  Mentions
                  {sortField === 'count' && (
                    <span className="text-blue-600">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedLocations.map((loc, idx) => (
              <tr 
                key={idx} 
                className="border-b border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer"
                onClick={() => handleLocationClick(loc.location)}
              >
                <td className="py-3 px-4">
                  <span className="font-medium text-gray-900">{loc.location}</span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="inline-flex items-center justify-center min-w-[2.5rem] px-2 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                    {loc.count}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSortedLocations.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No locations found matching &quot;{searchQuery}&quot;
        </div>
      )}

      {searchQuery === '' && (
        <div className="mt-4 text-sm text-gray-500">
          Showing {filteredAndSortedLocations.length} locations
        </div>
      )}

      {/* Modal */}
      <LocationDetailsModal
        location={selectedLocation || ''}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
