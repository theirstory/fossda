import { Suspense } from 'react';
import AskFormElysia from '@/components/AskFormElysia';

export default function AskElysiaPage() {
  return (
    <div className="h-[calc(100vh-4rem)]">
      <Suspense fallback={
        <div className="flex items-center justify-center h-full text-center">
          <div>
            <h1 className="text-4xl font-bold mb-4">Ask the Archive (Elysia)</h1>
            <p className="text-lg text-gray-600">Loading...</p>
          </div>
        </div>
      }>
        <AskFormElysia />
      </Suspense>
    </div>
  );
}

