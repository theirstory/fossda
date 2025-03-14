"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronLeft, Menu as MenuIcon } from "lucide-react";
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
import { iconMap } from "@/data/icons";
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SearchInput } from "@/components/SearchInput";

export default function MainNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const navigationLinks = [
    { href: "/", label: "Home" },
    { href: "/interviews", label: "Interviews" },
    { href: "/clips", label: "Browse Clips" },
    { href: "/chapters", label: "Chapters" },
    { href: "/ask", label: "Ask AI" },
  ];

  return (
    <div className="sticky top-0 z-50">
      {/* Main Navigation */}
      <div className="bg-white border-b">
        <nav className="container mx-auto px-4">
          <div className="flex h-16 items-center gap-4">
            {/* Back Button - only show if we can go back */}
            <div className="w-20 flex items-center lg:hidden">
              {mounted && canGoBack && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => router.back()}
                  className="gap-2 text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="inline">Back</span>
                </Button>
              )}
            </div>

            {/* Center Section - Logo and Desktop Items */}
            <div className="flex-1 flex items-center justify-center lg:justify-start lg:gap-4">
              {/* Logo and Desktop Back Button */}
              <div className="flex items-center gap-4">
                {/* Logo */}
                <Link href="/" className="text-lg font-bold flex items-center gap-2 shrink-0">
                  <Image
                    src="/images/logo.png"
                    alt="FOSSDA Logo"
                    width={77}
                    height={39}
                    className="w-[77px] h-auto"
                  />
                  <span>FOSSDA</span>
                </Link>

                {/* Desktop Back Button */}
                {mounted && canGoBack && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => router.back()}
                    className="gap-2 text-muted-foreground hover:text-foreground shrink-0 hidden lg:flex"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Back</span>
                  </Button>
                )}
              </div>

              {/* Desktop Search */}
              <div className="hidden lg:block flex-1">
                <SearchInput />
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="w-20 flex justify-end lg:hidden">
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MenuIcon className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:w-80">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    {/* Mobile Search */}
                    <div className="lg:hidden">
                      <SearchInput />
                    </div>

                    {/* Navigation Links */}
                    <div className="flex flex-col gap-2">
                      {navigationLinks.map(({ href, label }) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setIsMenuOpen(false)}
                          className={cn(
                            "text-sm font-medium transition-colors hover:text-primary p-2 rounded-md",
                            pathname === href
                              ? "bg-gray-100 text-primary"
                              : "text-muted-foreground"
                          )}
                        >
                          {label}
                        </Link>
                      ))}
                    </div>

                    {/* Mobile Themes */}
                    {mounted && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-500">Explore Themes</div>
                        <div className="grid grid-cols-1 gap-1">
                          {themes.map((theme) => (
                            <Button
                              key={theme.id}
                              variant="ghost"
                              className="w-full justify-start gap-2"
                              onClick={() => {
                                router.push(`/theme/${theme.id}`);
                                setIsMenuOpen(false);
                              }}
                            >
                              {React.createElement(iconMap[theme.iconName], {
                                className: "h-4 w-4",
                                style: { color: theme.iconColor }
                              })}
                              {theme.title}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-4 ml-4">
              {navigationLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary whitespace-nowrap",
                    pathname === href
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {label}
                </Link>
              ))}

              {/* Desktop Themes Dropdown */}
              {mounted && (
                <div className="flex items-center gap-1">
                  <Select 
                    onValueChange={(value: string) => {
                      router.push(`/theme/${value}`);
                      const selectElement = document.querySelector('[role="combobox"]') as HTMLElement;
                      if (selectElement) {
                        selectElement.click();
                      }
                    }}
                  >
                    <SelectTrigger className="h-auto p-0 border-0 bg-transparent text-muted-foreground hover:text-primary text-sm font-medium focus:ring-0 [&>span]:ml-0.5">
                      <div className="flex items-center whitespace-nowrap">
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
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
} 