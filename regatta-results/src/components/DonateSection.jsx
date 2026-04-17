import { useState } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';

const PRESETS = ["20", "50", "100", "200"];

async function submitPayFast(amount) {
  const res = await fetch('/api/payfast-sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount }),
  });

  if (!res.ok) {
    const { error } = await res.json().catch(() => ({}));
    throw new Error(error || 'Could not sign payment');
  }

  const fields = await res.json();

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = 'https://www.payfast.co.za/eng/process';
  form.target = '_blank';

  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}

export default function DonateSection() {
  const isMobile = useIsMobile();
  const [amount, setAmount] = useState("50");
  const [custom, setCustom] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const final = amount === "custom" ? custom : amount;
  const valid = final && !isNaN(parseFloat(final)) && parseFloat(final) >= 5;

  async function handleDonate() {
    if (!valid || submitting) return;
    setError('');
    setSubmitting(true);
    try {
      await submitPayFast(final);
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const btnActive = valid && !submitting;

  return (
    <section id="donate" style={{
      background: 'var(--t-bg-deep)', borderTop: '1px solid var(--t-border-s)',
      padding: isMobile ? '48px 16px' : '80px 24px', textAlign: 'center',
    }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <span style={{ color: 'var(--t-gold)', fontFamily: "'DM Mono', monospace", fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Keep the oars moving</span>
        <h2 style={{ fontFamily: "'Playfair Display', serif", color: 'var(--t-text)', fontSize: 'clamp(2rem,5vw,3rem)', margin: '16px 0 16px' }}>Support Regatta Results</h2>
        <p style={{ color: 'var(--t-muted)', lineHeight: 1.8, marginBottom: 40, fontFamily: "'DM Sans', sans-serif" }}>
          This platform is maintained by volunteers passionate about South African rowing. Your donation helps keep it free, fast, and up to date for clubs, parents, coaches, and athletes across the country.
        </p>

        <div style={{ background: 'var(--t-bg-card)', border: '1px solid var(--t-border-s)', borderRadius: 20, padding: isMobile ? '24px 16px' : '36px' }}>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
            {PRESETS.map(p => (
              <button key={p} onClick={() => { setAmount(p); setCustom(""); setError(""); }} style={{
                background: amount === p ? 'var(--t-gold)' : 'var(--t-bg)',
                color: amount === p ? 'var(--t-bg-deep)' : 'var(--t-muted)',
                border: `1px solid ${amount === p ? 'var(--t-gold)' : 'var(--t-border-s)'}`,
                borderRadius: 10, padding: '10px 22px', fontSize: 15,
                fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Mono', monospace", transition: 'all 0.15s',
              }}>R{p}</button>
            ))}
            <button onClick={() => { setAmount("custom"); setError(""); }} style={{
              background: amount === "custom" ? 'var(--t-gold)' : 'var(--t-bg)',
              color: amount === "custom" ? 'var(--t-bg-deep)' : 'var(--t-muted)',
              border: `1px solid ${amount === "custom" ? 'var(--t-gold)' : 'var(--t-border-s)'}`,
              borderRadius: 10, padding: '10px 22px', fontSize: 15,
              fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Mono', monospace", transition: 'all 0.15s',
            }}>Custom</button>
          </div>

          {amount === "custom" && (
            <input
              value={custom}
              onChange={e => { setCustom(e.target.value); setError(""); }}
              placeholder="Enter amount (ZAR)"
              style={{
                background: 'var(--t-bg)', border: '1px solid var(--t-border-s)', borderRadius: 10,
                padding: '10px 16px', color: 'var(--t-text2)', fontSize: 15,
                fontFamily: "'DM Mono', monospace", width: '100%', marginBottom: 20,
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          )}

          <button
            onClick={handleDonate}
            disabled={!btnActive}
            style={{
              background: btnActive ? 'linear-gradient(135deg, #92400e, var(--t-gold))' : 'var(--t-border-s)',
              color: btnActive ? '#fff' : 'var(--t-dim)',
              border: 'none', borderRadius: 12,
              padding: '16px 40px', fontSize: 16, fontWeight: 700,
              cursor: btnActive ? 'pointer' : 'default',
              fontFamily: "'DM Sans', sans-serif",
              width: '100%', marginTop: 8,
              boxShadow: btnActive ? '0 8px 32px var(--t-gold-d)' : 'none',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if (btnActive) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px var(--t-gold-b)'; } }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = btnActive ? '0 8px 32px var(--t-gold-d)' : 'none'; }}
          >
            {submitting ? 'Preparing payment…' : valid ? `Donate R${final} via PayFast` : 'Select an amount'}
          </button>

          {error && (
            <p style={{ color: 'var(--t-red)', fontSize: 13, marginTop: 10, fontFamily: "'DM Sans', sans-serif" }}>
              {error}
            </p>
          )}

          <p style={{ color: 'var(--t-vdim)', fontSize: 12, marginTop: 12, fontFamily: "'DM Sans', sans-serif" }}>
            Secure payment · Cards, EFT, SnapScan & more · Minimum R5
          </p>
        </div>
      </div>
    </section>
  );
}
