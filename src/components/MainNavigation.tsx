"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { themes } from "@/data/themes";
import { useEffect, useState } from "react";
import Image from "next/image";
import SearchClips from "./SearchClips";
import { iconMap } from "@/data/icons";
import React from "react";

export default function MainNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle mounting state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if we can go back whenever the pathname changes
  useEffect(() => {
    if (mounted) {
      setCanGoBack(window.history.length > 1 && pathname !== '/');
    }
  }, [pathname, mounted]);

  return (
    <div className="sticky top-0 z-50 bg-white border-b">
      <nav className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left Section - Logo, Back Button, and Search */}
          <div className="flex items-center gap-4 flex-1">
            {/* Logo */}
            <Link href="/" className="text-lg font-bold flex items-center gap-2 shrink-0">
              <Image
                src="/images/logo.png"
                alt="FOSSDA Logo"
                width={77}
                height={39}
                className="w-[77px] h-auto"
              />
              FOSSDA
            </Link>

            {/* Back Button - only show if we can go back */}
            {mounted && canGoBack && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.back()}
                className="gap-2 text-muted-foreground hover:text-foreground shrink-0"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
            )}

            {/* Search */}
            <div className="max-w-md w-full">
              <SearchClips />
            </div>
          </div>

          {/* Right Section - Navigation Links */}
          <div className="flex items-center gap-6 ml-4">
            <Link
              href="/"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/"
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              Home
            </Link>

            <Link
              href="/clips"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary whitespace-nowrap",
                pathname === "/clips"
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              Browse Clips
            </Link>

            {/* Modified Themes Dropdown */}
            {mounted && (
              <Select 
                onValueChange={(value) => {
                  router.push(`/theme/${value}`);
                  const selectElement = document.querySelector('[role="combobox"]') as HTMLElement;
                  if (selectElement) {
                    selectElement.click();
                  }
                }}
              >
                <SelectTrigger className="h-auto p-0 border-0 bg-transparent text-muted-foreground hover:text-primary text-sm font-medium focus:ring-0 [&>span]:ml-0.5">
                  <div className="flex items-center">
                    Explore Themes
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup className="p-0">
                    {themes.map((theme) => (
                      <SelectItem key={theme.id} value={theme.id} className="pl-2">
                        <div className="flex items-center gap-2">
                          {React.createElement(iconMap[theme.iconName], {
                            className: "h-4 w-4",
                            style: { color: theme.iconColor }
                          })}
                          {theme.title}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
} 