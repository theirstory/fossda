import InterviewDurationChart from '@/components/visualizations/InterviewDurationChart';
import KeywordFrequencyChart from '@/components/visualizations/KeywordFrequencyChart';
import TopicDistributionChart from '@/components/visualizations/TopicDistributionChart';

export const metadata = {
  title: 'Data Visualizations - FOSSDA',
  description: 'Explore visualizations of the FOSSDA interview collection',
};

export default function VisualizationsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
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
              Data Visualizations
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Explore the FOSSDA interview collection through interactive data visualizations
            </p>
          </div>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="space-y-8">
          {/* Interview Durations */}
          <InterviewDurationChart />

          {/* Keyword Distribution */}
          <KeywordFrequencyChart />

          {/* Topic Distribution */}
          <TopicDistributionChart />

          {/* Coming Soon Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">More Visualizations Coming Soon</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">Timeline View</h3>
                <p className="text-sm text-gray-600">
                  Chronological timeline of all interviews
                </p>
              </div>
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">Topic Network</h3>
                <p className="text-sm text-gray-600">
                  Connections between themes and speakers
                </p>
              </div>
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">Word Cloud</h3>
                <p className="text-sm text-gray-600">
                  Most frequently mentioned terms
                </p>
              </div>
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">Chapter Analysis</h3>
                <p className="text-sm text-gray-600">
                  Distribution of topics across interview chapters
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}