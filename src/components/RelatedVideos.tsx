import { Badge } from "@/components/ui/badge";
import { videoData } from "@/data/videos";
import Image from "next/image";
import Link from "next/link";

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
    <div className="p-4 space-y-4">
      {relatedVideos.map((video) => (
        <Link 
          key={video.id}
          href={`/video/${video.id}`}
          className="group bg-gray-50 rounded-lg overflow-hidden transform transition duration-300 hover:shadow-lg block"
        >
          <div className="flex gap-6 p-4">
            <div className="relative w-48 flex-shrink-0">
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <Image
                  src={video.thumbnail}
                  alt={video.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute bottom-2 right-2">
                  <Badge variant="secondary" className="bg-black/70 text-white border-0">
                    {video.duration}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-0 py-1">
              <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                {video.title}
              </h3>
              <div className="text-sm text-gray-500 mb-2">
                Full Interview
              </div>
              <p className="text-gray-600 text-sm line-clamp-2">
                {video.sentence}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
} 