"use client";

import { useEffect, useRef } from "react";
import { X, Loader2 } from "lucide-react";

interface ModernModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
  loading?: boolean;
  loadingText?: string;
}

interface ModernModalHeaderProps {
  title: string;
  onClose?: () => void;
  showCloseButton?: boolean;
}

interface ModernModalBodyProps {
  children: React.ReactNode;
  loading?: boolean;
  loadingText?: string;
}

interface ModernModalFooterProps {
  children: React.ReactNode;
}

export function ModernModal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
  loading = false,
  loadingText = "Loading...",
}: ModernModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={`relative bg-white rounded-lg shadow-lg w-full mx-4 ${sizeClasses[size]} max-h-[90vh] overflow-hidden`}
      >
        {title && (
          <ModernModalHeader
            title={title}
            onClose={onClose}
            showCloseButton={showCloseButton}
          />
        )}
        <ModernModalBody loading={loading} loadingText={loadingText}>
          {children}
        </ModernModalBody>
      </div>
    </div>
  );
}

export function ModernModalHeader({
  title,
  onClose,
  showCloseButton = true,
}: ModernModalHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-neutral-200">
      <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
      {showCloseButton && onClose && (
        <button
          onClick={onClose}
          className="p-1 text-neutral-400 hover:text-neutral-600"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

export function ModernModalBody({ 
  children, 
  loading = false, 
  loadingText = "Loading..." 
}: ModernModalBodyProps) {
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-4 border-neutral-200 border-t-primary-600 rounded-full mx-auto mb-4"></div>
        <p className="text-neutral-600">{loadingText}</p>
      </div>
    );
  }

  return <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">{children}</div>;
}

export function ModernModalFooter({ children }: ModernModalFooterProps) {
  return (
    <div className="flex items-center justify-end space-x-2 p-4 border-t border-neutral-200">
      {children}
    </div>
  );
}