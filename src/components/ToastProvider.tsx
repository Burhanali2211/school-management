"use client";

import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/ui/Toast';

const ToastContext = createContext<ReturnType<typeof useToast> | null>(null);

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

const ToastProvider = ({ children }: ToastProviderProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {isMounted && (
        <ToastContainer 
          toasts={toast.toasts} 
          onRemove={toast.removeToast} 
        />
      )}
    </ToastContext.Provider>
  );
};

export default ToastProvider; 