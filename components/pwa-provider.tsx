'use client';

import { useEffect } from 'react';

export function PWAProvider() {
  useEffect(() => {
    // Temporarily disable service worker registration to prevent interference with JS loading
    // if ('serviceWorker' in navigator) {
    //   navigator.serviceWorker
    //     .register('/sw.js')
    //     .then((registration) => {
    //       console.log('SW registered: ', registration);
    //     })
    //     .catch((registrationError) => {
    //       console.log('SW registration failed: ', registrationError);
    //     });
    // }
  }, []);

  return null;
}