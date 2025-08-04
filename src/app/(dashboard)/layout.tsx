"use client";

import { Suspense, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Menu from "@/components/Menu";
import ClientWrapper from "@/components/ClientWrapper";
import Link from "next/link";
import { useState } from "react";
import { X } from "lucide-react";

function DashboardContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isAuthenticated, mounted } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    if (mounted && !isLoading && (!isAuthenticated || !user)) {
      router.push('/sign-in');
    }
  }, [mounted, isLoading, isAuthenticated, user, router]);
  
  // Show loading state during initial mount to prevent hydration mismatch
  if (!mounted || isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated || !user) {
    return <div>Redirecting to sign-in...</div>;
  }

  return (
    <div className="h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex overflow-hidden">
      {/* Skip to main content link for accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary-600 text-white px-4 py-2 rounded-lg z-50">
        Skip to main content
      </a>

      {/* DESKTOP SIDEBAR - Fixed positioning with improved mobile handling */}
      <aside
        className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 w-64 bg-white/95 backdrop-blur-md shadow-elevated border-r border-neutral-200 flex-col z-40 transform transition-transform duration-300"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-center h-20 px-6 bg-gradient-to-r from-primary-800 to-primary-950 border-b border-primary-400 flex-shrink-0">
          <Link href="/" className="flex items-center space-x-3 focus-visible-ring rounded-lg p-2">
            <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-soft">
              <span className="text-primary-800 font-bold text-lg" aria-hidden="true">E</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg tracking-wide">EduManage</h1>
              <p className="text-primary-200 text-xs">School Management</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 mt-6 px-4 pb-4 overflow-y-auto scrollbar-thin scrollbar-thumb-primary-300 scrollbar-track-transparent" role="navigation" aria-label="Main menu">
          <Menu />
        </nav>
      </aside>

      {/* MOBILE SIDEBAR OVERLAY - Enhanced for better UX */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} role="dialog" aria-modal="true" aria-label="Navigation menu">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow-elevated transform transition-transform duration-300 z-50">
          <div className="flex items-center justify-center h-20 px-6 bg-gradient-to-r from-primary-800 to-primary-950 border-b border-primary-400">
            <Link href="/" className="flex items-center space-x-3 focus-visible-ring rounded-lg p-2">
              <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-soft">
                <span className="text-primary-600 font-bold text-lg" aria-hidden="true">E</span>
              </div>
              <div>
                <h1 className="text-white font-bold text-lg tracking-wide">EduManage</h1>
                <p className="text-primary-200 text-xs">School Management</p>
              </div>
            </Link>
          </div>
          <nav className="flex-1 mt-6 px-4 pb-4 overflow-y-auto scrollbar-thin scrollbar-thumb-primary-300 scrollbar-track-transparent" role="navigation" aria-label="Main menu">
            <Menu />
          </nav>
        </aside>
      </div>

      {/* MAIN CONTENT - Enhanced responsive design */}
      <div className="flex-1 flex flex-col lg:ml-64">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main id="main-content" className="flex-1 overflow-y-auto bg-gradient-to-br from-primary-50/30 via-white to-secondary-50/30" role="main">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClientWrapper>
      <Suspense fallback={<div>Loading...</div>}>
        <DashboardContent>{children}</DashboardContent>
      </Suspense>
    </ClientWrapper>
  );
}
