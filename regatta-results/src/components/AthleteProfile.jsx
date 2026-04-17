import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { YEARS, REGATTAS } from '../data/regattas';
import { toProxyUrl, parseEventList, parseEventResults } from '../utils/proxy';
import { useIsMobile } from '../hooks/useIsMobile';

const CONCURRENCY = 6;
const SEARCH_YEARS = YEARS.slice(0, 3);

const PLACE_COLOR = { '1': 'var(--t-gold)', '2': '#9ca3af', '3': '#a0522d' };

async function fetchWithTimeout(url, ms = 8000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    return r.ok ? r.text() : null;
  } catch { return null; }
  finally { clearTimeout(id); }
}

async function runInBatches(items, fn, size) {
  for (let i = 0; i < items.length; i += size) {
    await Promise.all(items.slice(i, i + size).map(fn));
  }
}

function parseTime(t) {
  if (!t || !/^\d/.test(t)) return Infinity;
  const parts = t.split(':');
  if (parts.length === 2) return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
  if (parts.length === 3) return parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
  return Infinity;
}

export default function AthleteProfile() {
  const { name } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const athleteName = decodeURIComponent(name || '');
  const [entries, setEntries] = useState([]);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [searching, setSearching] = useState(true);
  const cancelRef = useRef(false);

  useEffect(() => {
    cancelRef.current = false;
    setSearching(true);
    setEntries([]);
    setProgress({ done: 0, total: 0 });

    (async () => {
      const allRegattas = SEARCH_YEARS.flatMap(y =>
        (REGATTAS[y] || []).map(r => ({ ...r, year: y }))
      );

      const eventGroups = (await Promise.all(
        allRegattas.map(async race => {
          const proxyUrl = toProxyUrl(race.url);
          const html = await fetchWithTimeout(proxyUrl);
          if (!html) return null;
          const evs = parseEventList(html, proxyUrl);
          return { race, evs };
        })
      )).filter(Boolean);

      const allItems = eventGroups.flatMap(({ race, evs }) =>
        evs.filter(ev => ev.detailsUrl).map(ev => ({ race, ev }))
      );

      setProgress({ done: 0, total: allItems.length });
      let done = 0;
      const lower = athleteName.toLowerCase();

      await runInBatches(allItems, async ({ race, ev }) => {
        if (cancelRef.current) return;
        try {
          const html = await fetchWithTimeout(ev.detailsUrl);
          if (html) {
            const rows = parseEventResults(html);
            const match = rows.find(r => r.athlete?.toLowerCase() === lower);
            if (match) {
              setEntries(prev => [...prev, { year: race.year, race, ev, row: match }]);
            }
          }
        } catch {}
        done++;
        setProgress({ done, total: allItems.length });
      }, CONCURRENCY);

      if (!cancelRef.current) setSearching(false);
    })();

    return () => { cancelRef.current = true; };
  }, [athleteName]);

  const gold = entries.filter(e => e.row.place === '1').length;
  const silver = entries.filter(e => e.row.place === '2').length;
  const bronze = entries.filter(e => e.row.place === '3').length;
  const yearsActive = [...new Set(entries.map(e => e.year))].sort((a, b) => b - a);

  const pbMap = {};
  for (const { year, ev, row } of entries) {
    if (!row.time || row.time === 'DNS' || row.time === 'DNF' || row.time === 'SCR') continue;
    const key = ev.eventName;
    const t = parseTime(row.time);
    if (!pbMap[key] || t < parseTime(pbMap[key].time)) {
      pbMap[key] = { time: row.time, year };
    }
  }

  const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? '24px 16px' : '32px 24px' }}>
      <button onClick={() => navigate(-1)} style={{
        background: 'none', border: 'none', color: 'var(--t-gold)', cursor: 'pointer',
        fontFamily: "'DM Mono', monospace", fontSize: 12, letterSpacing: '0.12em',
        textTransform: 'uppercase', padding: 0, marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>← Back</button>

      <div style={{ marginBottom: 28 }}>
        <span style={{ color: 'var(--t-gold)', fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          Athlete Profile
        </span>
        <h2 style={{ fontFamily: "'Playfair Display', serif", color: 'var(--t-text)', fontSize: isMobile ? '1.8rem' : '2.2rem', margin: '8px 0 4px' }}>
          {athleteName}
        </h2>
        <p style={{ color: 'var(--t-dim)', fontFamily: "'DM Mono', monospace", fontSize: 11, margin: 0 }}>
          Searching {SEARCH_YEARS.join(', ')} seasons
        </p>
      </div>

      {searching && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: 'var(--t-dim)', fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Scanning events…
            </span>
            <span style={{ color: 'var(--t-dim)', fontFamily: "'DM Mono', monospace", fontSize: 11 }}>
              {progress.done} / {progress.total}
            </span>
          </div>
          <div style={{ background: 'var(--t-bg-card)', borderRadius: 4, height: 4, overflow: 'hidden' }}>
            <div style={{ background: 'var(--t-gold)', height: '100%', borderRadius: 4, width: `${pct}%`, transition: 'width 0.2s' }} />
          </div>
          {entries.length > 0 && (
            <p style={{ color: 'var(--t-green)', fontFamily: "'DM Mono', monospace", fontSize: 11, marginTop: 6 }}>
              {entries.length} result{entries.length !== 1 ? 's' : ''} found so far…
            </p>
          )}
        </div>
      )}

      {entries.length > 0 && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
          {[
            [entries.length, 'Races'],
            [gold > 0 ? `${gold} 🥇` : '–', 'Gold'],
            [silver > 0 ? `${silver} 🥈` : '–', 'Silver'],
            [bronze > 0 ? `${bronze} 🥉` : '–', 'Bronze'],
            [yearsActive.join(', ') || '–', 'Seasons'],
          ].map(([val, label]) => (
            <div key={label} style={{ background: 'var(--t-bg-card)', border: '1px solid var(--t-border-s)', borderRadius: 12, padding: '12px 20px' }}>
              <div style={{ color: 'var(--t-gold)', fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', fontWeight: 700 }}>{val}</div>
              <div style={{ color: 'var(--t-dim)', fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {Object.keys(pbMap).length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ color: 'var(--t-muted)', fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>
            Personal Bests
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {Object.entries(pbMap).sort((a, b) => a[0].localeCompare(b[0])).map(([event, { time, year }]) => (
              <div key={event} style={{
                background: 'linear-gradient(145deg, var(--t-bg-card), var(--t-bg))',
                border: '1px solid var(--t-border-s)', borderRadius: 10,
                padding: isMobile ? '10px 14px' : '12px 18px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
              }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: 'var(--t-text)', fontFamily: "'Playfair Display', serif", fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event}</div>
                  <div style={{ color: 'var(--t-dim)', fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{year}</div>
                </div>
                <div style={{ color: 'var(--t-gold)', fontFamily: "'DM Mono', monospace", fontSize: 15, fontWeight: 700, flexShrink: 0 }}>{time}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {entries.length > 0 && (
        <div>
          <h3 style={{ color: 'var(--t-muted)', fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>
            Race History
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[...entries].sort((a, b) => b.year - a.year || 0).map(({ year, race, ev, row }, i) => {
              const medalColor = PLACE_COLOR[row.place];
              const isFinished = !['scratch','dns','dnf'].some(s => row.status.toLowerCase().includes(s));
              return (
                <div key={i} style={{
                  background: 'linear-gradient(145deg, var(--t-bg-card), var(--t-bg))',
                  border: '1px solid var(--t-border-s)', borderRadius: 10,
                  padding: isMobile ? '10px 14px' : '12px 18px',
                  display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 14,
                }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${isFinished ? (medalColor || 'var(--t-border-s)') : 'var(--t-red-b)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isFinished ? (medalColor || 'var(--t-dim)') : 'var(--t-dim)',
                    fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: 12,
                  }}>
                    {isFinished ? row.place : '–'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: 'var(--t-text)', fontFamily: "'Playfair Display', serif", fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ev.eventName}
                    </div>
                    <div style={{ color: 'var(--t-muted)', fontFamily: "'DM Sans', sans-serif", fontSize: 12, marginTop: 2 }}>
                      {race.name} · {year}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {isFinished ? (
                      <div style={{ color: medalColor || 'var(--t-text2)', fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: medalColor ? 700 : 400 }}>
                        {row.time}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--t-dim)', fontFamily: "'DM Mono', monospace", fontSize: 12 }}>{row.status}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!searching && entries.length === 0 && (
        <div style={{
          background: 'var(--t-bg-card)', border: '1px dashed var(--t-border-s)', borderRadius: 16,
          padding: 48, textAlign: 'center', color: 'var(--t-dim)',
          fontFamily: "'DM Sans', sans-serif", fontSize: 15,
        }}>
          No results found for "{athleteName}" in the {SEARCH_YEARS.join(', ')} seasons.
        </div>
      )}
    </div>
  );
}
