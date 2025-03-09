import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./embed.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: 'FOSSDA Video Player',
  description: 'Embedded video player for FOSSDA interviews',
};

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <script 
          src="https://cdn.jsdelivr.net/gh/hyperaudio/hyperaudio-lite@master/js/hyperaudio-lite.js"
          async
        />
      </head>
      <body className={`${inter.variable} antialiased h-full`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
} 