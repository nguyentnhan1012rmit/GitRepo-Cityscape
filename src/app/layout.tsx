import type { Metadata } from "next";
import { Geist, Geist_Mono, Orbitron } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "GitRepo Cityscape — Visualize Code as a 3D City",
  description: "Transform any GitHub repository into a living cyberpunk-style 3D metropolis. Folders become districts, files become skyscrapers, and code complexity shapes the skyline.",
  keywords: ["GitHub", "3D visualization", "code city", "repository", "Three.js", "cyberpunk"],
  openGraph: {
    images: ['/api/og'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a14]">{children}</body>
    </html>
  );
}
