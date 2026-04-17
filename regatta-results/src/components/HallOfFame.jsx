import { useState } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import { HOF_YEARS, HOF_DATA } from '../data/hallOfFame';

const SCHOOL_COLORS = {
  "St Benedict's": '#d4a017',
  "St Alban's":    '#4ade80',
  "St Andrew's":   '#60a5fa',
  "St Mary's":     '#f472b6',
  "St John's":     '#a78bfa',
  'KES':           '#fb923c',
  'St Stithians':  '#34d399',
  'Bishops':       '#f87171',
  'Holy Rosary':   '#e879f9',
  'Hilton':        '#facc15',
  'Rondebosch':    '#38bdf8',
  'SACS':          '#a3e635',
  'Clarendon':     '#fb7185',
  'Jeppe':         '#94a3b8',
};

function schoolColor(school) {
  for (const [key, color] of Object.entries(SCHOOL_COLORS)) {
    if (school?.includes(key.replace("'s", '').replace("'", ''))) return color;
    if (school === key) return color;
  }
  return 'var(--t-muted)';
}

function SchoolBadge({ school }) {
  const color = schoolColor(school);
  return (
    <span style={{
      display: 'inline-block',
      background: `${color}18`,
      border: `1px solid ${color}40`,
      color,
      borderRadius: 6,
      padding: '2px 8px',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: 12,
      fontWeight: 600,
      whiteSpace: 'nowrap',
    }}>
      {school}
    </span>
  );
}

const EVENT_GROUPS = [
  { label: 'Open', prefix: 'Open' },
  { label: 'U16',  prefix: 'U16' },
  { label: 'U15',  prefix: 'U15' },
  { label: 'U14',  prefix: 'U14' },
];

