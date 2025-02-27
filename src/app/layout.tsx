import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from 'next/script';
import { Suspense } from 'react';
import MainNavigation from "@/components/MainNavigation";
import { CommandMenu } from '@/components/CommandMenu';
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: 'Free Open Source Stories Digital Archive',
  description: 'A digital archive of stories from the free and open source software community',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script 
          src="https://cdn.jsdelivr.net/gh/hyperaudio/hyperaudio-lite@master/js/hyperaudio-lite.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
        <MainNavigation />
        <Suspense fallback={null}>
          {children}
        </Suspense>
        <CommandMenu />
        <Toaster />
      </body>
    </html>
  );
}
