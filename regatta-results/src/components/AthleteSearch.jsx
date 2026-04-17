import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { YEARS, REGATTAS } from '../data/regattas';
import { toProxyUrl, parseEventList, parseEventResults } from '../utils/proxy';
import { matchesEventQuery } from '../utils/eventSearch';
import { useIsMobile } from '../hooks/useIsMobile';

const CONCURRENCY = 8;

async function fetchWithTimeout(url, ms = 8000, externalSignal = null) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  externalSignal?.addEventListener('abort', () => ctrl.abort(), { once: true });
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

const PLACE_COLOR = { '1': 'var(--t-gold)', '2': '#9ca3af', '3': '#a0522d' };

export default function AthleteSearch() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [year, setYear] = useState(2026);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [searched, setSearched] = useState(false);
  const abortRef = useRef(null);
  const [justCancelled, setJustCancelled] = useState(false);

  async function handleSearch(e) {
    e?.preventDefault();
    const q = query.trim();
    if (q.length < 3) return;

    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;
    const sig = abort.signal;

    setSearching(true);
    setSearched(true);
    setResults([]);
    setProgress({ done: 0, total: 0 });

    const regattas = REGATTAS[year] || [];

    const eventGroups = (await Promise.all(
      regattas.map(async race => {
        const proxyUrl = toProxyUrl(race.url);
        const html = await fetchWithTimeout(proxyUrl, 8000, sig);
        if (!html || sig.aborted) return null;
        const events = parseEventList(html, proxyUrl);
        return { race, events };
      })
    )).filter(Boolean);

    if (sig.aborted) return;

    const allItems = eventGroups.flatMap(({ race, events }) =>
      events.map(ev => ({ race, ev }))
    );

    setProgress({ done: 0, total: allItems.length });
    let done = 0;

    await runInBatches(allItems, async ({ race, ev }) => {
      if (sig.aborted) return;
      try {
        const html = await fetchWithTimeout(ev.detailsUrl, 8000, sig);
        if (!html || sig.aborted) return;
        const rows = parseEventResults(html);
        const lower = q.toLowerCase();
        const eventMatch = matchesEventQuery(ev.eventName, q);
        const matches = eventMatch
          ? rows
          : rows.filter(r =>
              r.athlete?.toLowerCase().includes(lower) ||
              r.org?.toLowerCase().includes(lower)
            );
        if (matches.length > 0) {
          setResults(prev => [...prev, { race, ev, matches, eventMatch }]);
        }
      } catch {}
      if (!sig.aborted) {
        done++;
        setProgress({ done, total: allItems.length });
      }
    }, CONCURRENCY);

    if (!sig.aborted) setSearching(false);
  }

  function cancel() {
    abortRef.current?.abort();
    setSearching(false);
    setJustCancelled(true);
    setTimeout(() => setJustCancelled(false), 400);
  }

  const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? '24px 16px' : '32px 24px' }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", color: 'var(--t-text)', fontSize: isMobile ? '1.8rem' : '2.2rem', marginBottom: 8 }}>
        Athlete Search
      </h2>
      <p style={{ color: 'var(--t-muted)', marginBottom: 24, fontFamily: "'DM Sans', sans-serif", fontSize: isMobile ? 14 : 16 }}>
        Search by athlete, school, or event type — plain English works (e.g. "junior mens pair", "senior women eight").
      </p>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 28, flexDirection: isMobile ? 'column' : 'row' }}>
        <select
          value={year}
          onChange={e => setYear(parseInt(e.target.value))}
          disabled={searching}
          style={{
            background: 'var(--t-bg-card)', border: '1px solid var(--t-border-s)', borderRadius: 8,
            padding: '10px 16px', color: 'var(--t-text2)', fontFamily: "'DM Mono', monospace",
            fontSize: 14, cursor: 'pointer', outline: 'none',
            width: isMobile ? '100%' : 'auto',
          }}
        >
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>

        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Athlete, school, or event (e.g. junior mens pair)…"
          disabled={searching}
          style={{
            background: 'var(--t-bg-card)', border: '1px solid var(--t-border-s)', borderRadius: 8,
            padding: '10px 16px', color: 'var(--t-text2)', fontFamily: "'DM Sans', sans-serif",
            fontSize: 14, flex: 1, outline: 'none',
          }}
        />

        {searching ? (
          <button
            type="button"
            onPointerDown={e => { e.preventDefault(); cancel(); }}
            style={{
              background: 'var(--t-red-bg)', border: '1px solid var(--t-red-b)', color: 'var(--t-red)',
              borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            }}
          >Cancel</button>
        ) : (
          <button type="submit" disabled={query.trim().length < 3 || justCancelled} style={{
            background: query.trim().length >= 3 && !justCancelled ? 'var(--t-gold)' : 'var(--t-border-s)',
            border: 'none', color: query.trim().length >= 3 && !justCancelled ? 'var(--t-bg-deep)' : 'var(--t-dim)',
            borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 700,
            cursor: query.trim().length >= 3 && !justCancelled ? 'pointer' : 'default',
            fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s',
          }}>Search</button>
        )}
      </form>

      {searching && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: 'var(--t-dim)', fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Searching events…
            </span>
            <span style={{ color: 'var(--t-dim)', fontFamily: "'DM Mono', monospace", fontSize: 11 }}>
              {progress.done} / {progress.total}
            </span>
          </div>
          <div style={{ background: 'var(--t-bg-card)', borderRadius: 4, height: 4, overflow: 'hidden' }}>
            <div style={{
              background: 'var(--t-gold)', height: '100%', borderRadius: 4,
              width: `${pct}%`, transition: 'width 0.2s',
            }} />
          </div>
          {results.length > 0 && (
            <p style={{ color: 'var(--t-green)', fontFamily: "'DM Mono', monospace", fontSize: 11, marginTop: 6 }}>
              {results.length} match{results.length !== 1 ? 'es' : ''} found so far…
            </p>
          )}
        </div>
      )}

      {!searching && searched && results.length === 0 && (
        <div style={{
          background: 'var(--t-bg-card)', border: '1px dashed var(--t-border-s)', borderRadius: 16,
          padding: 48, textAlign: 'center', color: 'var(--t-dim)',
          fontFamily: "'DM Sans', sans-serif", fontSize: 15,
        }}>
          No results found for "{query}" in {year}.
        </div>
      )}

      {results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {results.map(({ race, ev, matches, eventMatch }, i) => (
            <div key={i} style={{
              background: 'linear-gradient(145deg, var(--t-bg-card), var(--t-bg))',
              border: '1px solid var(--t-border-s)', borderRadius: 16, overflow: 'hidden',
            }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--t-border-s)' }}>
                <button
                  onClick={() => navigate(`/results/${race.id}`, { state: { race } })}
                  style={{
                    background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                    color: 'var(--t-gold)', fontFamily: "'DM Mono', monospace",
                    fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
                    display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4,
                  }}
                >
                  {race.name} →
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <div style={{ color: 'var(--t-text)', fontFamily: "'Playfair Display', serif", fontSize: '1rem' }}>
                    {ev.eventName}
                  </div>
                  {eventMatch && (
                    <span style={{
                      color: 'var(--t-green)', fontFamily: "'DM Mono', monospace", fontSize: 9,
                      letterSpacing: '0.12em', background: 'var(--t-green-d)',
                      border: '1px solid var(--t-green-b)', borderRadius: 4, padding: '2px 6px',
                    }}>EVENT MATCH</span>
                  )}
                </div>
                <div style={{ color: 'var(--t-muted)', fontFamily: "'DM Sans', sans-serif", fontSize: 12, marginTop: 2 }}>
                  {ev.race} · {ev.time}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {matches.map((row, j) => {
                  const medalColor = PLACE_COLOR[row.place];
                  const isFinished = !['scratch','dns','dnf'].some(s => row.status.toLowerCase().includes(s));
                  return (
                    <div key={j} style={{
                      padding: '12px 20px', borderTop: j > 0 ? '1px solid var(--t-border)' : 'none',
                      display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
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
                      <div style={{ flex: 1, minWidth: 120 }}>
                        {row.athlete ? (
                          <button
                            onClick={e => { e.stopPropagation(); navigate(`/athlete/${encodeURIComponent(row.athlete)}`); }}
                            style={{
                              background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                              color: 'var(--t-text)', fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
                              textAlign: 'left', textDecoration: 'underline', textDecorationColor: 'var(--t-gold-b)',
                              textUnderlineOffset: 3,
                            }}
                          >{row.athlete}</button>
                        ) : (
                          <div style={{ color: 'var(--t-dim)', fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>—</div>
                        )}
                        <div style={{ color: 'var(--t-dim)', fontFamily: "'DM Mono', monospace", fontSize: 11 }}>
                          {row.org}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        {isFinished ? (
                          <>
                            <div style={{ color: row.place === '1' ? 'var(--t-gold)' : 'var(--t-text2)', fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: row.place === '1' ? 700 : 400 }}>
                              {row.time}
                            </div>
                            {row.delta && row.delta !== '.00' && (
                              <div style={{ color: 'var(--t-dim)', fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{row.delta}</div>
                            )}
                          </>
                        ) : (
                          <span style={{ color: 'var(--t-dim)', fontFamily: "'DM Mono', monospace", fontSize: 12 }}>{row.status}</span>
                        )}
                      </div>
                      <div style={{ color: 'var(--t-vdim)', fontFamily: "'DM Mono', monospace", fontSize: 11 }}>L{row.lane}</div>
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
