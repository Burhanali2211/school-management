declare global {
  interface Window {
    __STAGEWISE_INITIALIZED__?: boolean;
    initStagewiseToolbar?: () => void;
  }
}

export {}; 