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
    <div className="space-y-2 sm:space-y-4">
      {relatedVideos.map((video) => (
        <Link 
          key={video.id}
          href={`/video/${video.id}`}
          className="group bg-gray-50 rounded-lg overflow-hidden transform transition duration-300 hover:shadow-lg block"
        >
          <div className="flex gap-3 p-2 lg:p-4">
            <div className="relative w-32 lg:w-48 flex-shrink-0">
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <Image
                  src={video.thumbnail}
                  alt={video.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute bottom-1 right-1 lg:bottom-2 lg:right-2">
                  <Badge variant="secondary" className="bg-black/70 text-white border-0 text-xs">
                    {video.duration}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm lg:text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                {video.title}
              </h3>
              <div className="text-xs lg:text-sm text-gray-500 mb-1 lg:mb-2">
                Full Interview
              </div>
              <p className="text-xs lg:text-sm text-gray-600 line-clamp-2">
                {video.sentence}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
} 