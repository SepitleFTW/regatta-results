import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { REGATTAS } from '../data/regattas';
import StatusBadge from './StatusBadge';
import { useIsMobile } from '../hooks/useIsMobile';
import { useWeather } from '../hooks/useWeather';
import { useScrollRestoration, saveScrollNow } from '../hooks/useScrollRestoration';
import BellButton from './BellButton';

function WeatherBadge({ location }) {
  const weather = useWeather(location);
  if (!weather) return null;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 4,
      color: 'var(--t-muted)', fontFamily: "'DM Mono', monospace", fontSize: 11,
      background: 'var(--t-bg)', border: '1px solid var(--t-border-s)', borderRadius: 6,
      padding: '3px 8px', flexShrink: 0, whiteSpace: 'nowrap',
    }}>
      <span>{weather.icon}</span>
      <span style={{ color: 'var(--t-text2)' }}>{weather.temp}°</span>
      <span>·</span>
      <span>{weather.windKph}km/h {weather.windDir}</span>
    </div>
  );
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTH_SHORT = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };

function parseDate(str) {
  if (!str) return null;
  let m = str.match(/(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/);
  if (m) return new Date(+m[3], MONTH_SHORT[m[2]], +m[1]);
  m = str.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/);
  if (m) return new Date(+m[2], MONTH_SHORT[m[1]], 1);
  return null;
}

