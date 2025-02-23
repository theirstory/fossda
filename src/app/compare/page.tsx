import { Metadata } from 'next';
import ComparisonView from '@/components/ComparisonView';

export const metadata: Metadata = {
  title: 'Compare Interviews - FOSSDA',
  description: 'Compare multiple interviews side by side',
};

export default function ComparePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ComparisonView interviews={[]} onClose={() => {}} />
    </div>
  );
} 