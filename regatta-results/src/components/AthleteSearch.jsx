import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { YEARS, REGATTAS } from '../data/regattas';
import { toProxyUrl, parseEventList, parseEventResults } from '../utils/proxy';
import { useIsMobile } from '../hooks/useIsMobile';

const CONCURRENCY = 8;

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

const PLACE_COLOR = { '1': '#d4a017', '2': '#9ca3af', '3': '#a0522d' };

export default function AthleteSearch() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [year, setYear] = useState(2026);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [searched, setSearched] = useState(false);
  const cancelRef = useRef(false);

  async function handleSearch(e) {
    e?.preventDefault();
    const q = query.trim();
    if (q.length < 3) return;

    cancelRef.current = false;
    setSearching(true);
    setSearched(true);
    setResults([]);
    setProgress({ done: 0, total: 0 });

    const regattas = REGATTAS[year] || [];

    // Step 1 — fetch all regatta event lists in parallel
    const eventGroups = (await Promise.all(
      regattas.map(async race => {
        const proxyUrl = toProxyUrl(race.url);
        const html = await fetchWithTimeout(proxyUrl);
        if (!html) return null;
        const events = parseEventList(html, proxyUrl);
        return { race, events };
      })
    )).filter(Boolean);

    const allItems = eventGroups.flatMap(({ race, events }) =>
      events.map(ev => ({ race, ev }))
    );

    setProgress({ done: 0, total: allItems.length });
    let done = 0;

    // Step 2 — fetch each event detail in batches
    await runInBatches(allItems, async ({ race, ev }) => {
      if (cancelRef.current) return;
      try {
        const html = await fetchWithTimeout(ev.detailsUrl);
        if (html) {
          const rows = parseEventResults(html);
          const lower = q.toLowerCase();
          const matches = rows.filter(r =>
            r.athlete?.toLowerCase().includes(lower) ||
            r.org?.toLowerCase().includes(lower)
          );
          if (matches.length > 0) {
            setResults(prev => [...prev, { race, ev, matches }]);
          }
        }
      } catch {}
      done++;
      setProgress({ done, total: allItems.length });
    }, CONCURRENCY);

    setSearching(false);
  }

  function cancel() {
    cancelRef.current = true;
    setSearching(false);
  }

  const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? '24px 16px' : '32px 24px' }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", color: '#f5f0e0', fontSize: isMobile ? '1.8rem' : '2.2rem', marginBottom: 8 }}>
        Athlete Search
      </h2>
      <p style={{ color: '#6b7c6b', marginBottom: 24, fontFamily: "'DM Sans', sans-serif", fontSize: isMobile ? 14 : 16 }}>
        Search for an athlete or school across all events in a season.
      </p>

      {/* Search form */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 28, flexDirection: isMobile ? 'column' : 'row' }}>
        <select
          value={year}
          onChange={e => setYear(parseInt(e.target.value))}
          disabled={searching}
          style={{
            background: '#0f220f', border: '1px solid #1a3a1a', borderRadius: 8,
            padding: '10px 16px', color: '#e8e0c8', fontFamily: "'DM Mono', monospace",
            fontSize: 14, cursor: 'pointer', outline: 'none',
            width: isMobile ? '100%' : 'auto',
          }}
        >
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>

        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Athlete name or school…"
          disabled={searching}
          style={{
            background: '#0f220f', border: '1px solid #1a3a1a', borderRadius: 8,
            padding: '10px 16px', color: '#e8e0c8', fontFamily: "'DM Sans', sans-serif",
            fontSize: 14, flex: 1, outline: 'none',
          }}
        />

        {searching ? (
          <button type="button" onClick={cancel} style={{
            background: '#2d1b1b', border: '1px solid #7f1d1d', color: '#f87171',
            borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          }}>Cancel</button>
        ) : (
          <button type="submit" disabled={query.trim().length < 3} style={{
            background: query.trim().length >= 3 ? '#d4a017' : '#1a3a1a',
            border: 'none', color: query.trim().length >= 3 ? '#030a03' : '#4a6b4a',
            borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 700,
            cursor: query.trim().length >= 3 ? 'pointer' : 'default',
            fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s',
          }}>Search</button>
        )}
      </form>

      {/* Progress bar */}
      {searching && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: '#4a6b4a', fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Searching events…
            </span>
            <span style={{ color: '#4a6b4a', fontFamily: "'DM Mono', monospace", fontSize: 11 }}>
              {progress.done} / {progress.total}
            </span>
          </div>
          <div style={{ background: '#0f220f', borderRadius: 4, height: 4, overflow: 'hidden' }}>
            <div style={{
              background: '#d4a017', height: '100%', borderRadius: 4,
              width: `${pct}%`, transition: 'width 0.2s',
            }} />
          </div>
          {results.length > 0 && (
            <p style={{ color: '#4ade80', fontFamily: "'DM Mono', monospace", fontSize: 11, marginTop: 6 }}>
              {results.length} match{results.length !== 1 ? 'es' : ''} found so far…
            </p>
          )}
        </div>
      )}

      {/* Results */}
      {!searching && searched && results.length === 0 && (
        <div style={{
          background: '#0f220f', border: '1px dashed #1a3a1a', borderRadius: 16,
          padding: 48, textAlign: 'center', color: '#4a6b4a',
          fontFamily: "'DM Sans', sans-serif", fontSize: 15,
        }}>
          No results found for "{query}" in {year}.
        </div>
      )}

      {results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {results.map(({ race, ev, matches }, i) => (
            <div key={i} style={{
              background: 'linear-gradient(145deg, #0f220f, #0a1a0a)',
              border: '1px solid #1a3a1a', borderRadius: 16, overflow: 'hidden',
            }}>
              {/* Regatta + event header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #1a3a1a' }}>
                <button
                  onClick={() => navigate(`/results/${race.id}`, { state: { race } })}
                  style={{
                    background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                    color: '#d4a017', fontFamily: "'DM Mono', monospace",
                    fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
                    display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4,
                  }}
                >
                  {race.name} →
                </button>
                <div style={{ color: '#f5f0e0', fontFamily: "'Playfair Display', serif", fontSize: '1rem' }}>
                  {ev.eventName}
                </div>
                <div style={{ color: '#6b7c6b', fontFamily: "'DM Sans', sans-serif", fontSize: 12, marginTop: 2 }}>
                  {ev.race} · {ev.time}
                </div>
              </div>

              {/* Matching rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {matches.map((row, j) => {
                  const medalColor = PLACE_COLOR[row.place];
                  const isFinished = !['scratch','dns','dnf'].some(s => row.status.toLowerCase().includes(s));
                  return (
                    <div key={j} style={{
                      padding: '12px 20px', borderTop: j > 0 ? '1px solid #0f220f' : 'none',
                      display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
                    }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                        border: `2px solid ${isFinished ? (medalColor || '#1a3a1a') : '#2d1b1b'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: isFinished ? (medalColor || '#4a6b4a') : '#4a6b4a',
                        fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: 12,
                      }}>
                        {isFinished ? row.place : '–'}
                      </div>
                      <div style={{ flex: 1, minWidth: 120 }}>
                        {row.athlete ? (
                          <button
                            onClick={e => { e.stopPropagation(); navigate(`/athlete/${encodeURIComponent(row.athlete)}`); }}
                            style={{
                              background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                              color: '#f5f0e0', fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
                              textAlign: 'left', textDecoration: 'underline', textDecorationColor: 'rgba(212,160,23,0.4)',
                              textUnderlineOffset: 3,
                            }}
                          >{row.athlete}</button>
                        ) : (
                          <div style={{ color: '#4a6b4a', fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>—</div>
                        )}
                        <div style={{ color: '#4a6b4a', fontFamily: "'DM Mono', monospace", fontSize: 11 }}>
                          {row.org}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        {isFinished ? (
                          <>
                            <div style={{ color: medalColor === '#d4a017' ? '#d4a017' : '#e8e0c8', fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: medalColor === '#d4a017' ? 700 : 400 }}>
                              {row.time}
                            </div>
                            {row.delta && row.delta !== '.00' && (
                              <div style={{ color: '#4a6b4a', fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{row.delta}</div>
                            )}
                          </>
                        ) : (
                          <span style={{ color: '#4a6b4a', fontFamily: "'DM Mono', monospace", fontSize: 12 }}>{row.status}</span>
                        )}
                      </div>
                      <div style={{ color: '#2d5a1b', fontFamily: "'DM Mono', monospace", fontSize: 11 }}>L{row.lane}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
