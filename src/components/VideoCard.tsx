import { Card } from "@/components/ui/card";
import { PlayCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface VideoCardProps {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  description: string;
  className?: string;
  isHero?: boolean;
  isCompact?: boolean;
}

export default function VideoCard({ 
  id, 
  title, 
  duration, 
  thumbnail, 
  description,
  className,
  isHero,
  isCompact
}: VideoCardProps) {
  return (
    <Link href={`/video/${id}`} className="block">
      <Card className={cn(
        "overflow-hidden group cursor-pointer transition-all hover:shadow-lg",
        isHero && "bg-gray-900",
        isCompact && "bg-gray-50",
        className
      )}>
        <div className={cn(
          "relative aspect-video",
          isHero && "aspect-[16/9]",
          isCompact && "aspect-[2/1]"
        )}>
          <Image
            src={thumbnail}
            alt={title}
            fill
            sizes={isHero ? "100vw" : "(max-width: 768px) 100vw, 33vw"}
            priority={isHero}
            className={cn(
              "object-cover",
              isHero && "object-contain bg-black"
            )}
          />
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <PlayCircle className={cn(
              "w-12 h-12 text-white",
              isHero && "w-16 h-16",
              isCompact && "w-8 h-8"
            )} />
          </div>
          <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-white text-sm">
            {duration}
          </div>
        </div>
        <div className={cn(
          "p-4",
          isHero && "text-white p-6",
          isCompact && "p-3"
        )}>
          <h3 className={cn(
            "font-semibold mb-2",
            isHero && "text-lg",
            isCompact && "text-base mb-1"
          )}>{title}</h3>
          <p className={cn(
            "text-sm text-gray-600",
            isHero && "text-gray-300",
            isCompact && "text-xs"
          )}>{description}</p>
        </div>
      </Card>
    </Link>
  );
} 