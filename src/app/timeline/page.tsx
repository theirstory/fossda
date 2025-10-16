import { Metadata } from 'next';
import OpenSourceTimeline from '@/components/OpenSourceTimeline';

export const metadata: Metadata = {
  title: 'Open Source Timeline - FOSSDA',
  description: 'Explore the history of the open source software movement through key events and personal stories',
};

export default function TimelinePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Open Source Timeline
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Explore the history of the open source software movement from the 1960s to today. 
            Each milestone is connected to personal stories and moments from the FOSSDA interviews.
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <OpenSourceTimeline />
      </div>
    </main>
  );
}