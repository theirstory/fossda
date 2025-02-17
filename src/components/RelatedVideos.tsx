import VideoCard from "@/components/VideoCard";
import { videoData } from "@/data/videos";

interface RelatedVideosProps {
  currentVideoId: string;
}

export default function RelatedVideos({ currentVideoId }: RelatedVideosProps) {
  // Get all videos except the current one
  const otherVideos = Object.values(videoData).filter(video => video.id !== currentVideoId);
  
  // Separate intro video from other videos
  const introVideo = otherVideos.find(video => video.id === "introduction-to-fossda");
  const mainVideos = otherVideos.filter(video => video.id !== "introduction-to-fossda");
  
  // Combine arrays with intro at the end
  const relatedVideos = [...mainVideos];
  if (introVideo && currentVideoId !== "introduction-to-fossda") {
    relatedVideos.push(introVideo);
  }

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