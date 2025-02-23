import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compare Interviews - FOSSDA',
  description: 'Compare multiple interviews side by side',
};

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 