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
      <polyline points={pts} fill="none" stroke="var(--t-gold)" strokeWidth="1.5" strokeLinejoin="round" opacity="0.6" />
    </svg>
  );
}

function TrendBadge({ current, previous }) {
  if (!previous || !current) return null;
  const diff = current - previous;
  if (diff === 0) return <span style={{ color: 'var(--t-dim)', fontFamily: "'DM Mono', monospace", fontSize: 11 }}>—</span>;
  const up = diff > 0;
  return (
    <span style={{ color: up ? 'var(--t-green)' : 'var(--t-red)', fontFamily: "'DM Mono', monospace", fontSize: 11, whiteSpace: 'nowrap' }}>
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
      {[0.25, 0.5, 0.75, 1].map(frac => {
        const y = PAD.top + H - frac * H;
        return (
          <g key={frac}>
            <line x1={PAD.left} y1={y} x2={PAD.left + W} y2={y} stroke="var(--t-border-s)" strokeWidth="1" />
            <text x={PAD.left - 4} y={y + 4} textAnchor="end" fontSize="9" fill="var(--t-dim)">
              {Math.round(max * frac)}
            </text>
          </g>
        );
      })}
      <polyline points={ptsA} fill="none" stroke="var(--t-gold)" strokeWidth="2.5" strokeLinejoin="round" />
      {years.map((y, i) => (
        <circle key={`a${y}`} cx={px(i)} cy={py(sA.points[y] || 0)} r="3.5" fill="var(--t-gold)" />
      ))}
      <polyline points={ptsB} fill="none" stroke="var(--t-green)" strokeWidth="2.5" strokeLinejoin="round" />
      {years.map((y, i) => (
        <circle key={`b${y}`} cx={px(i)} cy={py(sB.points[y] || 0)} r="3.5" fill="var(--t-green)" />
      ))}
      {years.map((y, i) => (
        <text key={y} x={px(i)} y={height - 6} textAnchor="middle" fontSize="9" fill="var(--t-dim)">{y}</text>
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
      <div style={{ marginBottom: 24 }}>
        <span style={{ color: 'var(--t-gold)', fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          SA Schools Championships
        </span>
        <h2 style={{ fontFamily: "'Playfair Display', serif", color: 'var(--t-text)', fontSize: isMobile ? '1.8rem' : '2.2rem', margin: '8px 0 4px' }}>
          Championship Standings
        </h2>
        <p style={{ color: 'var(--t-muted)', fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
          Cumulative points per school at SA Schools Champs, 2012–2025.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {CATEGORIES.map(({ key, label }) => (
          <button key={key} onClick={() => { setCategory(key); setYear(availYears[availYears.length - 1] || 2025); setSchoolA(''); setSchoolB(''); }} style={{
            background: category === key ? 'var(--t-gold)' : 'var(--t-bg-card)',
            color: category === key ? 'var(--t-bg-deep)' : 'var(--t-muted)',
            border: category === key ? 'none' : '1px solid var(--t-border-s)',
            borderRadius: 8, padding: '7px 20px', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', fontFamily: "'DM Mono', monospace", transition: 'all 0.15s',
          }}>{label}</button>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={() => setCompareMode(m => !m)} style={{
          background: compareMode ? 'var(--t-green-d)' : 'var(--t-bg-card)',
          color: compareMode ? 'var(--t-green)' : 'var(--t-muted)',
          border: `1px solid ${compareMode ? 'var(--t-green-b)' : 'var(--t-border-s)'}`,
          borderRadius: 8, padding: '7px 16px', fontSize: 12, fontWeight: 700,
          cursor: 'pointer', fontFamily: "'DM Mono', monospace", transition: 'all 0.15s',
          letterSpacing: '0.08em',
        }}>⚔ Compare</button>
      </div>

      {compareMode && (
        <div style={{ background: 'var(--t-bg-card)', border: '1px solid var(--t-green-b)', borderRadius: 16, padding: isMobile ? 16 : 24, marginBottom: 28 }}>
          <p style={{ color: 'var(--t-dim)', fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
            Head-to-Head Comparison
          </p>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexDirection: isMobile ? 'column' : 'row' }}>
            <div style={{ flex: 1 }}>
              <label style={{ color: 'var(--t-gold)', fontFamily: "'DM Mono', monospace", fontSize: 11, display: 'block', marginBottom: 6 }}>School A</label>
              <select value={schoolA} onChange={e => setSchoolA(e.target.value)} style={{
                background: 'var(--t-bg)', border: '1px solid var(--t-gold-b)', borderRadius: 8,
                padding: '8px 12px', color: 'var(--t-text2)', fontFamily: "'DM Sans', sans-serif",
                fontSize: 14, width: '100%', outline: 'none', cursor: 'pointer',
              }}>
                <option value="">Select school…</option>
                {schoolNames.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ color: 'var(--t-green)', fontFamily: "'DM Mono', monospace", fontSize: 11, display: 'block', marginBottom: 6 }}>School B</label>
              <select value={schoolB} onChange={e => setSchoolB(e.target.value)} style={{
                background: 'var(--t-bg)', border: '1px solid var(--t-green-b)', borderRadius: 8,
                padding: '8px 12px', color: 'var(--t-text2)', fontFamily: "'DM Sans', sans-serif",
                fontSize: 14, width: '100%', outline: 'none', cursor: 'pointer',
              }}>
                <option value="">Select school…</option>
                {schoolNames.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {dataA && dataB ? (
            <div>
              <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
                <span style={{ color: 'var(--t-gold)', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600 }}>
                  ● {schoolA} — {dataA.points[year] ?? 0} pts ({year})
                </span>
                <span style={{ color: 'var(--t-green)', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600 }}>
                  ● {schoolB} — {dataB.points[year] ?? 0} pts ({year})
                </span>
              </div>
              <HeadToHeadChart sA={dataA} sB={dataB} years={availYears} />
            </div>
          ) : (
            <p style={{ color: 'var(--t-vdim)', fontFamily: "'DM Sans', sans-serif", fontSize: 14, textAlign: 'center', padding: '24px 0' }}>
              Select two schools above to compare their performance over time.
            </p>
          )}
        </div>
      )}

      <div style={{ overflowX: 'auto', marginBottom: 28, WebkitOverflowScrolling: 'touch' }}>
        <div style={{ display: 'flex', gap: 6, width: 'max-content', paddingBottom: 8 }}>
          {availYears.map(y => (
            <button key={y} onClick={() => setYear(y)} style={{
              background: year === y ? 'var(--t-border-s)' : 'transparent',
              color: year === y ? 'var(--t-gold)' : 'var(--t-dim)',
              border: `1px solid ${year === y ? 'var(--t-vdim)' : 'var(--t-border-s)'}`,
              borderRadius: 6, padding: '5px 14px', fontSize: 13,
              fontWeight: year === y ? 700 : 400, cursor: 'pointer',
              fontFamily: "'DM Mono', monospace", transition: 'all 0.15s', whiteSpace: 'nowrap',
            }}>{y}</button>
          ))}
        </div>
      </div>

      {ranked.length >= 3 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
          {[ranked[1], ranked[0], ranked[2]].map((s, i) => {
            const realRank = i === 1 ? 0 : i === 0 ? 1 : 2;
            return (
              <div key={s.school} style={{
                background: `linear-gradient(145deg, ${MEDAL_BG[realRank]}, var(--t-bg))`,
                border: `1px solid ${MEDAL[realRank]}40`,
                borderRadius: 14, padding: isMobile ? '16px 10px' : '20px 16px',
                textAlign: 'center', position: 'relative',
                marginTop: realRank === 0 ? 0 : realRank === 1 ? 20 : 30,
              }}>
                <div style={{ color: MEDAL[realRank], fontFamily: "'Playfair Display', serif", fontSize: isMobile ? '1.6rem' : '2rem', fontWeight: 700, lineHeight: 1 }}>
                  {s.pts}
                </div>
                <div style={{ color: 'var(--t-text)', fontFamily: "'DM Sans', sans-serif", fontSize: isMobile ? 12 : 13, fontWeight: 600, margin: '6px 0 4px' }}>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {ranked.map((s, i) => {
          const medalColor = MEDAL[i];
          const pct = (s.pts / maxPts) * 100;
          return (
            <div key={s.school} style={{
              background: i < 3 ? `linear-gradient(145deg, ${MEDAL_BG[i]}, var(--t-bg))` : 'linear-gradient(145deg, var(--t-bg-card), var(--t-bg))',
              border: `1px solid ${i < 3 ? `${MEDAL[i]}30` : 'var(--t-border-s)'}`,
              borderRadius: 10, padding: isMobile ? '12px 14px' : '12px 20px',
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: medalColor ? `${medalColor}20` : 'transparent',
                border: `1px solid ${medalColor || 'var(--t-border-s)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: medalColor || 'var(--t-dim)', fontFamily: "'DM Mono', monospace",
                fontSize: 12, fontWeight: 700,
              }}>{i + 1}</div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: 'var(--t-text)', fontFamily: "'DM Sans', sans-serif", fontSize: isMobile ? 13 : 14, fontWeight: 600, marginBottom: 4 }}>
                  {s.school}
                </div>
                <div style={{ background: 'var(--t-bg)', borderRadius: 3, height: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: medalColor || 'var(--t-border-s)', borderRadius: 3, transition: 'width 0.4s' }} />
                </div>
              </div>

              {!isMobile && <Sparkline data={s.points} years={availYears} />}

              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ color: medalColor || 'var(--t-text2)', fontFamily: "'DM Mono', monospace", fontSize: isMobile ? 15 : 17, fontWeight: 700 }}>
                  {s.pts}
                </div>
                {prevYear && <TrendBadge current={s.pts} previous={s.points[prevYear]} />}
              </div>
            </div>
          );
        })}
      </div>

      {ranked.length === 0 && (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--t-dim)', fontFamily: "'DM Sans', sans-serif" }}>
          No data for {year}.
        </div>
      )}

      <p style={{ color: 'var(--t-vdim)', fontFamily: "'DM Mono', monospace", fontSize: 11, marginTop: 32, textAlign: 'center' }}>
        Data sourced from rowsa.co.za · Championship points exclude 2021 (no event held)
      </p>
    </div>
  );
}
