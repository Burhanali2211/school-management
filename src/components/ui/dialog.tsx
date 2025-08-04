import * as React from "react";
import { createPortal } from "react-dom";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ open, onClose, children }) => {
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="fixed inset-0 z-40"
        aria-hidden="true"
        onClick={onClose}
      />
      <div className="relative z-50 bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
        {children}
      </div>
    </div>,
    typeof window !== "undefined" ? document.body : ({} as HTMLElement)
  );
};

export const DialogContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="py-2">{children}</div>
);

export const DialogHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mb-4 text-lg font-semibold">{children}</div>
);

export const DialogTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="text-xl font-semibold mb-2">{children}</div>
);

export const DialogTrigger: React.FC<{ 
  children: React.ReactNode;
  onClick?: () => void;
}> = ({ children, onClick }) => (
  <div onClick={onClick} className="cursor-pointer">
    {children}
  </div>
);