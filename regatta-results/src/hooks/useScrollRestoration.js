import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

if (typeof window !== 'undefined') {
  window.history.scrollRestoration = 'manual';
}

export const SCROLL_KEY = (pathname) => `scroll:${pathname}`;

// Call this before any navigate() so the position is captured at click time,
// independent of the debounced scroll listener.
export function saveScrollNow(pathname) {
  sessionStorage.setItem(SCROLL_KEY(pathname), String(Math.round(window.scrollY)));
}

// ready: pass false until async content is in the DOM, then true
export function useScrollRestoration(ready = true) {
  const { pathname } = useLocation();
  const key = SCROLL_KEY(pathname);
  const debounceRef = useRef(null);
  const retryRef = useRef(null);

  // Save via scroll events (debounced) as a passive backup
  useEffect(() => {
    function onScroll() {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        sessionStorage.setItem(key, String(Math.round(window.scrollY)));
      }, 200);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(debounceRef.current);
      clearTimeout(retryRef.current);
    };
  }, [key]);

  // Restore: useLayoutEffect fires after DOM update, before paint.
  // Retry up to 8 times (every 50ms) in case the layout hasn't settled yet.
  useLayoutEffect(() => {
    if (!ready) return;
    const saved = sessionStorage.getItem(key);
    if (!saved || saved === '0') return;
    const pos = parseInt(saved, 10);

    let attempts = 0;
    function tryScroll() {
      window.scrollTo(0, pos);
      attempts++;
      if (attempts < 8 && Math.abs(window.scrollY - pos) > 10) {
        retryRef.current = setTimeout(tryScroll, 50);
      }
    }
    // Defer one tick so the browser has committed layout
    retryRef.current = setTimeout(tryScroll, 0);
    return () => clearTimeout(retryRef.current);
  }, [ready, key]);
}
