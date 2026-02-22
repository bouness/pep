import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PE Structural Prep - NCEES PE Civil Structural Exam Practice",
  description: "Comprehensive PE Structural exam practice problems covering wind loads, seismic design, steel design, concrete design, bridge design, and more. Based on AISC, ACI 318, ASCE 7-16, and AASHTO LRFD standards.",
  keywords: ["PE Exam", "Structural Engineering", "Civil Engineering", "NCEES", "AISC", "ACI 318", "ASCE 7", "AASHTO", "Practice Problems"],
  authors: [{ name: "PE Structural Prep" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "PE Structural Prep Platform",
    description: "Practice problems for the NCEES PE Civil Structural exam",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>{children}</AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
