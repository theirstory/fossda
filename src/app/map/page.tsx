import MapView from '@/components/MapView';
import LocationsList from '@/components/LocationsList';

export const metadata = {
  title: 'Geographic Map - FOSSDA',
  description: 'Explore locations mentioned in FOSSDA interviews on an interactive map',
};

export default function MapPage() {
  return (
    <main className="min-h-screen bg-gray-50 relative z-0">
      {/* Hero Section */}
      <div className="relative bg-gray-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '30px 30px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-4">
              Geographic Map of Interviews
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Explore locations mentioned in FOSSDA interviews. Click on markers to see excerpts and jump to those moments in the interviews.
            </p>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <MapView />
        </div>

        {/* Locations List */}
        <LocationsList />
      </div>
    </main>
  );
}
