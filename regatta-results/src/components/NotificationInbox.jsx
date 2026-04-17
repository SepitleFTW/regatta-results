import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHistory, markAllHistoryRead, clearHistory } from '../hooks/useResultsAlerts';
import { useTheme } from '../contexts/ThemeContext';

function timeAgo(ts) {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NotificationInbox() {
  const { dark } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  function refresh() {
    const h = getHistory();
    setHistory(h);
    setUnread(h.filter(x => !x.read).length);
  }

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 10000);
    const onUpdate = () => refresh();
    window.addEventListener('regatta-notif', onUpdate);
    return () => { clearInterval(id); window.removeEventListener('regatta-notif', onUpdate); };
  }, []);

  useEffect(() => {
    if (!open) return;
    function handle(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  function handleView(item) {
    markAllHistoryRead();
    refresh();
    setOpen(false);
    if (item.url) {
      const path = item.url.replace(window.location.origin, '');
      navigate(path);
    }
  }

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={() => { setOpen(o => !o); if (!open) refresh(); }}
        title="Notification history"
        style={{
          background: open ? 'var(--t-gold-d)' : 'none',
          border: '1px solid var(--t-border)',
          borderRadius: 8, cursor: 'pointer',
          color: 'var(--t-muted)', fontSize: 17, lineHeight: 1,
          padding: '5px 9px', position: 'relative',
          display: 'flex', alignItems: 'center', transition: 'all 0.15s',
        }}
      >
        🔔
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: 1, right: 1,
            background: '#ef4444', color: '#fff', borderRadius: '50%',
            width: 14, height: 14, fontSize: 9, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'DM Mono', monospace", lineHeight: 1,
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 8px)',
          background: dark ? '#0f1f0f' : '#ffffff',
          border: '1px solid var(--t-border-s)',
          borderRadius: 12, width: 310, maxHeight: 420, overflowY: 'auto',
          zIndex: 200, boxShadow: dark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(100,80,20,0.15)',
        }}>
          <div style={{
            padding: '10px 14px', borderBottom: '1px solid var(--t-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            position: 'sticky', top: 0,
            background: dark ? '#0f1f0f' : '#ffffff',
          }}>
            <span style={{
              color: 'var(--t-text)', fontFamily: "'DM Mono', monospace",
              fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase',
            }}>Notifications</span>
            <div style={{ display: 'flex', gap: 10 }}>
              {unread > 0 && (
                <button onClick={() => { markAllHistoryRead(); refresh(); }} style={{
                  background: 'none', border: 'none', color: 'var(--t-gold)',
                  cursor: 'pointer', fontSize: 11, fontFamily: "'DM Mono', monospace", padding: 0,
                }}>Mark read</button>
              )}
              {history.length > 0 && (
                <button onClick={() => { clearHistory(); refresh(); }} style={{
                  background: 'none', border: 'none', color: 'var(--t-muted)',
                  cursor: 'pointer', fontSize: 11, fontFamily: "'DM Mono', monospace", padding: 0,
                }}>Clear</button>
              )}
            </div>
          </div>

          {history.length === 0 ? (
            <div style={{
              padding: '28px 16px', textAlign: 'center',
              color: 'var(--t-dim)', fontFamily: "'DM Sans', sans-serif", fontSize: 13,
            }}>
              No notifications yet
            </div>
          ) : history.map(item => (
            <div
              key={item.id}
              onClick={() => handleView(item)}
              style={{
                padding: '10px 14px', cursor: 'pointer',
                borderBottom: '1px solid var(--t-border)',
                background: item.read ? 'transparent' : 'var(--t-gold-d)',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--t-bg-card-a)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = item.read ? 'transparent' : 'var(--t-gold-d)'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <span style={{
                  color: item.read ? 'var(--t-muted)' : 'var(--t-text)',
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                  fontWeight: item.read ? 400 : 600, lineHeight: 1.35, flex: 1,
                }}>{item.title}</span>
                {!item.read && (
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--t-gold)', flexShrink: 0, marginTop: 4 }} />
                )}
              </div>
              {item.body && (
                <div style={{ color: 'var(--t-dim)', fontFamily: "'DM Sans', sans-serif", fontSize: 12, marginTop: 2 }}>
                  {item.body}
                </div>
              )}
              <div style={{ color: 'var(--t-vdim)', fontFamily: "'DM Mono', monospace", fontSize: 10, marginTop: 3 }}>
                {timeAgo(item.timestamp)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
