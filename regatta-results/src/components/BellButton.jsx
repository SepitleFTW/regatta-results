import { useState } from 'react';
import { addWatched, removeWatched, isWatched } from '../hooks/useResultsAlerts';
import { isIos, isPwa, requestPermission, subscribeToPush } from '../utils/notifications';

const TIPS = {
  ios: '📱 Tap Share → "Add to Home Screen" in Safari, then open the app from your home screen to enable notifications.',
  denied: '🔕 Notifications are blocked. Open your browser settings, find this site, and allow notifications.',
};

// size: 'sm' | 'md' | 'lg'
// label: string | { on, off } — when provided shows text next to the bell
// variant: 'icon' (default) | 'pill' — pill uses gold background when not watching
export default function BellButton({ watchId, watchItem, size = 'md', label, variant = 'icon' }) {
  const [watching, setWatching] = useState(() => isWatched(watchId));
  const [tip, setTip] = useState(null);

  async function toggle(e) {
    e.stopPropagation();
    if (watching) {
      removeWatched(watchId);
      setWatching(false);
      setTip(null);
      return;
    }

    addWatched({ id: watchId, ...watchItem });
    setWatching(true);

    if (isIos() && !isPwa()) {
      setTip('ios');
      setTimeout(() => setTip(null), 8000);
      return;
    }

    const perm = await requestPermission();
    if (perm !== 'granted') {
      setTip('denied');
      setTimeout(() => setTip(null), 8000);
    } else {
      subscribeToPush();
    }
  }

  const pad = { sm: '3px 6px', md: '5px 8px', lg: '6px 14px' }[size] ?? '5px 8px';
  const fs = { sm: 12, md: 14, lg: 14 }[size] ?? 14;

  const labelText = label
    ? (watching ? (label.on ?? label) : (label.off ?? label))
    : null;

  const notWatchingBg = variant === 'pill' ? 'var(--t-gold-d)' : 'transparent';
  const notWatchingBorder = variant === 'pill' ? 'var(--t-gold-b)' : 'var(--t-border)';
  const notWatchingColor = variant === 'pill' ? 'var(--t-gold)' : undefined;

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={toggle}
        title={watching ? 'Stop watching' : 'Notify me when results are posted'}
        style={{
          background: watching ? 'var(--t-green-d)' : notWatchingBg,
          border: `1px solid ${watching ? 'var(--t-green-b)' : notWatchingBorder}`,
          color: watching ? 'var(--t-green)' : notWatchingColor,
          borderRadius: 7, padding: pad, cursor: 'pointer',
          fontSize: fs, lineHeight: 1, flexShrink: 0,
          opacity: watching ? 1 : 0.55, transition: 'all 0.2s',
          display: 'flex', alignItems: 'center', gap: 6,
          fontFamily: labelText ? "'DM Mono', monospace" : undefined,
          letterSpacing: labelText ? '0.1em' : undefined,
          whiteSpace: 'nowrap',
        }}
      >
        🔔{labelText && <span>{labelText}</span>}
      </button>

      {tip && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 8px)',
          background: 'var(--t-bg-card)', border: '1px solid var(--t-border-s)',
          borderRadius: 10, padding: '12px 14px', width: 260, zIndex: 400,
          color: 'var(--t-text2)', fontFamily: "'DM Sans', sans-serif", fontSize: 13,
          lineHeight: 1.5, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          pointerEvents: 'none',
        }}>
          {TIPS[tip]}
        </div>
      )}
    </div>
  );
}
