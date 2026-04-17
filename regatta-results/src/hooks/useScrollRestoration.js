import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

if (typeof window !== 'undefined') {
  window.history.scrollRestoration = 'manual';
}

// ready: pass false until async content has rendered, then flip to true
export function useScrollRestoration(ready = true) {
  const { pathname } = useLocation();
  const key = `scroll:${pathname}`;
  const timerRef = useRef(null);

  // Continuously track scroll position so the saved value is always current.
  // Saving on unmount is unreliable — mobile browsers scroll to 0 before React
  // runs cleanup, so we'd save 0 every time.
  useEffect(() => {
    function onScroll() {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        sessionStorage.setItem(key, String(Math.round(window.scrollY)));
      }, 150);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(timerRef.current);
    };
  }, [key]);

  // Restore once content is ready
  useEffect(() => {
    if (!ready) return;
    const saved = sessionStorage.getItem(key);
    if (saved) {
      requestAnimationFrame(() => window.scrollTo(0, parseInt(saved, 10)));
    }
  }, [ready, key]);
}
