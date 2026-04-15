import { useState, useEffect } from 'react';
import OarIcon from './OarIcon';
import { REGATTAS } from '../data/regattas';
import { useIsMobile } from '../hooks/useIsMobile';

const MONTH_SHORT = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };

function parseFirstDate(str) {
  if (!str) return null;
  const m = str.match(/(\d{1,2})\s*(–|-|&)?\s*\d*\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/);
  if (m) return new Date(+m[4], MONTH_SHORT[m[3]], +m[1]);
  const m2 = str.match(/(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/);
  if (m2) return new Date(+m2[3], MONTH_SHORT[m2[2]], +m2[1]);
  return null;
}

function getNextRegatta() {
  const now = new Date();
  const all = Object.values(REGATTAS).flat()
    .map(r => ({ ...r, _date: parseFirstDate(r.date) }))
    .filter(r => r._date && r._date >= now)
    .sort((a, b) => a._date - b._date);
  return all[0] || null;
}

function useCountdown(target) {
  const [diff, setDiff] = useState(target ? target - Date.now() : 0);
  useEffect(() => {
    if (!target) return;
    const id = setInterval(() => setDiff(target - Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);
  if (!target || diff <= 0) return null;
  const total = Math.floor(diff / 1000);
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

function Wave() {
  return (
    <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: 80 }}>
      <path fill="#0a1a0a" d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" />
    </svg>
  );
}

function SAFlag({ width = 120, style = {} }) {
  const W = 300, H = 200, cx = 110, cy = H / 2;
  const pall = (h) =>
    `0,0 0,${H} ${cx},${cy + h} ${W},${cy + h} ${W},${cy - h} ${cx},${cy - h}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={width} height={width * (H / W)} style={{ display: 'block', ...style }}>
      <rect x={0} y={0} width={W} height={cy} fill="#DE3831" />
      <rect x={0} y={cy} width={W} height={cy} fill="#002395" />
      <polygon points={pall(40)} fill="#FFFFFF" />
      <polygon points={pall(33)} fill="#007A4D" />
      <polygon points={pall(21)} fill="#FFB612" />
      <polygon points={`0,0 0,${H} ${cx},${cy}`} fill="#000000" />
    </svg>
  );
}

export default function HeroSection({ onBrowse }) {
  const isMobile = useIsMobile();
  const nextRegatta = getNextRegatta();
  const countdown = useCountdown(nextRegatta?._date?.getTime());

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

      {/* SA flag watermark — smaller on mobile */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none", opacity: 0.055, filter: "blur(1.5px)",
      }}>
        <SAFlag width={isMobile ? 320 : 600} />
      </div>

      <div style={{
        position: "absolute", width: isMobile ? 300 : 600, height: isMobile ? 200 : 400,
        borderRadius: "50%", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        background: "radial-gradient(ellipse, rgba(212,160,23,0.07) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />

      <div style={{
        position: "relative", textAlign: "center",
        padding: isMobile ? "80px 20px 40px" : "0 24px",
        maxWidth: 800, width: "100%",
      }}>
        {/* Badge row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20 }}>
          <div style={{
            borderRadius: 4, overflow: "hidden",
            boxShadow: "0 2px 12px rgba(0,0,0,0.6)",
            border: "1px solid rgba(255,255,255,0.1)", flexShrink: 0,
          }}>
            <SAFlag width={isMobile ? 28 : 36} />
          </div>
          <span style={{
            color: "#d4a017", fontFamily: "'DM Mono', monospace",
            fontSize: isMobile ? 10 : 13,
            letterSpacing: isMobile ? "0.15em" : "0.25em",
            textTransform: "uppercase",
          }}>
            South African Rowing
          </span>
          <OarIcon />
        </div>

        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "clamp(2.6rem, 8vw, 6.5rem)",
          fontWeight: 900, lineHeight: 1.0,
          color: "#f5f0e0", margin: "0 0 8px",
          textShadow: "0 0 80px rgba(212,160,23,0.3)"
        }}>Regatta</h1>
        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "clamp(2.6rem, 8vw, 6.5rem)",
          fontWeight: 900, lineHeight: 1.0,
          background: "linear-gradient(90deg, #d4a017, #f0c040, #fde68a)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          margin: "0 0 24px"
        }}>Results</h1>

        <p style={{
          color: "#94a3b8", fontSize: "clamp(0.9rem, 2.5vw, 1.2rem)",
          lineHeight: 1.7, maxWidth: 560, margin: "0 auto 36px",
          fontFamily: "'DM Sans', sans-serif",
          padding: isMobile ? "0 4px" : 0,
        }}>
          The home of South African competitive rowing results — from school regattas to national championships, all in one place.
        </p>

        {/* CTA buttons — stack on mobile */}
        <div style={{
          display: "flex", gap: 12,
          justifyContent: "center",
          flexDirection: isMobile ? "column" : "row",
          alignItems: "center",
        }}>
          <button onClick={onBrowse} style={{
            background: "#d4a017", color: "#030a03", border: "none",
            borderRadius: 8, padding: isMobile ? "14px 0" : "14px 36px",
            fontSize: 16, fontWeight: 700, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.02em",
            transition: "all 0.2s", boxShadow: "0 0 40px rgba(212,160,23,0.3)",
            width: isMobile ? "100%" : "auto",
          }}
            onMouseEnter={e => { e.target.style.background = "#f0c040"; e.target.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.target.style.background = "#d4a017"; e.target.style.transform = "translateY(0)"; }}
          >
            Browse Results
          </button>
          <a href="#donate" onClick={e => { e.preventDefault(); document.getElementById("donate")?.scrollIntoView({ behavior: "smooth" }); }} style={{
            background: "transparent", color: "#d4a017",
            border: "1px solid rgba(212,160,23,0.4)",
            borderRadius: 8, padding: isMobile ? "14px 0" : "14px 36px",
            fontSize: 16, fontWeight: 600, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", textDecoration: "none",
            display: isMobile ? "block" : "inline-block",
            width: isMobile ? "100%" : "auto",
            transition: "all 0.2s", boxSizing: "border-box",
          }}
            onMouseEnter={e => { e.target.style.borderColor = "#d4a017"; e.target.style.background = "rgba(212,160,23,0.08)"; }}
            onMouseLeave={e => { e.target.style.borderColor = "rgba(212,160,23,0.4)"; e.target.style.background = "transparent"; }}
          >
            Support Us
          </a>
        </div>

        {/* Countdown */}
        {countdown && nextRegatta && (
          <div style={{ marginTop: 36 }}>
            <div style={{
              color: '#4a6b4a', fontFamily: "'DM Mono', monospace",
              fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase',
              marginBottom: 10, textAlign: 'center',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              Next · {nextRegatta.name}
            </div>
            <div style={{ display: 'flex', gap: isMobile ? 6 : 10, justifyContent: 'center' }}>
              {[
                [countdown.days,    'Days'],
                [countdown.hours,   'Hrs'],
                [countdown.minutes, 'Min'],
                [countdown.seconds, 'Sec'],
              ].map(([val, label]) => (
                <div key={label} style={{
                  background: 'rgba(10,26,10,0.8)', border: '1px solid #1a3a1a',
                  borderRadius: 10,
                  padding: isMobile ? '10px 12px' : '12px 16px',
                  minWidth: isMobile ? 0 : 60,
                  flex: isMobile ? 1 : 'none',
                  textAlign: 'center', backdropFilter: 'blur(8px)',
                }}>
                  <div style={{
                    color: '#d4a017', fontFamily: "'Playfair Display', serif",
                    fontSize: isMobile ? '1.3rem' : '1.6rem',
                    fontWeight: 700, lineHeight: 1,
                  }}>
                    {String(val).padStart(2, '0')}
                  </div>
                  <div style={{
                    color: '#2d5a1b', fontFamily: "'DM Mono', monospace",
                    fontSize: 9, letterSpacing: '0.1em',
                    textTransform: 'uppercase', marginTop: 4,
                  }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats row */}
        <div style={{
          display: "flex", gap: isMobile ? 24 : 48,
          justifyContent: "center", marginTop: 36, flexWrap: "wrap",
        }}>
          {[["13+", "Years of Results"], ["500+", "Regattas Archived"]].map(([num, label]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: isMobile ? "1.8rem" : "2.2rem",
                fontWeight: 700, color: "#d4a017",
              }}>{num}</div>
              <div style={{
                color: "#4a6b4a", fontSize: 11,
                letterSpacing: "0.1em", textTransform: "uppercase",
                fontFamily: "'DM Mono', monospace",
              }}>{label}</div>
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
        html, body { background: #0a1a0a; overflow-x: hidden; width: 100%; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #0a1a0a; } ::-webkit-scrollbar-thumb { background: #1a3a1a; border-radius: 3px; }
      `}</style>
    </section>
  );
}
