import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams, useLocation, useSearchParams } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { toProxyUrl, parseEventList, parseEventResults, parseEntryList } from '../utils/proxy';
import { REGATTAS } from '../data/regattas';
import { useIsMobile } from '../hooks/useIsMobile';
import BellButton from './BellButton';

function ShareButton({ title, text }) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (_) {}
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  }, [title, text]);

  return (
    <button onClick={handleShare} style={{
      background: copied ? 'var(--t-green-d)' : 'var(--t-gold-d)',
      border: `1px solid ${copied ? 'var(--t-green-b)' : 'var(--t-gold-b)'}`,
      color: copied ? 'var(--t-green)' : 'var(--t-gold)',
      borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
      fontFamily: "'DM Mono', monospace", fontSize: 12,
      letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 6,
      transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0,
    }}>
      {copied ? '✓ Copied' : '↗ Share'}
    </button>
  );
}

const PLACE_MEDAL = { '1': '#d4a017', '2': '#9ca3af', '3': '#a0522d' };

function findRaceById(id) {
  for (const races of Object.values(REGATTAS)) {
    const found = races.find(r => r.id === id);
    if (found) return found;
  }
  return null;
}

// eventId (first table column) is shared across all heats of the same event category.
// detailsUrl is unique per heat, so encode it as the ?event= param.
function evKey(ev) {
  return ev.detailsUrl ? encodeURIComponent(ev.detailsUrl) : ev.eventId;
}

