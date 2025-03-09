import { Inter } from "next/font/google";
import Script from 'next/script';
import { Suspense } from 'react';
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: 'Customize Embed - FOSSDA',
  description: 'Customize the embedded video player for FOSSDA interviews',
};

export default function CustomizeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Script 
        src="https://cdn.jsdelivr.net/gh/hyperaudio/hyperaudio-lite@master/js/hyperaudio-lite.js"
        strategy="beforeInteractive"
      />
      <div className={`${inter.variable} antialiased`}>
        <Suspense fallback={null}>
          {children}
        </Suspense>
        <Toaster />
      </div>
    </>
  );
} 