import { useState } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import { CHAMP_YEARS, CHAMP_DATA } from '../data/championshipPoints';

const CATEGORIES = [
  { key: 'boys',  label: 'Boys' },
  { key: 'girls', label: 'Girls' },
  { key: 'coed',  label: 'Co-ed' },
  { key: 'clubs', label: 'Clubs' },
];

const MEDAL = { 0: '#d4a017', 1: '#9ca3af', 2: '#a0522d' };
const MEDAL_BG = { 0: 'rgba(212,160,23,0.08)', 1: 'rgba(156,163,175,0.06)', 2: 'rgba(160,82,45,0.07)' };

function Sparkline({ data, years, width = 80, height = 24 }) {
  const vals = years.map(y => data[y] ?? 0).filter(v => v > 0);
  if (vals.length < 2) return null;
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  const range = max - min || 1;
  const pts = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={width} height={height} style={{ flexShrink: 0 }}>
      <polyline points={pts} fill="none" stroke="#d4a017" strokeWidth="1.5" strokeLinejoin="round" opacity="0.6" />
    </svg>
  );
}

function TrendBadge({ current, previous }) {
  if (!previous || !current) return null;
  const diff = current - previous;
  if (diff === 0) return <span style={{ color: '#4a6b4a', fontFamily: "'DM Mono', monospace", fontSize: 11 }}>—</span>;
  const up = diff > 0;
  return (
    <span style={{ color: up ? '#4ade80' : '#f87171', fontFamily: "'DM Mono', monospace", fontSize: 11, whiteSpace: 'nowrap' }}>
      {up ? '↑' : '↓'}{Math.abs(diff)}
    </span>
  );
}

