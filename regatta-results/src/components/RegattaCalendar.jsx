import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { REGATTAS } from '../data/regattas';
import StatusBadge from './StatusBadge';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTH_SHORT = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };

function parseDate(str) {
  if (!str) return null;
  // "17 Jan 2026" or "6–8 Mar 2026" or "28 Feb – 2 Mar 2025"
  let m = str.match(/(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/);
  if (m) return new Date(+m[3], MONTH_SHORT[m[2]], +m[1]);
  // "Jan 2026"
  m = str.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/);
  if (m) return new Date(+m[2], MONTH_SHORT[m[1]], 1);
  return null;
}

export default function RegattaCalendar() {
  const navigate = useNavigate();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());

  const regattas = (REGATTAS[year] || [])
    .map(r => ({ ...r, _date: parseDate(r.date) }))
    .filter(r => r._date)
    .sort((a, b) => a._date - b._date);

  // Group by month
  const byMonth = {};
  for (const r of regattas) {
    const m = r._date.getMonth();
    if (!byMonth[m]) byMonth[m] = [];
    byMonth[m].push(r);
  }

  const upcomingCount = regattas.filter(r => r._date >= now).length;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", color: '#f5f0e0', fontSize: '2.2rem', marginBottom: 8 }}>
        Calendar
      </h2>
      <p style={{ color: '#6b7c6b', marginBottom: 32, fontFamily: "'DM Sans', sans-serif" }}>
        South African rowing regattas by season.
      </p>

      {/* Year tabs */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 32, borderBottom: '1px solid #1a3a1a', paddingBottom: 16 }}>
        {[2026, 2025, 2024].map(y => (
          <button key={y} onClick={() => setYear(y)} style={{
            background: year === y ? '#d4a017' : 'transparent',
            color: year === y ? '#030a03' : '#6b7c6b',
            border: year === y ? 'none' : '1px solid #1a3a1a',
            borderRadius: 8, padding: '7px 18px', fontSize: 14,
            fontWeight: year === y ? 700 : 500, cursor: 'pointer',
            fontFamily: "'DM Mono', monospace", transition: 'all 0.15s',
          }}>{y}</button>
        ))}
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 32, flexWrap: 'wrap' }}>
        {[
          [`${regattas.length}`, 'Total regattas'],
          [`${upcomingCount}`, 'Upcoming'],
          [`${regattas.length - upcomingCount}`, 'Completed'],
        ].map(([num, label]) => (
          <div key={label} style={{ background: '#0f220f', border: '1px solid #1a3a1a', borderRadius: 12, padding: '14px 24px' }}>
            <div style={{ color: '#d4a017', fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', fontWeight: 700 }}>{num}</div>
            <div style={{ color: '#4a6b4a', fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</div>
          </div>
        ))}
      </div>

      {regattas.length === 0 && (
        <div style={{ background: '#0f220f', border: '1px dashed #1a3a1a', borderRadius: 16, padding: 48, textAlign: 'center', color: '#4a6b4a', fontFamily: "'DM Sans', sans-serif" }}>
          No dated regattas found for {year}.
        </div>
      )}

      {/* Months */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {Object.entries(byMonth).map(([monthIdx, races]) => {
          const isCurrentMonth = now.getMonth() === +monthIdx && now.getFullYear() === year;
          return (
            <div key={monthIdx}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12,
              }}>
                <span style={{
                  color: isCurrentMonth ? '#d4a017' : '#2d5a1b',
                  fontFamily: "'DM Mono', monospace", fontSize: 12,
                  letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600,
                }}>
                  {MONTHS[+monthIdx]}
                  {isCurrentMonth && <span style={{ color: '#d4a017', marginLeft: 8, fontSize: 10 }}>▶ NOW</span>}
                </span>
                <div style={{ flex: 1, height: 1, background: '#1a3a1a' }} />
                <span style={{ color: '#2d5a1b', fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{races.length}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {races.map(r => {
                  const isPast = r._date < now;
                  const isUpcoming = !isPast;
                  return (
                    <div
                      key={r.id}
                      onClick={() => r.status !== 'Upcoming' && navigate(`/results/${r.id}`, { state: { race: r } })}
                      style={{
                        background: isUpcoming ? 'linear-gradient(145deg, #122612, #0f220f)' : 'linear-gradient(145deg, #0f220f, #0a1a0a)',
                        border: `1px solid ${isUpcoming ? '#1e4a1e' : '#1a3a1a'}`,
                        borderRadius: 12, padding: '14px 20px',
                        display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
                        cursor: r.status !== 'Upcoming' ? 'pointer' : 'default',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { if (r.status !== 'Upcoming') { e.currentTarget.style.borderColor = '#d4a017'; e.currentTarget.style.transform = 'translateX(4px)'; } }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = isUpcoming ? '#1e4a1e' : '#1a3a1a'; e.currentTarget.style.transform = ''; }}
                    >
                      {/* Date badge */}
                      <div style={{
                        background: '#0a1a0a', border: '1px solid #1a3a1a', borderRadius: 8,
                        padding: '6px 10px', textAlign: 'center', flexShrink: 0, minWidth: 44,
                      }}>
                        <div style={{ color: '#d4a017', fontFamily: "'DM Mono', monospace", fontSize: 16, fontWeight: 700, lineHeight: 1 }}>
                          {r._date.getDate()}
                        </div>
                        <div style={{ color: '#4a6b4a', fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                          {MONTHS[r._date.getMonth()].slice(0, 3)}
                        </div>
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: '#f5f0e0', fontFamily: "'Playfair Display', serif", fontSize: '1rem', marginBottom: 2 }}>
                          {r.name}
                        </div>
                        <div style={{ color: '#6b7c6b', fontFamily: "'DM Sans', sans-serif", fontSize: 12, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                          {r.location && <span>📍 {r.location}</span>}
                          {r.province && <span style={{ color: '#2d5a1b', fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{r.province}</span>}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                        <StatusBadge status={r.status} />
                        {r.status !== 'Upcoming' && (
                          <span style={{ color: '#d4a017', fontFamily: "'DM Mono', monospace", fontSize: 13 }}>→</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
