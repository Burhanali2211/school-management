/**
 * Development utilities to suppress non-critical warnings
 */

export function suppressNonCriticalWarnings() {
  if (process.env.NODE_ENV === 'development') {
    // Suppress the defaultProps warning from Recharts
    const originalError = console.error;
    console.error = (...args: any[]) => {
      if (
        args[0] &&
        typeof args[0] === 'string' &&
        args[0].includes('Support for defaultProps will be removed from function components')
      ) {
        return;
      }
      originalError.apply(console, args);
    };

    // Suppress the cross-origin object warning
    const originalWarn = console.warn;
    console.warn = (...args: any[]) => {
      if (
        args[0] &&
        typeof args[0] === 'string' &&
        args[0].includes('Not allowed to define cross-origin object')
      ) {
        return;
      }
      originalWarn.apply(console, args);
    };
  }
}

export function installReactDevTools() {
  if (process.env.NODE_ENV === 'development') {
    const devToolsScript = document.createElement('script');
    devToolsScript.src = 'https://unpkg.com/react-devtools@4.28.5/standalone.js';
    devToolsScript.async = true;
    document.head.appendChild(devToolsScript);
  }
}
