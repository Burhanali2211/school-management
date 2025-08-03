"use client";

import { useEffect, useRef } from "react";

export default function StagewiseClient() {
  const initialized = useRef(false);

  useEffect(() => {
    // Only initialize in development mode and on client side
    if (process.env.NODE_ENV === "development" && !initialized.current) {
      if (typeof window !== "undefined" && !window.__STAGEWISE_INITIALIZED__) {
        console.log("StagewiseClient: Starting initialization...");
        
        // Simple approach - just try to initialize directly
        const initStagewise = () => {
          try {
            // Try the simplest possible initialization
            import("@stagewise/toolbar").then((module) => {
              if (module.initToolbar && !window.__STAGEWISE_INITIALIZED__) {
                console.log("StagewiseClient: Calling initToolbar...");
                module.initToolbar();
                console.log("StagewiseClient: initToolbar called successfully");
                window.__STAGEWISE_INITIALIZED__ = true;
                initialized.current = true;
              }
            }).catch((error) => {
              console.error("StagewiseClient: Module import failed:", error);
            });
          } catch (error) {
            console.error("StagewiseClient: Initialization error:", error);
          }
        };

        // Initialize after a short delay
        setTimeout(initStagewise, 500);
      }
    }
  }, []);

  return null;
} 