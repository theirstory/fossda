import { Button } from "@/components/ui/button";
import { ChevronLeft, Share2 } from "lucide-react";
import Link from "next/link";
import VideoSection from "@/components/VideoSection";
import { getTranscript } from "./transcript";
import { Suspense } from "react";

export default async function VideoPage({ params }: { params: { id: string } }) {
  const transcriptHtml = await getTranscript(params.id);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gray-900 text-white p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">Introduction to FOSSDA</h1>
          </div>
          <Button variant="ghost" size="icon">
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <Suspense fallback={<div>Loading video...</div>}>
          <VideoSection 
            videoId={params.id}
            transcriptHtml={transcriptHtml}
          />
        </Suspense>
      </main>
    </div>
  );
} 