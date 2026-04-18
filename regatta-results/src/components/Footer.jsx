import OarIcon from './OarIcon';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--t-bg-deep)', borderTop: '1px solid var(--t-border-s)', padding: '40px 24px', textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
        <OarIcon />
        <span style={{ color: 'var(--t-text)', fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 700 }}>Regatta Results SA</span>
      </div>
      <p style={{ color: 'var(--t-dim)', fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
        © {new Date().getFullYear()} Regatta Results South Africa · Built with love for the SA rowing community
      </p>

      <div style={{ margin: '20px auto 0', display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
        <a href="tel:+27670743920" style={{ color: 'var(--t-muted)', fontFamily: "'DM Mono', monospace", fontSize: 12, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--t-gold)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--t-muted)'}>
          📞 +27 67 074 3920
        </a>
        <a href="mailto:sepitleleshilo642@gmail.com" style={{ color: 'var(--t-muted)', fontFamily: "'DM Mono', monospace", fontSize: 12, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--t-gold)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--t-muted)'}>
          ✉ sepitleleshilo642@gmail.com
        </a>
      </div>

      <p style={{ color: 'var(--t-vdim)', fontSize: 12, marginTop: 16, fontFamily: "'DM Mono', monospace" }}>
        Data sourced from{" "}
        <a href="https://regattaresults.co.za" target="_blank" rel="noopener noreferrer"
          style={{ color: 'var(--t-dim)', textDecoration: 'underline' }}>regattaresults.co.za</a>
        {" "}· Not affiliated with Rowing South Africa
      </p>
    </footer>
  );
}
