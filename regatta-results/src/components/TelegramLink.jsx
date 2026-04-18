import { useState } from 'react';

export default function TelegramLink() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function link() {
    setLoading(true);
    setError(null);
    try {
      const reg = await navigator.serviceWorker?.ready;
      const sub = reg ? await reg.pushManager.getSubscription() : null;
      if (!sub) {
        setError('Enable push notifications first by tapping the 🔔 bell on an event.');
        return;
      }
      const res = await fetch('/api/telegram-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      });
      const data = await res.json();
      setToken(data.token);
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  if (token) {
    return (
      <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--t-bg-card)', border: '1px solid var(--t-border-s)', borderRadius: 10, maxWidth: 320, margin: '16px auto 0' }}>
        <p style={{ color: 'var(--t-text)', fontSize: 13, fontFamily: "'DM Sans', sans-serif", margin: '0 0 8px' }}>
          Send this to <strong>@regattaresults_sa_bot</strong> on Telegram:
        </p>
        <code style={{ display: 'block', background: 'var(--t-bg-deep)', color: 'var(--t-gold)', padding: '8px 12px', borderRadius: 6, fontSize: 15, letterSpacing: 2, textAlign: 'center', userSelect: 'all' }}>
          /link {token}
        </code>
        <p style={{ color: 'var(--t-dim)', fontSize: 11, fontFamily: "'DM Mono', monospace", margin: '8px 0 0', textAlign: 'center' }}>
          Code expires in 10 minutes
        </p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 16 }}>
      {error && (
        <p style={{ color: 'var(--t-red)', fontSize: 12, fontFamily: "'DM Sans', sans-serif", marginBottom: 8 }}>
          {error}
        </p>
      )}
      <button
        onClick={link}
        disabled={loading}
        style={{
          background: 'transparent', border: '1px solid var(--t-border)',
          color: 'var(--t-muted)', fontFamily: "'DM Mono', monospace", fontSize: 12,
          padding: '5px 12px', borderRadius: 6, cursor: 'pointer',
          opacity: loading ? 0.6 : 1,
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--t-gold)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--t-muted)'}
      >
        {loading ? 'Generating...' : '✈ Link Telegram'}
      </button>
    </div>
  );
}
