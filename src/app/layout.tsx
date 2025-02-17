import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from 'next/script';
import { Suspense } from 'react';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Tell Inclusive Stories",
  description: "Interactive video archive of personal stories and experiences",
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
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </body>
    </html>
  );
}