export default function RaceResultsPage() {
  const { raceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [searchParams] = useSearchParams();
  // Capture the ?event= param at mount time only — we never want the auto-open
  // to re-trigger when openEvent() itself changes the URL.
  const mountEventId = useRef(searchParams.get('event'));
  const autoOpenedRef = useRef(false);

  const race = location.state?.race || findRaceById(raceId);

  const [events, setEvents] = useState([]);
  const [eventSearch, setEventSearch] = useState('');
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [results, setResults] = useState(null);
  const [entries, setEntries] = useState(null);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState(null);
  const [newEventIds, setNewEventIds] = useState(new Set());
  const [lastPoll, setLastPoll] = useState(null);
  const [tick, setTick] = useState(0);
  const prevEventsRef = useRef(null);

  const days = [...new Set(events.map(e => e.date).filter(Boolean))];
  const activeDay = days.length > 1 ? (selectedDay || days[0]) : null;

  const filteredEvents = (() => {
    let evs = activeDay ? events.filter(e => e.date === activeDay) : events;
    if (eventSearch.trim()) {
      evs = evs.filter(ev =>
        ev.eventName.toLowerCase().includes(eventSearch.toLowerCase()) ||
        ev.race.toLowerCase().includes(eventSearch.toLowerCase())
      );
    }
    return evs;
  })();

  useEffect(() => {
    if (mountEventId.current) window.scrollTo(0, 0);
  }, []);

  const listRestoredRef = useRef(false);
  const listScrollKey = `scroll:event-list:${raceId}`;
  useEffect(() => {
    if (mountEventId.current || loading || events.length === 0 || listRestoredRef.current) return;
    listRestoredRef.current = true;
    const saved = sessionStorage.getItem(listScrollKey);
    if (saved) setTimeout(() => window.scrollTo(0, parseInt(saved, 10)), 0);
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!race) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    prevEventsRef.current = null;
    const proxyUrl = toProxyUrl(race.url);
    fetch(proxyUrl)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text(); })
      .then(html => { if (!cancelled) setEvents(parseEventList(html, proxyUrl)); })
      .catch(e => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [race?.url]);

  useEffect(() => {
    if (events.length > 0 && prevEventsRef.current === null) {
      prevEventsRef.current = events;
    }
  }, [events]);

  // Auto-open event from ?event= URL param (refresh / shared link).
  useEffect(() => {
    if (!mountEventId.current || events.length === 0 || autoOpenedRef.current) return;
    const target = mountEventId.current;
    const ev = events.find(e => (e.detailsUrl || e.eventId) === target);
    if (ev?.detailsUrl) {
      autoOpenedRef.current = true;
      openEvent(ev);
    }
  }, [events]); // eslint-disable-line react-hooks/exhaustive-deps

  const isLive = !loading && !error && events.length > 0 &&
    events.some(e => e.status !== 'Official');

  useEffect(() => {
    if (!isLive || !race) return;
    const poll = () => {
      const proxyUrl = toProxyUrl(race.url);
      fetch(proxyUrl)
        .then(r => r.ok ? r.text() : null)
        .then(html => {
          if (!html) return;
          const updated = parseEventList(html, proxyUrl);
          const prev = prevEventsRef.current || [];
          const prevMap = new Map(prev.map(e => [e.eventId, e.status]));

          const fresh = new Set();
          for (const ev of updated) {
            const was = prevMap.get(ev.eventId);
            if (was === undefined || (was !== 'Official' && ev.status === 'Official')) {
              fresh.add(ev.eventId);
            }
          }

          prevEventsRef.current = updated;
          setEvents(updated);
          setLastPoll(new Date());
          if (fresh.size > 0) {
            setNewEventIds(fresh);
            setTimeout(() => setNewEventIds(new Set()), 10000);
          }
        })
        .catch(() => {});
    };
    const id = setInterval(poll, 60000);
    return () => clearInterval(id);
  }, [isLive, race?.url]);

  useEffect(() => {
    if (!isLive) return;
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [isLive]);

  function openEvent(ev) {
    sessionStorage.setItem(listScrollKey, String(Math.round(window.scrollY)));
    navigate(`/results/${raceId}?event=${evKey(ev)}`, { replace: true, state: location.state });
    setSelectedEvent(ev);
    setResults(null);
    setEntries(null);
    setResultsError(null);
    setResultsLoading(true);
    window.scrollTo(0, 0);
    fetch(ev.detailsUrl)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text(); })
      .then(html => {
        const res = parseEventResults(html);
        if (res.length > 0) {
          setResults(res);
        } else {
          const ents = parseEntryList(html);
          setEntries(ents.length > 0 ? ents : null);
        }
      })
      .catch(e => setResultsError(e.message))
      .finally(() => setResultsLoading(false));
  }

  if (!race) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ color: 'var(--t-muted)', fontFamily: "'DM Sans', sans-serif", marginBottom: 24 }}>
          Race not found. It may have been fetched dynamically — go back and click it from the results list.
        </div>
        <button onClick={() => navigate('/results')} style={{
          background: 'none', border: '1px solid var(--t-border-s)', color: 'var(--t-gold)', cursor: 'pointer',
          fontFamily: "'DM Mono', monospace", fontSize: 12, letterSpacing: '0.12em',
          textTransform: 'uppercase', padding: '10px 20px', borderRadius: 8,
        }}>
          ← Back to results
        </button>
      </div>
    );
  }

  const raceLabel = selectedEvent
    ? selectedEvent.race.includes(' - ')
      ? selectedEvent.race.split(' - ').slice(1).join(' ')
      : selectedEvent.race
    : null;

  const secsAgo = lastPoll ? Math.round((Date.now() - lastPoll.getTime()) / 1000) : null;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? '24px 14px' : '32px 24px' }}>
      <style>{`@keyframes livePulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }`}</style>
      <button
        onClick={() => {
          if (selectedEvent) {
            navigate(`/results/${raceId}`, { replace: true, state: location.state });
            setSelectedEvent(null);
            const saved = sessionStorage.getItem(listScrollKey);
            if (saved) setTimeout(() => window.scrollTo(0, parseInt(saved, 10)), 50);
          } else {
            navigate('/results');
          }
        }}
        style={{
          background: 'none', border: 'none', color: 'var(--t-gold)', cursor: 'pointer',
          fontFamily: "'DM Mono', monospace", fontSize: 12, letterSpacing: '0.12em',
          textTransform: 'uppercase', padding: 0, marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 6,
        }}
      >
        ← {selectedEvent ? 'All events' : 'All regattas'}
      </button>

      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <h2 style={{
            fontFamily: "'Playfair Display', serif", color: 'var(--t-text)',
            fontSize: 'clamp(1.4rem, 4vw, 2.2rem)', margin: '0 0 10px', flex: 1,
          }}>
            {selectedEvent ? selectedEvent.eventName : race.name}
          </h2>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            {race.status === 'Upcoming' && !selectedEvent && (
              <BellButton watchId={race.id} watchItem={race} variant="pill" label={{ on: ' Watching', off: ' Notify me' }} size="lg" />
            )}
            <ShareButton
              title={selectedEvent ? selectedEvent.eventName : race.name}
              text={selectedEvent
                ? `${selectedEvent.eventName} — ${race.name} (${race.date})`
                : `${race.name} results — ${race.date}, ${race.location}`}
            />
          </div>
        </div>
        {selectedEvent && (
          <p style={{ color: 'var(--t-gold)', fontFamily: "'DM Mono', monospace", fontSize: 13, margin: '0 0 10px' }}>
            {raceLabel}
          </p>
        )}
        <div style={{
          display: 'flex', gap: 20, flexWrap: 'wrap',
          color: 'var(--t-muted)', fontFamily: "'DM Sans', sans-serif", fontSize: 13,
          alignItems: 'center',
        }}>
          {race.date && <span>📅 {race.date}</span>}
          {race.location && <span>📍 {race.location}</span>}
          {race.status && <StatusBadge status={race.status} />}
          {isLive && !selectedEvent && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%', background: 'var(--t-green)',
                display: 'inline-block', animation: 'livePulse 1.8s ease-in-out infinite',
                flexShrink: 0,
              }} />
              <span style={{ color: 'var(--t-green)', fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Live
              </span>
              {secsAgo !== null && (
                <span style={{ color: 'var(--t-vdim)', fontFamily: "'DM Mono', monospace", fontSize: 11 }}>
                  · {secsAgo < 5 ? 'just updated' : `updated ${secsAgo}s ago`}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Event list */}
      {!selectedEvent && (
        loading ? (
          <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--t-dim)', fontFamily: "'DM Sans', sans-serif" }}>
            Loading events…
          </div>
        ) : error ? (
          <div style={{
            background: 'var(--t-red-bg)', border: '1px solid var(--t-red-b)', borderRadius: 12,
            padding: 24, color: 'var(--t-red)', fontFamily: "'DM Sans', sans-serif",
          }}>
            <div style={{ marginBottom: 12 }}>Could not load results: {error}</div>
            <a href={race.url} target="_blank" rel="noopener noreferrer"
              style={{ color: 'var(--t-gold)', fontFamily: "'DM Mono', monospace", fontSize: 12 }}>
              Open on regattaresults.co.za →
            </a>
          </div>
        ) : (
          <div>
            {days.length > 1 && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                {days.map(d => (
                  <button key={d} onClick={() => setSelectedDay(d)} style={{
                    background: activeDay === d ? 'var(--t-gold)' : 'var(--t-bg-card)',
                    color: activeDay === d ? 'var(--t-bg-deep)' : 'var(--t-muted)',
                    border: activeDay === d ? 'none' : '1px solid var(--t-border-s)',
                    borderRadius: 8, padding: '7px 20px', fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', fontFamily: "'DM Mono', monospace", transition: 'all 0.15s',
                    whiteSpace: 'nowrap',
                  }}>{d}</button>
                ))}
              </div>
            )}
            <input
              value={eventSearch}
              onChange={e => setEventSearch(e.target.value)}
              placeholder="Search events…"
              style={{
                background: 'var(--t-bg-card)', border: '1px solid var(--t-border-s)', borderRadius: 8,
                padding: '10px 16px', color: 'var(--t-text2)', fontFamily: "'DM Sans', sans-serif",
                fontSize: 14, width: '100%', outline: 'none', marginBottom: 16,
                boxSizing: 'border-box',
              }}
            />
            <p style={{
              color: 'var(--t-dim)', fontFamily: "'DM Mono', monospace", fontSize: 11,
              letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16,
            }}>
              {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {filteredEvents.map((ev, i) => {
                const clickable = !!ev.detailsUrl;
                const isNew = newEventIds.has(ev.eventId);
                return (
                  <div key={i}
                    onClick={() => clickable && openEvent(ev)}
                    style={{
                      background: isNew
                        ? 'linear-gradient(145deg, var(--t-green-d), var(--t-bg))'
                        : 'linear-gradient(145deg, var(--t-bg-card), var(--t-bg))',
                      border: `1px solid ${isNew ? 'var(--t-green-b)' : 'var(--t-border-s)'}`,
                      borderRadius: 10,
                      padding: '14px 18px', cursor: clickable ? 'pointer' : 'default',
                      textAlign: 'left', display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between', gap: 16,
                      opacity: clickable ? 1 : 0.5, transition: 'all 0.3s',
                    }}
                    onMouseEnter={e => { if (clickable) { e.currentTarget.style.borderColor = isNew ? 'var(--t-green)' : 'var(--t-gold)'; } }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = isNew ? 'var(--t-green-b)' : 'var(--t-border-s)'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                      <span style={{ color: 'var(--t-vdim)', fontFamily: "'DM Mono', monospace", fontSize: 11, flexShrink: 0 }}>
                        #{ev.eventId}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{
                          color: 'var(--t-text)', fontFamily: "'Playfair Display', serif",
                          fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                          {ev.eventName}
                        </div>
                        <div style={{ color: 'var(--t-muted)', fontFamily: "'DM Sans', sans-serif", fontSize: 12, marginTop: 2 }}>
                          {ev.race}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12, flexShrink: 0 }}>
                      {isNew && (
                        <span style={{
                          color: 'var(--t-green)', fontFamily: "'DM Mono', monospace", fontSize: 9,
                          letterSpacing: '0.15em', background: 'var(--t-green-d)',
                          border: '1px solid var(--t-green-b)', borderRadius: 4, padding: '2px 6px',
                        }}>NEW</span>
                      )}
                      {!isMobile && <span style={{ color: 'var(--t-muted)', fontFamily: "'DM Mono', monospace", fontSize: 12 }}>{ev.time}</span>}
                      <StatusBadge status={ev.status === 'Official' ? 'Official' : 'Scheduled'} />
                      {ev.status !== 'Official' && clickable && (
                        <BellButton
                          watchId={`${race.id}__${encodeURIComponent(ev.detailsUrl || ev.eventId)}`}
                          watchItem={{ name: `${ev.eventName} — ${race.name}`, url: race.url, detailsUrl: ev.detailsUrl, eventId: ev.eventId, raceId: race.id }}
                          size="sm"
                        />
                      )}
                      {clickable
                        ? <span style={{ color: 'var(--t-gold)', fontFamily: "'DM Mono', monospace", fontSize: 13 }}>→</span>
                        : <span style={{ color: 'var(--t-vdim)', fontFamily: "'DM Mono', monospace", fontSize: 10 }}>TBA</span>
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )
      )}

      {/* Individual event results */}
      {selectedEvent && (
        resultsLoading ? (
          <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--t-dim)', fontFamily: "'DM Sans', sans-serif" }}>
            Loading results…
          </div>
        ) : resultsError ? (
          <div style={{
            background: 'var(--t-red-bg)', border: '1px solid var(--t-red-b)', borderRadius: 12,
            padding: 24, color: 'var(--t-red)', fontFamily: "'DM Sans', sans-serif",
          }}>
            Could not load results: {resultsError}
          </div>
        ) : entries ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--t-green-d), var(--t-bg-card))',
              border: '1px solid var(--t-green-b)', borderLeft: '3px solid var(--t-green)',
              borderRadius: 10, padding: '10px 16px',
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4,
            }}>
              <span style={{ color: 'var(--t-green)', fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', flexShrink: 0 }}>
                Lane Draw
              </span>
              <span style={{ color: 'var(--t-muted)', fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
                Results not yet posted
              </span>
            </div>
            {selectedEvent.progression && selectedEvent.progression.toLowerCase() !== 'final only' && (
              <div style={{
                background: 'linear-gradient(135deg, var(--t-gold-d), var(--t-bg-card))',
                border: '1px solid var(--t-gold-b)', borderLeft: '3px solid var(--t-gold)',
                borderRadius: 10, padding: '10px 16px',
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4,
              }}>
                <span style={{ color: 'var(--t-gold)', fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', flexShrink: 0 }}>
                  Progression
                </span>
                <span style={{ color: 'var(--t-text2)', fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
                  {selectedEvent.progression}
                </span>
              </div>
            )}
            {entries.map((entry, i) => (
              <div key={i} style={{
                background: 'linear-gradient(145deg, var(--t-bg-card), var(--t-bg))',
                border: '1px solid var(--t-border-s)', borderRadius: 10,
                padding: isMobile ? '12px 14px' : '14px 18px',
                display: 'flex', alignItems: 'flex-start', gap: 14,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: 'var(--t-gold-d)', border: '1px solid var(--t-gold-b)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--t-gold)', fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 700,
                }}>
                  {entry.lane}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    color: 'var(--t-text)', fontFamily: "'DM Sans', sans-serif",
                    fontSize: isMobile ? 13 : 14, fontWeight: 600, marginBottom: 3,
                  }}>
                    {entry.org}
                  </div>
                  {entry.athletes && (
                    <div style={{
                      color: 'var(--t-dim)', fontFamily: "'DM Sans', sans-serif",
                      fontSize: 12, lineHeight: 1.5,
                    }}>
                      {entry.athletes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : results ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {selectedEvent.progression && selectedEvent.progression.toLowerCase() !== 'final only' && (
              <div style={{
                background: 'linear-gradient(135deg, var(--t-gold-d), var(--t-bg-card))',
                border: '1px solid var(--t-gold-b)',
                borderLeft: '3px solid var(--t-gold)',
                borderRadius: 10, padding: '10px 16px',
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4,
              }}>
                <span style={{ color: 'var(--t-gold)', fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', flexShrink: 0 }}>
                  Progression
                </span>
                <span style={{ color: 'var(--t-text2)', fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
                  {selectedEvent.progression}
                </span>
              </div>
            )}
            {results.map((row, i) => {
              const medalColor = PLACE_MEDAL[row.place];
              const isFinished = !row.status.toLowerCase().includes('scratch') &&
                !row.status.toLowerCase().includes('dns') &&
                !row.status.toLowerCase().includes('dnf');
              const isFirst = row.place === '1';

              return (
                <div key={i} style={{
                  background: isFirst
                    ? 'linear-gradient(145deg, var(--t-gold-row), var(--t-bg-card))'
                    : 'linear-gradient(145deg, var(--t-bg-card), var(--t-bg))',
                  border: `1px solid ${isFirst ? 'var(--t-gold-row-b)' : 'var(--t-border-s)'}`,
                  borderRadius: 10, padding: isMobile ? '12px 12px' : '14px 18px',
                  display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 16,
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: isFinished && medalColor ? `${medalColor}18` : 'transparent',
                    border: `2px solid ${isFinished ? (medalColor || 'var(--t-border-s)') : 'var(--t-red-b)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isFinished ? (medalColor || 'var(--t-dim)') : 'var(--t-dim)',
                    fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: 12,
                  }}>
                    {isFinished ? row.place : '–'}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      color: 'var(--t-text)', fontFamily: "'DM Sans', sans-serif",
                      fontSize: isMobile ? 13 : 14, fontWeight: 600, marginBottom: 2,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {row.athlete || '—'}
                    </div>
                    <div style={{ color: 'var(--t-dim)', fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: '0.04em' }}>
                      {row.org}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {isFinished ? (
                      <>
                        <div style={{
                          color: isFirst ? 'var(--t-gold)' : 'var(--t-text2)',
                          fontFamily: "'DM Mono', monospace",
                          fontSize: 15, fontWeight: isFirst ? 700 : 400,
                        }}>
                          {row.time}
                        </div>
                        {row.delta && row.delta !== '.00' && (
                          <div style={{ color: 'var(--t-dim)', fontFamily: "'DM Mono', monospace", fontSize: 12 }}>
                            {row.delta}
                          </div>
                        )}
                      </>
                    ) : (
                      <span style={{ color: 'var(--t-dim)', fontFamily: "'DM Mono', monospace", fontSize: 12 }}>
                        {row.status}
                      </span>
                    )}
                  </div>

                  <div style={{ color: 'var(--t-vdim)', fontFamily: "'DM Mono', monospace", fontSize: 11, textAlign: 'center', flexShrink: 0 }}>
                    L{row.lane}
                  </div>
                </div>
              );
            })}
          </div>
        ) : null
      )}
    </div>
  );
}
