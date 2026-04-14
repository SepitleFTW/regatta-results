import OarIcon from './OarIcon';

function Wave() {
  return (
    <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: 80 }}>
      <path fill="#0a1a0a" d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" />
    </svg>
  );
}

export default function HeroSection({ onBrowse }) {
  return (
    <section style={{
      background: "linear-gradient(160deg, #030a03 0%, #0a1e0a 50%, #061506 100%)",
      minHeight: "100vh", display: "flex", flexDirection: "column",
      justifyContent: "center", alignItems: "center", position: "relative", overflow: "hidden"
    }}>
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{
          position: "absolute", left: 0, right: 0,
          top: `${20 + i * 14}%`, height: 1,
          background: `rgba(212,160,23,${0.04 + i * 0.015})`,
          animation: `wave ${3 + i * 0.4}s ease-in-out infinite alternate`,
          animationDelay: `${i * 0.3}s`,
        }} />
      ))}

      <div style={{
        position: "absolute", width: 500, height: 500,
        borderRadius: "50%", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        background: "radial-gradient(circle, rgba(212,160,23,0.07) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />

      <div style={{ position: "relative", textAlign: "center", padding: "0 24px", maxWidth: 800 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 24 }}>
          <OarIcon />
          <span style={{ color: "#d4a017", fontFamily: "'DM Mono', monospace", fontSize: 13, letterSpacing: "0.25em", textTransform: "uppercase" }}>
            South African Rowing
          </span>
          <OarIcon />
        </div>

        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "clamp(3rem, 8vw, 6.5rem)",
          fontWeight: 900, lineHeight: 1.0,
          color: "#f5f0e0", margin: "0 0 8px",
          textShadow: "0 0 80px rgba(212,160,23,0.3)"
        }}>Regatta</h1>
        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "clamp(3rem, 8vw, 6.5rem)",
          fontWeight: 900, lineHeight: 1.0,
          background: "linear-gradient(90deg, #d4a017, #f0c040, #fde68a)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          margin: "0 0 32px"
        }}>Results</h1>

        <p style={{
          color: "#94a3b8", fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
          lineHeight: 1.7, maxWidth: 560, margin: "0 auto 48px",
          fontFamily: "'DM Sans', sans-serif"
        }}>
          The homes of South African competitive rowing results — from school regattas to national championships, all in one place.
        </p>

        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={onBrowse} style={{
            background: "#d4a017", color: "#030a03", border: "none",
            borderRadius: 8, padding: "14px 36px", fontSize: 16,
            fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            letterSpacing: "0.02em", transition: "all 0.2s",
            boxShadow: "0 0 40px rgba(212,160,23,0.3)"
          }}
            onMouseEnter={e => { e.target.style.background = "#f0c040"; e.target.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.target.style.background = "#d4a017"; e.target.style.transform = "translateY(0)"; }}
          >
            Browse Results
          </button>
          <a href="#donate" onClick={e => { e.preventDefault(); document.getElementById("donate")?.scrollIntoView({ behavior: "smooth" }); }} style={{
            background: "transparent", color: "#d4a017",
            border: "1px solid rgba(212,160,23,0.4)",
            borderRadius: 8, padding: "14px 36px", fontSize: 16,
            fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            textDecoration: "none", display: "inline-block", transition: "all 0.2s"
          }}
            onMouseEnter={e => { e.target.style.borderColor = "#d4a017"; e.target.style.background = "rgba(212,160,23,0.08)"; }}
            onMouseLeave={e => { e.target.style.borderColor = "rgba(212,160,23,0.4)"; e.target.style.background = "transparent"; }}
          >
            Support Us
          </a>
        </div>

        <div style={{ display: "flex", gap: 48, justifyContent: "center", marginTop: 72, flexWrap: "wrap" }}>
          {[["13+", "Years of Results"], ["500+", "Regattas Archived"]].map(([num, label]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.2rem", fontWeight: 700, color: "#d4a017" }}>{num}</div>
              <div style={{ color: "#4a6b4a", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
        <Wave />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;600;700&family=DM+Mono:wght@400;500&display=swap');
        @keyframes wave { from { transform: scaleX(1) translateY(0); } to { transform: scaleX(1.02) translateY(3px); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a1a0a; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #0a1a0a; } ::-webkit-scrollbar-thumb { background: #1a3a1a; border-radius: 3px; }
      `}</style>
    </section>
  );
}