export default function HallOfFame() {
  const isMobile = useIsMobile();
  const [gender, setGender] = useState('boys');
  const [year, setYear] = useState(2025);
  const [view, setView] = useState('year');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const yearData = HOF_DATA[gender][year] || [];

  const allEvents = [...new Set(
    Object.values(HOF_DATA[gender]).flatMap(yr => yr.map(r => r.event))
  )];

  const eventHistory = selectedEvent
    ? HOF_YEARS
        .filter(y => HOF_DATA[gender][y])
        .map(y => {
          const row = HOF_DATA[gender][y]?.find(r => r.event === selectedEvent);
          return row ? { year: y, ...row } : null;
        })
        .filter(Boolean)
    : [];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? '24px 16px' : '32px 24px' }}>
      <div style={{ marginBottom: 24 }}>
        <span style={{ color: 'var(--t-gold)', fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          SA Schools Championships
        </span>
        <h2 style={{ fontFamily: "'Playfair Display', serif", color: 'var(--t-text)', fontSize: isMobile ? '1.8rem' : '2.2rem', margin: '8px 0 4px' }}>
          Hall of Fame
        </h2>
        <p style={{ color: 'var(--t-muted)', fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
          Gold medal winners per event, 2009–2025.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['boys', 'Boys'], ['girls', 'Girls']].map(([val, label]) => (
          <button key={val} onClick={() => { setGender(val); setSelectedEvent(null); }} style={{
            background: gender === val ? 'var(--t-gold)' : 'var(--t-bg-card)',
            color: gender === val ? 'var(--t-bg-deep)' : 'var(--t-muted)',
            border: gender === val ? 'none' : '1px solid var(--t-border-s)',
            borderRadius: 8, padding: '7px 20px', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', fontFamily: "'DM Mono', monospace", transition: 'all 0.15s',
          }}>{label}</button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {[['year', 'By Year'], ['event', 'By Event']].map(([val, label]) => (
          <button key={val} onClick={() => { setView(val); setSelectedEvent(val === 'event' ? (selectedEvent || allEvents[0]) : null); }} style={{
            background: view === val ? 'var(--t-border-s)' : 'transparent',
            color: view === val ? 'var(--t-gold)' : 'var(--t-dim)',
            border: `1px solid ${view === val ? 'var(--t-vdim)' : 'var(--t-border-s)'}`,
            borderRadius: 6, padding: '5px 16px', fontSize: 13,
            fontWeight: view === val ? 700 : 400, cursor: 'pointer',
            fontFamily: "'DM Mono', monospace", transition: 'all 0.15s',
          }}>{label}</button>
        ))}
      </div>

      {view === 'year' && (
        <>
          <div style={{ overflowX: 'auto', marginBottom: 28, WebkitOverflowScrolling: 'touch' }}>
            <div style={{ display: 'flex', gap: 6, width: 'max-content', paddingBottom: 8 }}>
              {HOF_YEARS.filter(y => HOF_DATA[gender][y]).map(y => (
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

          {EVENT_GROUPS.map(({ label, prefix }) => {
            const rows = yearData.filter(r => r.event.startsWith(prefix));
            if (!rows.length) return null;
            return (
              <div key={prefix} style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div style={{ background: 'var(--t-bg-card)', border: '1px solid var(--t-border-s)', borderRadius: 8, padding: '4px 14px' }}>
                    <span style={{ color: 'var(--t-gold)', fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 700 }}>{label}</span>
                  </div>
                  <div style={{ flex: 1, height: 1, background: 'var(--t-border-s)' }} />
                </div>
                <div style={{ background: 'linear-gradient(145deg, var(--t-bg-card), var(--t-bg))', border: '1px solid var(--t-border-s)', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '2fr 2fr' : '2fr 2fr 1.5fr 1fr',
                    padding: isMobile ? '8px 14px' : '8px 20px',
                    background: 'var(--t-bg)', borderBottom: '1px solid var(--t-border-s)',
                  }}>
                    {['Event', 'School', ...(isMobile ? [] : ['Crew', 'Time'])].map(h => (
                      <span key={h} style={{ color: 'var(--t-vdim)', fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{h}</span>
                    ))}
                  </div>
                  {rows.map((row, i) => (
                    <div key={i} style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '2fr 2fr' : '2fr 2fr 1.5fr 1fr',
                      padding: isMobile ? '10px 14px' : '11px 20px',
                      borderBottom: i < rows.length - 1 ? '1px solid var(--t-border)' : 'none',
                      alignItems: 'center', gap: isMobile ? '4px 12px' : 0,
                    }}>
                      <div style={{ color: 'var(--t-text)', fontFamily: "'DM Sans', sans-serif", fontSize: isMobile ? 12 : 13 }}>
                        {row.event}
                      </div>
                      <div><SchoolBadge school={row.school} /></div>
                      {!isMobile && (
                        <div style={{ color: 'var(--t-muted)', fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}>{row.crew}</div>
                      )}
                      <div style={{ color: 'var(--t-gold)', fontFamily: "'DM Mono', monospace", fontSize: isMobile ? 11 : 12, fontWeight: 700 }}>
                        {row.time || '—'}
                      </div>
                      {isMobile && (
                        <div style={{ color: 'var(--t-dim)', fontFamily: "'DM Sans', sans-serif", fontSize: 11, gridColumn: '1 / -1' }}>
                          {row.crew}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </>
      )}

      {view === 'event' && (
        <>
          <div style={{ overflowX: 'auto', marginBottom: 24, WebkitOverflowScrolling: 'touch' }}>
            <div style={{ display: 'flex', gap: 6, width: 'max-content', paddingBottom: 8, flexWrap: isMobile ? 'nowrap' : 'wrap' }}>
              {allEvents.map(ev => (
                <button key={ev} onClick={() => setSelectedEvent(ev)} style={{
                  background: selectedEvent === ev ? 'var(--t-border-s)' : 'transparent',
                  color: selectedEvent === ev ? 'var(--t-gold)' : 'var(--t-dim)',
                  border: `1px solid ${selectedEvent === ev ? 'var(--t-vdim)' : 'var(--t-border-s)'}`,
                  borderRadius: 6, padding: '5px 12px', fontSize: 12,
                  fontWeight: selectedEvent === ev ? 700 : 400, cursor: 'pointer',
                  fontFamily: "'DM Mono', monospace", transition: 'all 0.15s', whiteSpace: 'nowrap',
                }}>{ev}</button>
              ))}
            </div>
          </div>

          {selectedEvent && (
            <div style={{ background: 'linear-gradient(145deg, var(--t-bg-card), var(--t-bg))', border: '1px solid var(--t-border-s)', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr 2fr' : '1fr 2fr 1.5fr 1fr',
                padding: isMobile ? '8px 14px' : '8px 20px',
                background: 'var(--t-bg)', borderBottom: '1px solid var(--t-border-s)',
              }}>
                {['Year', 'School', ...(isMobile ? [] : ['Crew', 'Time'])].map(h => (
                  <span key={h} style={{ color: 'var(--t-vdim)', fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{h}</span>
                ))}
              </div>
              {eventHistory.map((row, i) => (
                <div key={i} style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr 2fr' : '1fr 2fr 1.5fr 1fr',
                  padding: isMobile ? '10px 14px' : '11px 20px',
                  borderBottom: i < eventHistory.length - 1 ? '1px solid var(--t-border)' : 'none',
                  alignItems: 'center', gap: isMobile ? '4px 12px' : 0,
                  background: row.year === 2025 ? 'var(--t-gold-d)' : 'transparent',
                }}>
                  <div style={{ color: 'var(--t-gold)', fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 700 }}>
                    {row.year}
                  </div>
                  <div><SchoolBadge school={row.school} /></div>
                  {!isMobile && (
                    <div style={{ color: 'var(--t-muted)', fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}>{row.crew}</div>
                  )}
                  <div style={{ color: 'var(--t-text2)', fontFamily: "'DM Mono', monospace", fontSize: isMobile ? 11 : 12 }}>
                    {row.time || '—'}
                  </div>
                  {isMobile && (
                    <div style={{ color: 'var(--t-dim)', fontFamily: "'DM Sans', sans-serif", fontSize: 11, gridColumn: '1 / -1' }}>
                      {row.crew}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <p style={{ color: 'var(--t-vdim)', fontFamily: "'DM Mono', monospace", fontSize: 11, marginTop: 32, textAlign: 'center' }}>
        Data sourced from rowsa.co.za · SA Schools Rowing Union
      </p>
    </div>
  );
}
