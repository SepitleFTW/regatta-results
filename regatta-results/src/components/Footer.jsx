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
      <p style={{ color: 'var(--t-vdim)', fontSize: 12, marginTop: 8, fontFamily: "'DM Mono', monospace" }}>
        Data sourced from{" "}
        <a href="https://regattaresults.co.za" target="_blank" rel="noopener noreferrer"
          style={{ color: 'var(--t-dim)', textDecoration: 'underline' }}>regattaresults.co.za</a>
        {" "}· Not affiliated with Rowing South Africa
      </p>
    </footer>
  );
}