function HeadToHeadChart({ sA, sB, years, width = 480, height = 180 }) {
  if (!sA || !sB || years.length < 2) return null;

  const PAD = { top: 16, right: 16, bottom: 28, left: 36 };
  const W = width - PAD.left - PAD.right;
  const H = height - PAD.top - PAD.bottom;

  const allVals = years.flatMap(y => [sA.points[y] || 0, sB.points[y] || 0]);
  const max = Math.max(...allVals, 1);

  const px = i => PAD.left + (i / Math.max(years.length - 1, 1)) * W;
  const py = v => PAD.top + H - ((v / max) * H);

  const ptsA = years.map((y, i) => `${px(i)},${py(sA.points[y] || 0)}`).join(' ');
  const ptsB = years.map((y, i) => `${px(i)},${py(sB.points[y] || 0)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', maxWidth: width, display: 'block' }}>
      {/* Gridlines */}
      {[0.25, 0.5, 0.75, 1].map(frac => {
        const y = PAD.top + H - frac * H;
        return (
          <g key={frac}>
            <line x1={PAD.left} y1={y} x2={PAD.left + W} y2={y} stroke="#1a3a1a" strokeWidth="1" />
            <text x={PAD.left - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#4a6b4a">
              {Math.round(max * frac)}
            </text>
          </g>
        );
      })}
      {/* School A (gold) */}
      <polyline points={ptsA} fill="none" stroke="#d4a017" strokeWidth="2.5" strokeLinejoin="round" />
      {years.map((y, i) => (
        <circle key={`a${y}`} cx={px(i)} cy={py(sA.points[y] || 0)} r="3.5" fill="#d4a017" />
      ))}
      {/* School B (green) */}
      <polyline points={ptsB} fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinejoin="round" />
      {years.map((y, i) => (
        <circle key={`b${y}`} cx={px(i)} cy={py(sB.points[y] || 0)} r="3.5" fill="#4ade80" />
      ))}
      {/* X-axis labels */}
      {years.map((y, i) => (
        <text key={y} x={px(i)} y={height - 6} textAnchor="middle" fontSize="9" fill="#4a6b4a">{y}</text>
      ))}
    </svg>
  );
}

export default function ChampionshipPoints() {
  const isMobile = useIsMobile();
  const [category, setCategory] = useState('boys');
  const [year, setYear] = useState(2025);
  const [compareMode, setCompareMode] = useState(false);
  const [schoolA, setSchoolA] = useState('');
  const [schoolB, setSchoolB] = useState('');

  const schools = CHAMP_DATA[category];
  const availYears = CHAMP_YEARS.filter(y =>
    schools.some(s => s.points[y] != null && s.points[y] > 0)
  );
  const prevYear = availYears[availYears.indexOf(year) - 1];

  const schoolNames = schools.map(s => s.school).sort();
  const dataA = schools.find(s => s.school === schoolA);
  const dataB = schools.find(s => s.school === schoolB);

  const ranked = [...schools]
    .map(s => ({ ...s, pts: s.points[year] ?? 0 }))
    .filter(s => s.pts > 0)
    .sort((a, b) => b.pts - a.pts);

  const maxPts = ranked[0]?.pts || 1;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? '24px 16px' : '32px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <span style={{ color: '#d4a017', fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          SA Schools Championships
        </span>
        <h2 style={{ fontFamily: "'Playfair Display', serif", color: '#f5f0e0', fontSize: isMobile ? '1.8rem' : '2.2rem', margin: '8px 0 4px' }}>
          Championship Standings
        </h2>
        <p style={{ color: '#6b7c6b', fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
          Cumulative points per school at SA Schools Champs, 2012–2025.
        </p>
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {CATEGORIES.map(({ key, label }) => (
          <button key={key} onClick={() => { setCategory(key); setYear(availYears[availYears.length - 1] || 2025); setSchoolA(''); setSchoolB(''); }} style={{
            background: category === key ? '#d4a017' : '#0f220f',
            color: category === key ? '#030a03' : '#6b7c6b',
            border: category === key ? 'none' : '1px solid #1a3a1a',
            borderRadius: 8, padding: '7px 20px', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', fontFamily: "'DM Mono', monospace", transition: 'all 0.15s',
          }}>{label}</button>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={() => setCompareMode(m => !m)} style={{
          background: compareMode ? 'rgba(74,222,128,0.1)' : '#0f220f',
          color: compareMode ? '#4ade80' : '#6b7c6b',
          border: `1px solid ${compareMode ? 'rgba(74,222,128,0.4)' : '#1a3a1a'}`,
          borderRadius: 8, padding: '7px 16px', fontSize: 12, fontWeight: 700,
          cursor: 'pointer', fontFamily: "'DM Mono', monospace", transition: 'all 0.15s',
          letterSpacing: '0.08em',
        }}>⚔ Compare</button>
      </div>

      {/* Head-to-head compare view */}
      {compareMode && (
        <div style={{ background: '#0f220f', border: '1px solid #1e4a1e', borderRadius: 16, padding: isMobile ? 16 : 24, marginBottom: 28 }}>
          <p style={{ color: '#4a6b4a', fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
            Head-to-Head Comparison
          </p>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexDirection: isMobile ? 'column' : 'row' }}>
            <div style={{ flex: 1 }}>
              <label style={{ color: '#d4a017', fontFamily: "'DM Mono', monospace", fontSize: 11, display: 'block', marginBottom: 6 }}>School A</label>
              <select value={schoolA} onChange={e => setSchoolA(e.target.value)} style={{
                background: '#0a1a0a', border: '1px solid #d4a01740', borderRadius: 8,
                padding: '8px 12px', color: '#e8e0c8', fontFamily: "'DM Sans', sans-serif",
                fontSize: 14, width: '100%', outline: 'none', cursor: 'pointer',
              }}>
                <option value="">Select school…</option>
                {schoolNames.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ color: '#4ade80', fontFamily: "'DM Mono', monospace", fontSize: 11, display: 'block', marginBottom: 6 }}>School B</label>
              <select value={schoolB} onChange={e => setSchoolB(e.target.value)} style={{
                background: '#0a1a0a', border: '1px solid #4ade8040', borderRadius: 8,
                padding: '8px 12px', color: '#e8e0c8', fontFamily: "'DM Sans', sans-serif",
                fontSize: 14, width: '100%', outline: 'none', cursor: 'pointer',
              }}>
                <option value="">Select school…</option>
                {schoolNames.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {dataA && dataB ? (
            <div>
              {/* Legend */}
              <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
                <span style={{ color: '#d4a017', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600 }}>
                  ● {schoolA} — {dataA.points[year] ?? 0} pts ({year})
                </span>
                <span style={{ color: '#4ade80', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600 }}>
                  ● {schoolB} — {dataB.points[year] ?? 0} pts ({year})
                </span>
              </div>
              <HeadToHeadChart sA={dataA} sB={dataB} years={availYears} />
            </div>
          ) : (
            <p style={{ color: '#2d5a1b', fontFamily: "'DM Sans', sans-serif", fontSize: 14, textAlign: 'center', padding: '24px 0' }}>
              Select two schools above to compare their performance over time.
            </p>
          )}
        </div>
      )}

      {/* Year tabs — scrollable */}
      <div style={{ overflowX: 'auto', marginBottom: 28, WebkitOverflowScrolling: 'touch' }}>
        <div style={{ display: 'flex', gap: 6, width: 'max-content', paddingBottom: 8 }}>
          {availYears.map(y => (
            <button key={y} onClick={() => setYear(y)} style={{
              background: year === y ? '#1a3a1a' : 'transparent',
              color: year === y ? '#d4a017' : '#4a6b4a',
              border: year === y ? '1px solid #2d5a1b' : '1px solid #1a3a1a',
              borderRadius: 6, padding: '5px 14px', fontSize: 13,
              fontWeight: year === y ? 700 : 400, cursor: 'pointer',
              fontFamily: "'DM Mono', monospace", transition: 'all 0.15s', whiteSpace: 'nowrap',
            }}>{y}</button>
          ))}
        </div>
      </div>

      {/* Podium — top 3 */}
      {ranked.length >= 3 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
          {[ranked[1], ranked[0], ranked[2]].map((s, i) => {
            const realRank = i === 1 ? 0 : i === 0 ? 1 : 2;
            const height = realRank === 0 ? 100 : realRank === 1 ? 80 : 70;
            return (
              <div key={s.school} style={{
                background: `linear-gradient(145deg, ${MEDAL_BG[realRank]}, #0a1a0a)`,
                border: `1px solid ${MEDAL[realRank]}40`,
                borderRadius: 14, padding: isMobile ? '16px 10px' : '20px 16px',
                textAlign: 'center', position: 'relative',
                marginTop: realRank === 0 ? 0 : realRank === 1 ? 20 : 30,
              }}>
                <div style={{ color: MEDAL[realRank], fontFamily: "'Playfair Display', serif", fontSize: isMobile ? '1.6rem' : '2rem', fontWeight: 700, lineHeight: 1 }}>
                  {s.pts}
                </div>
                <div style={{ color: '#f5f0e0', fontFamily: "'DM Sans', sans-serif", fontSize: isMobile ? 12 : 13, fontWeight: 600, margin: '6px 0 4px' }}>
                  {s.school}
                </div>
                <div style={{ color: MEDAL[realRank], fontFamily: "'DM Mono', monospace", fontSize: 18 }}>
                  {realRank === 0 ? '🥇' : realRank === 1 ? '🥈' : '🥉'}
                </div>
                {prevYear && (
                  <div style={{ marginTop: 6 }}>
                    <TrendBadge current={s.pts} previous={s.points[prevYear]} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Full rankings list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {ranked.map((s, i) => {
          const medalColor = MEDAL[i];
          const pct = (s.pts / maxPts) * 100;
          return (
            <div key={s.school} style={{
              background: i < 3 ? `linear-gradient(145deg, ${MEDAL_BG[i]}, #0a1a0a)` : 'linear-gradient(145deg, #0f220f, #0a1a0a)',
              border: `1px solid ${i < 3 ? `${MEDAL[i]}30` : '#1a3a1a'}`,
              borderRadius: 10, padding: isMobile ? '12px 14px' : '12px 20px',
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              {/* Rank */}
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: medalColor ? `${medalColor}20` : 'transparent',
                border: `1px solid ${medalColor || '#1a3a1a'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: medalColor || '#4a6b4a', fontFamily: "'DM Mono', monospace",
                fontSize: 12, fontWeight: 700,
              }}>{i + 1}</div>

              {/* School name + bar */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#f5f0e0', fontFamily: "'DM Sans', sans-serif", fontSize: isMobile ? 13 : 14, fontWeight: 600, marginBottom: 4 }}>
                  {s.school}
                </div>
                <div style={{ background: '#0a1a0a', borderRadius: 3, height: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: medalColor || '#1a3a1a', borderRadius: 3, transition: 'width 0.4s' }} />
                </div>
              </div>

              {/* Sparkline — desktop only */}
              {!isMobile && (
                <Sparkline data={s.points} years={availYears} />
              )}

              {/* Points */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ color: medalColor || '#e8e0c8', fontFamily: "'DM Mono', monospace", fontSize: isMobile ? 15 : 17, fontWeight: 700 }}>
                  {s.pts}
                </div>
                {prevYear && (
                  <TrendBadge current={s.pts} previous={s.points[prevYear]} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {ranked.length === 0 && (
        <div style={{ textAlign: 'center', padding: 48, color: '#4a6b4a', fontFamily: "'DM Sans', sans-serif" }}>
          No data for {year}.
        </div>
      )}

      <p style={{ color: '#1a3a1a', fontFamily: "'DM Mono', monospace", fontSize: 11, marginTop: 32, textAlign: 'center' }}>
        Data sourced from rowsa.co.za · Championship points exclude 2021 (no event held)
      </p>
    </div>
  );
}
