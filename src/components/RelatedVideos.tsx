import VideoCard from "@/components/VideoCard";
import { videoData } from "@/data/videos";

interface RelatedVideosProps {
  currentVideoId: string;
}

export default function RelatedVideos({ currentVideoId }: RelatedVideosProps) {
  // Filter out the current video and convert to array
  const relatedVideos = Object.values(videoData).filter(video => video.id !== currentVideoId);

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-4">
        {relatedVideos.map((video) => (
          <VideoCard
            key={video.id}
            {...video}
            description={video.sentence}
            className="h-auto"
            isCompact
          />
        ))}
      </div>
    </div>
  );
} 