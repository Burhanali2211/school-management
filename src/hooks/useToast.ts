import { useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string, duration: number = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, type, message, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove toast after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((message: string, duration?: number) => {
    addToast('success', message, duration);
  }, [addToast]);

  const error = useCallback((message: string, duration?: number) => {
    addToast('error', message, duration);
  }, [addToast]);

  const warning = useCallback((message: string, duration?: number) => {
    addToast('warning', message, duration);
  }, [addToast]);

  const info = useCallback((message: string, duration?: number) => {
    addToast('info', message, duration);
  }, [addToast]);

  return {
    toasts,
    success,
    error,
    warning,
    info,
    removeToast,
  };
};

// Global toast instance for use across components
let globalToast: ReturnType<typeof useToast> | null = null;

export const getGlobalToast = () => {
  if (!globalToast) {
    // Create a simple implementation for global use
    globalToast = {
      toasts: [],
      success: (message: string) => console.log('✅', message),
      error: (message: string) => console.error('❌', message),
      warning: (message: string) => console.warn('⚠️', message),
      info: (message: string) => console.info('ℹ️', message),
      removeToast: () => {},
    };
  }
  return globalToast;
};

// Export individual functions for easy use
export const toast = {
  success: (message: string) => getGlobalToast().success(message),
  error: (message: string) => getGlobalToast().error(message),
  warning: (message: string) => getGlobalToast().warning(message),
  info: (message: string) => getGlobalToast().info(message),
}; 