export default function RegattaCalendar() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  useScrollRestoration();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());

  const regattas = (REGATTAS[year] || [])
    .map(r => ({ ...r, _date: parseDate(r.date) }))
    .filter(r => r._date)
    .sort((a, b) => a._date - b._date);

  const byMonth = {};
  for (const r of regattas) {
    const m = r._date.getMonth();
    if (!byMonth[m]) byMonth[m] = [];
    byMonth[m].push(r);
  }

  const upcomingCount = regattas.filter(r => r._date >= now).length;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? '24px 16px' : '32px 24px' }}>
      <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row', gap: 12, marginBottom: 8 }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", color: 'var(--t-text)', fontSize: isMobile ? '1.8rem' : '2.2rem', margin: 0 }}>
          Calendar
        </h2>
        <a
          href="/calendar.ics"
          download
          title="Add to calendar app"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'var(--t-bg-card)', border: '1px solid var(--t-border-s)',
            borderRadius: 8, padding: '7px 14px', textDecoration: 'none',
            color: 'var(--t-gold)', fontFamily: "'DM Mono', monospace", fontSize: 12,
            fontWeight: 600, whiteSpace: 'nowrap', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--t-gold)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--t-border-s)'; }}
        >
          ⬇ Subscribe to Calendar
        </a>
      </div>
      <p style={{ color: 'var(--t-muted)', marginBottom: 24, fontFamily: "'DM Sans', sans-serif", fontSize: isMobile ? 14 : 16 }}>
        South African rowing regattas by season.
      </p>

      {/* Year tabs */}
      <div style={{ overflowX: 'auto', marginBottom: 28, borderBottom: '1px solid var(--t-border-s)', paddingBottom: 16, WebkitOverflowScrolling: 'touch' }}>
        <div style={{ display: 'flex', gap: 6, width: 'max-content' }}>
          {[2026, 2025, 2024].map(y => (
            <button key={y} onClick={() => setYear(y)} style={{
              background: year === y ? 'var(--t-gold)' : 'transparent',
              color: year === y ? 'var(--t-bg-deep)' : 'var(--t-muted)',
              border: year === y ? 'none' : '1px solid var(--t-border-s)',
              borderRadius: 8, padding: '7px 18px', fontSize: 14,
              fontWeight: year === y ? 700 : 500, cursor: 'pointer',
              fontFamily: "'DM Mono', monospace", transition: 'all 0.15s', whiteSpace: 'nowrap',
            }}>{y}</button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: isMobile ? 12 : 24, marginBottom: 28, flexWrap: 'wrap' }}>
        {[
          [`${regattas.length}`, 'Total regattas'],
          [`${upcomingCount}`, 'Upcoming'],
          [`${regattas.length - upcomingCount}`, 'Completed'],
        ].map(([num, label]) => (
          <div key={label} style={{ background: 'var(--t-bg-card)', border: '1px solid var(--t-border-s)', borderRadius: 12, padding: '14px 24px' }}>
            <div style={{ color: 'var(--t-gold)', fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', fontWeight: 700 }}>{num}</div>
            <div style={{ color: 'var(--t-dim)', fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</div>
          </div>
        ))}
      </div>

      {regattas.length === 0 && (
        <div style={{ background: 'var(--t-bg-card)', border: '1px dashed var(--t-border-s)', borderRadius: 16, padding: 48, textAlign: 'center', color: 'var(--t-dim)', fontFamily: "'DM Sans', sans-serif" }}>
          No dated regattas found for {year}.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {Object.entries(byMonth).map(([monthIdx, races]) => {
          const isCurrentMonth = now.getMonth() === +monthIdx && now.getFullYear() === year;
          return (
            <div key={monthIdx}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{
                  color: isCurrentMonth ? 'var(--t-gold)' : 'var(--t-vdim)',
                  fontFamily: "'DM Mono', monospace", fontSize: 12,
                  letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600,
                }}>
                  {MONTHS[+monthIdx]}
                  {isCurrentMonth && <span style={{ color: 'var(--t-gold)', marginLeft: 8, fontSize: 10 }}>▶ NOW</span>}
                </span>
                <div style={{ flex: 1, height: 1, background: 'var(--t-border-s)' }} />
                <span style={{ color: 'var(--t-vdim)', fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{races.length}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {races.map(r => {
                  const isPast = r._date < now;
                  const isUpcoming = !isPast;
                  return (
                    <div
                      key={r.id}
                      onClick={() => { saveScrollNow(window.location.pathname); navigate(`/results/${r.id}`, { state: { race: r } }); }}
                      style={{
                        background: 'linear-gradient(145deg, var(--t-bg-card), var(--t-bg))',
                        border: `1px solid ${isUpcoming ? 'var(--t-green-b)' : 'var(--t-border-s)'}`,
                        borderRadius: 12, padding: isMobile ? '12px 14px' : '14px 20px',
                        display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 16, flexWrap: 'wrap',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--t-gold)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = isUpcoming ? 'var(--t-green-b)' : 'var(--t-border-s)'; e.currentTarget.style.transform = ''; }}
                    >
                      {/* Date badge */}
                      <div style={{
                        background: 'var(--t-bg)', border: '1px solid var(--t-border-s)', borderRadius: 8,
                        padding: '6px 10px', textAlign: 'center', flexShrink: 0, minWidth: 44,
                      }}>
                        <div style={{ color: 'var(--t-gold)', fontFamily: "'DM Mono', monospace", fontSize: 16, fontWeight: 700, lineHeight: 1 }}>
                          {r._date.getDate()}
                        </div>
                        <div style={{ color: 'var(--t-dim)', fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                          {MONTHS[r._date.getMonth()].slice(0, 3)}
                        </div>
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: 'var(--t-text)', fontFamily: "'Playfair Display', serif", fontSize: '1rem', marginBottom: 2 }}>
                          {r.name}
                        </div>
                        <div style={{ color: 'var(--t-muted)', fontFamily: "'DM Sans', sans-serif", fontSize: 12, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                          {r.location && <span>📍 {r.location}</span>}
                          {r.province && <span style={{ color: 'var(--t-vdim)', fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{r.province}</span>}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {isUpcoming && r.location && <WeatherBadge location={r.location} />}
                        {isUpcoming && <BellButton watchId={r.id} watchItem={r} size="sm" />}
                        <StatusBadge status={r.status} />
                        <span style={{ color: 'var(--t-gold)', fontFamily: "'DM Mono', monospace", fontSize: 13 }}>→</span>
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
