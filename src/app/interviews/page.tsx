import { videoData } from "@/data/videos";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight } from "lucide-react";

export default function InterviewsPage() {
  return (
    <main>
      {/* Hero Section */}
      <div className="relative bg-gray-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '30px 30px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              FOSSDA Interviews
            </h1>
            <p className="mt-4 text-xl text-gray-300 max-w-3xl mx-auto">
              Explore in-depth conversations with pioneers and leaders of the open source movement.
              Each interview captures unique perspectives and experiences that shaped the world of software.
            </p>
          </div>
        </div>
      </div>

      {/* Interviews Grid */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Object.values(videoData).map((interview) => (
              <Card key={interview.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <Link href={`/video/${interview.id}`}>
                  <div className="relative aspect-video">
                    <Image
                      src={interview.thumbnail}
                      alt={interview.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-4 right-4">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {interview.duration}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                      {interview.title}
                    </h2>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {interview.summary}
                    </p>
                    <div className="flex items-center text-blue-600 font-medium">
                      Watch Interview
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
} 