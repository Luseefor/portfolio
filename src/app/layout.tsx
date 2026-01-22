import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Luseefor.os",
  description: "Advanced Immersive Portfolio Experience",
  icons: {
    icon: "/favicon.png",
  },
};

import OverscrollPreventer from "@/components/OverscrollPreventer";
import TechCursor from "@/components/TechCursor";
import AIAgent from "@/components/ai-agent/AIAgent";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <OverscrollPreventer />
        <TechCursor />
        <AIAgent />
        {children}
      </body>
    </html>
  );
}
