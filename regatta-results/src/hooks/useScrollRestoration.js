import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Disable the browser's own scroll restoration so we control it fully
if (typeof window !== 'undefined') {
  window.history.scrollRestoration = 'manual';
}

// ready: pass false until async content has rendered, then flip to true
export function useScrollRestoration(ready = true) {
  const { pathname } = useLocation();
  const key = `scroll:${pathname}`;

  // Restore saved position once content is ready
  useEffect(() => {
    if (!ready) return;
    const saved = sessionStorage.getItem(key);
    if (saved) {
      window.scrollTo(0, parseInt(saved, 10));
    }
  }, [ready, key]);

  // Save position on unmount
  useEffect(() => {
    return () => {
      sessionStorage.setItem(key, String(window.scrollY));
    };
  }, [key]);
}
