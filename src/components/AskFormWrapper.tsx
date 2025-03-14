"use client";

import dynamic from 'next/dynamic';

const AskForm = dynamic(() => import('@/components/AskForm'), {
  ssr: false
});

export default function AskFormWrapper() {
  return <AskForm />;
} 