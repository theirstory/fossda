"use client";

import ComparisonView from '@/components/ComparisonView';
import { useRouter } from 'next/navigation';

export default function ComparePage() {
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ComparisonView interviews={[]} onClose={handleClose} />
    </div>
  );
} 