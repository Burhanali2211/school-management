import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Custom toast notifications - no external dependencies
import ErrorBoundary from "@/components/ErrorBoundary";
import AuthProvider from "@/components/SafeClerkProvider";
import DevSetup from "@/components/DevSetup";
import StagewiseClient from "@/components/StagewiseClient";
import ToastProvider from "../components/ToastProvider";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
  fallback: ['system-ui', 'arial', 'sans-serif'],
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "EduManage - School Management System",
  description: "Modern Next.js School Management System with comprehensive features",
  keywords: ["school management", "education", "dashboard", "next.js"],
  authors: [{ name: "EduManage Team" }],
  robots: "index, follow",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <html lang="en">
        <body className={inter.className}>
          <ToastProvider>
            <DevSetup />
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
            <StagewiseClient />
          </ToastProvider>
        </body>
      </html>
    </AuthProvider>
  );
}
