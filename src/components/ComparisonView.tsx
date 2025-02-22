import { useState, useRef, useEffect } from 'react';
import VideoPlayer from './VideoPlayer';
import { Card } from './ui/card';
import { MuxPlayerElement } from '@mux/mux-player-react';
import { videoData } from '@/data/videos';
import { chapterData } from '@/data/chapters';
import InteractiveTranscript from './InteractiveTranscript';
import VideoChapters from './VideoChapters';

interface ComparisonViewProps {
  interviews: {
    id: string;
    startTime: number;
  }[];
  onClose: () => void;
}

export default function ComparisonView({ interviews, onClose }: ComparisonViewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRefs = useRef<Record<string, MuxPlayerElement | null>>({});

  useEffect(() => {
    // Initialize video refs
    interviews.forEach(interview => {
      videoRefs.current[interview.id] = null;
    });
  }, [interviews]);

  const handlePlayStateChange = (playing: boolean) => {
    setIsPlaying(playing);
  };

  return (
    <div className="fixed inset-0 z-50 bg-white">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="border-b p-4 flex items-center justify-between bg-gray-50">
          <h2 className="text-xl font-bold">Interview Comparison</h2>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-4 p-4" style={{ minWidth: `${interviews.length * 600}px` }}>
            {interviews.map((interview) => {
              const video = videoData[interview.id];
              const chapters = chapterData[interview.id]?.metadata || [];
              const transcriptHtml = typeof video.transcript === 'string' ? video.transcript : '';

              return (
                <div key={interview.id} className="w-[600px] flex-shrink-0">
                  <Card className="p-4">
                    <h3 className="text-lg font-semibold mb-4">{video.title}</h3>
                    <div className="space-y-4">
                      {/* Video Player */}
                      <VideoPlayer
                        ref={(el: MuxPlayerElement | null) => {
                          videoRefs.current[interview.id] = el;
                        }}
                        playbackId={video.id}
                        onPlayStateChange={handlePlayStateChange}
                        chapters={chapters}
                        thumbnail={video.thumbnail}
                        onLoadedMetadata={() => {
                          if (videoRefs.current[interview.id]) {
                            videoRefs.current[interview.id]!.currentTime = interview.startTime;
                          }
                        }}
                      />

                      {/* Chapters and Transcript */}
                      <div className="grid grid-cols-[200px,1fr] gap-4 h-[400px]">
                        <VideoChapters
                          chapters={chapters}
                          videoRef={{ current: videoRefs.current[interview.id] }}
                          isPlaying={isPlaying}
                        />
                        <InteractiveTranscript
                          transcriptHtml={transcriptHtml}
                          videoRef={{ current: videoRefs.current[interview.id] }}
                          isPlaying={isPlaying}
                          chapters={chapters}
                        />
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
} 