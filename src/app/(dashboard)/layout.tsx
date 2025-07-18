"use client";

import { useState } from "react";
import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { X } from "lucide-react";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex overflow-hidden">
      {/* Skip to main content link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* DESKTOP SIDEBAR - Fixed positioning */}
      <aside
        className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 w-64 bg-white/95 backdrop-blur-md shadow-xl border-r border-neutral-200 flex-col z-40"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-center h-20 px-6 bg-gradient-to-r from-primary-600 to-primary-700 border-b border-primary-500 flex-shrink-0">
          <Link href="/" className="flex items-center space-x-3 focus-visible-ring rounded-lg p-2">
            <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-primary-600 font-bold text-lg" aria-hidden="true">E</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg tracking-wide">EduManage</h1>
              <p className="text-primary-100 text-xs">School Management</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 mt-6 px-4 pb-4 overflow-y-auto scrollbar-thin scrollbar-thumb-primary-300 scrollbar-track-transparent" role="navigation" aria-label="Main menu">
          <Menu />
        </nav>
      </aside>

      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside className={`fixed inset-y-0 left-0 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex items-center justify-between h-20 px-6 bg-gradient-to-r from-primary-600 to-primary-700 border-b border-primary-500">
              <Link href="/" className="flex items-center space-x-3 focus-visible-ring rounded-lg p-2">
                <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-primary-600 font-bold text-lg" aria-hidden="true">E</span>
                </div>
                <div>
                  <h1 className="text-white font-bold text-lg tracking-wide">EduManage</h1>
                  <p className="text-primary-100 text-xs">School Management</p>
                </div>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-white hover:text-primary-100 transition-colors p-2 focus-visible-ring rounded-lg"
                aria-label="Close navigation menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex-1 mt-6 px-4 pb-4 overflow-y-auto scrollbar-thin scrollbar-thumb-primary-300 scrollbar-track-transparent" role="navigation" aria-label="Main menu">
              <Menu />
            </nav>
          </aside>
        </div>
      )}

      {/* MAIN CONTENT - Adjusted for fixed sidebar */}
      <div className="flex-1 flex flex-col lg:ml-64">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main id="main-content" className="flex-1 py-6 overflow-y-auto bg-gradient-to-br from-primary-50/30 via-white to-accent-50/30" role="main">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
