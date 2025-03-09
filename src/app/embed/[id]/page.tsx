import { promises as fs } from 'fs';
import path from 'path';
import EmbedPageClient from './EmbedPageClient';

interface EmbedPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EmbedPage({ params }: EmbedPageProps) {
  const resolvedParams = await params;
  const videoId = resolvedParams.id;
  
  const transcriptPath = path.join(process.cwd(), 'public', 'transcripts', `${videoId}.html`);
  const transcriptHtml = await fs.readFile(transcriptPath, 'utf-8');

  return <EmbedPageClient params={params} transcriptHtml={transcriptHtml} />;
} 