"use client";

import { ReactNode } from "react";
import Image from "next/image";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  showLogo?: boolean;
}

export default function AuthLayout({ 
  children, 
  title, 
  description, 
  showLogo = true 
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Floating geometric shapes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-8 h-8 border border-white/20 rounded-lg rotate-45 animate-float"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-white/10 rounded-full animate-float-delayed"></div>
        <div className="absolute bottom-40 left-20 w-4 h-16 bg-gradient-to-t from-blue-500/20 to-purple-500/20 rounded-full animate-float"></div>
        <div className="absolute bottom-20 right-40 w-12 h-12 border border-white/10 rounded-full animate-float-delayed"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo and header */}
        {showLogo && (
          <div className="text-center mb-8">
            <div className="relative mx-auto mb-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-4 shadow-2xl">
                <Image
                  src="/logo.png"
                  alt="School Logo"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain filter brightness-0 invert"
                />
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-20 blur-xl"></div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
              {title}
            </h1>
            <p className="text-slate-300 text-lg">
              {description}
            </p>
          </div>
        )}

        {/* Main card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
          {children}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-slate-400 text-sm">
            © 2024 School Management System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}