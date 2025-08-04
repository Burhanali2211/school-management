"use client";

import { Loader2 } from "lucide-react";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export function Loading({ size = "md", text, className = "" }: LoadingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
      <div className={`${sizeClasses[size]} border-2 border-neutral-300 border-t-primary-600 rounded-full`}></div>
      {text && <p className="text-sm text-neutral-600 mt-2">{text}</p>}
    </div>
  );
}

export function LoadingSpinner({ size = "md", className = "" }: Omit<LoadingProps, "text">) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={`${sizeClasses[size]} border-2 border-neutral-300 border-t-primary-600 rounded-full ${className}`}></div>
  );
}

export function LoadingDots({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="w-2 h-2 bg-neutral-400 rounded-full"></div>
      <div className="w-2 h-2 bg-neutral-400 rounded-full"></div>
      <div className="w-2 h-2 bg-neutral-400 rounded-full"></div>
      {text && <span className="text-sm text-neutral-600 ml-2">{text}</span>}
    </div>
  );
}

export function LoadingSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-neutral-200 rounded ${className}`}>
      <div className="h-full w-full bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200"></div>
    </div>
  );
}
