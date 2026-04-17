import { useIsMobile } from '../hooks/useIsMobile';

const SNAPSCAN_URL = 'https://pos.snapscan.io/qr/pFLeIq2o';
const SNAPSCAN_QR  = 'https://pos.snapscan.io/qr/pFLeIq2o.svg';

export default function DonateSection() {
  const isMobile = useIsMobile();

  return (
    <section id="donate" style={{
      background: 'var(--t-bg-deep)', borderTop: '1px solid var(--t-border-s)',
      padding: isMobile ? '48px 16px' : '80px 24px', textAlign: 'center',
    }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <span style={{ color: 'var(--t-gold)', fontFamily: "'DM Mono', monospace", fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          Keep the oars moving
        </span>
        <h2 style={{ fontFamily: "'Playfair Display', serif", color: 'var(--t-text)', fontSize: 'clamp(2rem,5vw,3rem)', margin: '16px 0 16px' }}>
          Support Regatta Results
        </h2>
        <p style={{ color: 'var(--t-muted)', lineHeight: 1.8, marginBottom: 40, fontFamily: "'DM Sans', sans-serif" }}>
          This platform is maintained by volunteers passionate about South African rowing. Your donation helps keep it free, fast, and up to date for clubs, parents, coaches, and athletes across the country.
        </p>

        <div style={{ background: 'var(--t-bg-card)', border: '1px solid var(--t-border-s)', borderRadius: 20, padding: isMobile ? '28px 16px' : '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          <img
            src={SNAPSCAN_QR}
            alt="SnapScan QR code"
            style={{ width: 200, height: 200, borderRadius: 12, background: '#fff', padding: 8 }}
          />

          <div>
            <p style={{ color: 'var(--t-muted)', fontFamily: "'DM Sans', sans-serif", fontSize: 14, marginBottom: 16 }}>
              Scan with your banking app or the SnapScan app
            </p>
            <a
              href={SNAPSCAN_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                background: '#2F80ED',
                color: '#fff',
                border: 'none', borderRadius: 12,
                padding: '14px 36px', fontSize: 16, fontWeight: 700,
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                textDecoration: 'none',
                boxShadow: '0 8px 32px rgba(47,128,237,0.3)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(47,128,237,0.45)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 32px rgba(47,128,237,0.3)'; }}
            >
              Pay with SnapScan
            </a>
          </div>

          <p style={{ color: 'var(--t-vdim)', fontSize: 12, fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
            Any amount welcome · Secure · Instant
          </p>
        </div>
      </div>
    </section>
  );
}
