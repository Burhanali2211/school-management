// Simple notification utility to replace toast libraries
export const notify = {
  success: (message: string) => {
    console.log('✅ Success:', message);
    // You can implement a simple notification here if needed
  },
  error: (message: string) => {
    console.error('❌ Error:', message);
    // You can implement a simple notification here if needed
  },
  warning: (message: string) => {
    console.warn('⚠️ Warning:', message);
    // You can implement a simple notification here if needed
  },
  info: (message: string) => {
    console.info('ℹ️ Info:', message);
    // You can implement a simple notification here if needed
  }
};

// Simple toast function for compatibility
export const toast = notify;

// Simple Toaster component for compatibility
export const Toaster = () => null; 