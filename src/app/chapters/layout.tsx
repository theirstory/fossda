import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Interview Chapters - FOSSDA',
  description: 'Browse through all interview segments and chapters in the FOSSDA archive.',
};

export default function ChaptersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 