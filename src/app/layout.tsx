import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CommandMenu } from '@/components/CommandMenu';
import { Toaster } from "@/components/ui/sonner";
import MainNavigation from "@/components/MainNavigation";
import { Suspense } from "react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FOSSDA - Free and Open Source Stories Digital Archive",
  description: "Preserving the history of the free and open source software movement through personal stories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head />
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
        <MainNavigation />
        <Suspense fallback={null}>
          <CommandMenu />
        </Suspense>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
