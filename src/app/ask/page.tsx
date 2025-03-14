import { Suspense } from 'react';
import AskFormWrapper from '@/components/AskFormWrapper';

export default function AskPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Ask the Archive</h1>
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    }>
      <AskFormWrapper />
    </Suspense>
  );
} 