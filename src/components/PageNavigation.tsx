"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, Home } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PageNavigation() {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2 mb-4">
      <Button 
        variant="ghost" 
        size="sm" 
        className="gap-2"
        onClick={() => router.back()}
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </Button>

      <Link href="/">
        <Button variant="ghost" size="sm" className="gap-2">
          <Home className="h-4 w-4" />
          Home
        </Button>
      </Link>
    </div>
  );
} 