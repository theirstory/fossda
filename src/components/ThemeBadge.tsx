"use client";

import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Theme } from "@/data/themes";

interface ThemeBadgeProps {
  theme: Theme;
  size?: "default" | "small";
}

export default function ThemeBadge({ theme, size = "default" }: ThemeBadgeProps) {
  return (
    <Link 
      href={`/theme/${theme.id}`}
      onClick={(e) => e.stopPropagation()}
    >
      <Badge 
        variant="outline"
        className={cn(
          "transition-colors",
          size === "small" && "text-[10px] px-1 py-0",
          theme.color.replace('hover:', ''),
          "hover:border-transparent"
        )}
      >
        {theme.title}
      </Badge>
    </Link>
  );
} 