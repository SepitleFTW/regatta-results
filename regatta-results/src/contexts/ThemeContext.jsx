import { createContext, useContext, useState, useEffect, useRef } from 'react';

const DARK = {
  '--t-bg': '#0a1a0a',
  '--t-bg-deep': '#030a03',
  '--t-bg-card': '#0f220f',
  '--t-bg-card-a': 'rgba(10,26,10,0.6)',
  '--t-bg-nav': 'rgba(3,10,3,0.88)',
  '--t-bg-input': 'rgba(10,26,10,0.8)',
  '--t-border': 'rgba(26,58,26,0.6)',
  '--t-border-s': '#1a3a1a',
  '--t-text': '#f5f0e0',
  '--t-text2': '#e8e0c8',
  '--t-muted': '#6b7c6b',
  '--t-dim': '#4a6b4a',
  '--t-vdim': '#2d5a1b',
  '--t-gold': '#d4a017',
  '--t-gold-h': '#f0c040',
  '--t-gold-d': 'rgba(212,160,23,0.12)',
  '--t-gold-b': 'rgba(212,160,23,0.3)',
  '--t-gold-row': '#1c1600',
  '--t-gold-row-b': '#3d2e00',
  '--t-green': '#4ade80',
  '--t-green-d': 'rgba(74,222,128,0.1)',
  '--t-green-b': 'rgba(74,222,128,0.4)',
  '--t-red': '#f87171',
  '--t-red-bg': '#2d1b1b',
  '--t-red-b': '#7f1d1d',
};

const LIGHT = {
  '--t-bg': '#f5f2ea',
  '--t-bg-deep': '#e8e4d8',
  '--t-bg-card': '#ffffff',
  '--t-bg-card-a': 'rgba(255,255,255,0.85)',
  '--t-bg-nav': 'rgba(245,242,234,0.95)',
  '--t-bg-input': 'rgba(255,255,255,0.95)',
  '--t-border': 'rgba(160,140,80,0.22)',
  '--t-border-s': 'rgba(140,120,60,0.35)',
  '--t-text': '#1a1208',
  '--t-text2': '#2e2618',
  '--t-muted': '#6a5c40',
  '--t-dim': '#7a6848',
  '--t-vdim': '#8a7848',
  '--t-gold': '#b88a00',
  '--t-gold-h': '#d4a017',
  '--t-gold-d': 'rgba(184,138,0,0.1)',
  '--t-gold-b': 'rgba(184,138,0,0.3)',
  '--t-gold-row': '#fff8e1',
  '--t-gold-row-b': 'rgba(184,138,0,0.35)',
  '--t-green': '#15803d',
  '--t-green-d': 'rgba(21,128,61,0.1)',
  '--t-green-b': 'rgba(21,128,61,0.4)',
  '--t-red': '#dc2626',
  '--t-red-bg': 'rgba(220,38,38,0.07)',
  '--t-red-b': 'rgba(220,38,38,0.25)',
};

function applyVars(isDark, animate = false) {
  const root = document.documentElement;
  if (animate) root.classList.add('theme-fade');
  const vars = isDark ? DARK : LIGHT;
  for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
  document.body.style.background = isDark ? '#0a1a0a' : '#f5f2ea';
  if (animate) setTimeout(() => root.classList.remove('theme-fade'), 450);
}

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const mounted = useRef(false);
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('regatta_theme');
    const isDark = saved !== null ? saved === 'dark' : true;
    applyVars(isDark);
    return isDark;
  });

  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    applyVars(dark, true);
  }, [dark]);

  function toggle() {
    setDark(d => {
      localStorage.setItem('regatta_theme', !d ? 'dark' : 'light');
      return !d;
    });
  }

  return <ThemeContext.Provider value={{ dark, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  return ctx ?? { dark: true, toggle: () => {} };
}
