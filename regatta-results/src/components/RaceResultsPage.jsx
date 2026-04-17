import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams, useLocation, useSearchParams } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { toProxyUrl, parseEventList, parseEventResults, parseEntryList } from '../utils/proxy';
import { REGATTAS } from '../data/regattas';
import { useIsMobile } from '../hooks/useIsMobile';
import { addWatched, removeWatched, isWatched } from '../hooks/useResultsAlerts';

function EventBellButton({ race, ev }) {
  const watchId = `${race.id}__${ev.eventId}`;
  const [watching, setWatching] = useState(() => isWatched(watchId));
  function toggle(e) {
    e.stopPropagation();
    if (watching) {
      removeWatched(watchId);
      setWatching(false);
    } else {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      addWatched({
        id: watchId,
        name: `${ev.eventName} — ${race.name}`,
        url: race.url,
        eventId: ev.eventId,
        raceId: race.id,
      });
      setWatching(true);
    }
  }
  return (
    <button
      onClick={toggle}
      title={watching ? 'Stop watching' : 'Notify me when results are posted'}
      style={{
        background: watching ? 'rgba(74,222,128,0.15)' : 'transparent',
        border: `1px solid ${watching ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 7, padding: '3px 6px', cursor: 'pointer',
        fontSize: 12, lineHeight: 1, flexShrink: 0,
        opacity: watching ? 1 : 0.4, transition: 'all 0.2s',
      }}
    >🔔</button>
  );
}

function ShareButton({ title, text }) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (_) { /* user dismissed */ }
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
      background: copied ? 'rgba(74,222,128,0.12)' : 'rgba(212,160,23,0.08)',
      border: `1px solid ${copied ? 'rgba(74,222,128,0.3)' : 'rgba(212,160,23,0.25)'}`,
      color: copied ? '#4ade80' : '#d4a017',
      borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
      fontFamily: "'DM Mono', monospace", fontSize: 12,
      letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 6,
      transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0,
    }}>
      {copied ? '✓ Copied' : '↗ Share'}
    </button>
  );
}

function WatchButton({ race }) {
  const [watched, setWatched] = useState(() => isWatched(race.id));

  function toggle() {
    if (watched) {
      removeWatched(race.id);
      setWatched(false);
    } else {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      addWatched(race);
      setWatched(true);
    }
  }

  return (
    <button onClick={toggle} style={{
      background: watched ? 'rgba(74,222,128,0.1)' : 'rgba(212,160,23,0.08)',
      border: `1px solid ${watched ? 'rgba(74,222,128,0.3)' : 'rgba(212,160,23,0.25)'}`,
      color: watched ? '#4ade80' : '#d4a017',
      borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
      fontFamily: "'DM Mono', monospace", fontSize: 12,
      letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 6,
      transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0,
    }}>
      {watched ? '🔔 Watching' : '🔔 Notify me'}
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

export default function RaceResultsPage() {
  const { raceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [searchParams] = useSearchParams();
  const initialEventId = searchParams.get('event');
  const autoOpenedRef = useRef(false);

  const race = location.state?.race || findRaceById(raceId);

  const [events, setEvents] = useState([]);
  const [eventSearch, setEventSearch] = useState("");
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
  const [tick, setTick] = useState(0); // forces "X sec ago" to update
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

  useEffect(() => { window.scrollTo(0, 0); }, []);

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

  // Seed prevEventsRef once events first load
  useEffect(() => {
    if (events.length > 0 && prevEventsRef.current === null) {
      prevEventsRef.current = events;
    }
  }, [events]);

  // Auto-open event from ?event= URL param (for shared links)
  useEffect(() => {
    if (!initialEventId || events.length === 0 || autoOpenedRef.current) return;
    const ev = events.find(e => e.eventId === initialEventId);
    if (ev?.detailsUrl) {
      autoOpenedRef.current = true;
      openEvent(ev);
    }
  }, [events, initialEventId]); // eslint-disable-line react-hooks/exhaustive-deps

  // isLive: regatta has started but has unfinished events
  const isLive = !loading && !error && events.length > 0 &&
    events.some(e => e.status !== 'Official');

  // Auto-refresh every 60s while live
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

  // Tick every second so "updated Xs ago" stays current
  useEffect(() => {
    if (!isLive) return;
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [isLive]);

  function openEvent(ev) {
    navigate(`/results/${raceId}?event=${ev.eventId}`, { replace: true, state: location.state });
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
        <div style={{ color: '#6b7c6b', fontFamily: "'DM Sans', sans-serif", marginBottom: 24 }}>
          Race not found. It may have been fetched dynamically — go back and click it from the results list.
        </div>
        <button onClick={() => navigate('/results')} style={{
          background: 'none', border: '1px solid #1a3a1a', color: '#d4a017', cursor: 'pointer',
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
          } else {
            navigate('/results');
          }
        }}
        style={{
          background: 'none', border: 'none', color: '#d4a017', cursor: 'pointer',
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
            fontFamily: "'Playfair Display', serif", color: '#f5f0e0',
            fontSize: 'clamp(1.4rem, 4vw, 2.2rem)', margin: '0 0 10px', flex: 1,
          }}>
            {selectedEvent ? selectedEvent.eventName : race.name}
          </h2>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            {race.status === 'Upcoming' && !selectedEvent && (
              <WatchButton race={race} />
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
          <p style={{ color: '#d4a017', fontFamily: "'DM Mono', monospace", fontSize: 13, margin: '0 0 10px' }}>
            {raceLabel}
          </p>
        )}
        <div style={{
          display: 'flex', gap: 20, flexWrap: 'wrap',
          color: '#6b7c6b', fontFamily: "'DM Sans', sans-serif", fontSize: 13,
          alignItems: 'center',
        }}>
          <span>📅 {race.date}</span>
          <span>📍 {race.location}</span>
          <StatusBadge status={race.status} />
          {isLive && !selectedEvent && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%', background: '#4ade80',
                display: 'inline-block', animation: 'livePulse 1.8s ease-in-out infinite',
                flexShrink: 0,
              }} />
              <span style={{ color: '#4ade80', fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Live
              </span>
              {secsAgo !== null && (
                <span style={{ color: '#2d5a1b', fontFamily: "'DM Mono', monospace", fontSize: 11 }}>
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
          <div style={{ padding: '80px 0', textAlign: 'center', color: '#4a6b4a', fontFamily: "'DM Sans', sans-serif" }}>
            Loading events…
          </div>
        ) : error ? (
          <div style={{
            background: '#2d1b1b', border: '1px solid #7f1d1d', borderRadius: 12,
            padding: 24, color: '#f87171', fontFamily: "'DM Sans', sans-serif",
          }}>
            <div style={{ marginBottom: 12 }}>Could not load results: {error}</div>
            <a href={race.url} target="_blank" rel="noopener noreferrer"
              style={{ color: '#d4a017', fontFamily: "'DM Mono', monospace", fontSize: 12 }}>
              Open on regattaresults.co.za →
            </a>
          </div>
        ) : (
          <div>
            {/* Day tabs — only shown for multi-day regattas */}
            {days.length > 1 && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                {days.map(d => (
                  <button key={d} onClick={() => setSelectedDay(d)} style={{
                    background: activeDay === d ? '#d4a017' : '#0f220f',
                    color: activeDay === d ? '#030a03' : '#6b7c6b',
                    border: activeDay === d ? 'none' : '1px solid #1a3a1a',
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
                background: '#0f220f', border: '1px solid #1a3a1a', borderRadius: 8,
                padding: '10px 16px', color: '#e8e0c8', fontFamily: "'DM Sans', sans-serif",
                fontSize: 14, width: '100%', outline: 'none', marginBottom: 16,
                boxSizing: 'border-box',
              }}
            />
            <p style={{
              color: '#4a6b4a', fontFamily: "'DM Mono', monospace", fontSize: 11,
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
                      background: isNew ? 'linear-gradient(145deg, #0a2016, #0a1a0a)' : 'linear-gradient(145deg, #0f220f, #0a1a0a)',
                      border: `1px solid ${isNew ? 'rgba(74,222,128,0.5)' : '#1a3a1a'}`,
                      borderRadius: 10,
                      padding: '14px 18px', cursor: clickable ? 'pointer' : 'default',
                      textAlign: 'left', display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between', gap: 16,
                      opacity: clickable ? 1 : 0.5, transition: 'all 0.3s',
                    }}
                    onMouseEnter={e => { if (clickable) { e.currentTarget.style.borderColor = isNew ? '#4ade80' : '#d4a017'; e.currentTarget.style.background = 'linear-gradient(145deg, #122612, #0d1d0d)'; } }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = isNew ? 'rgba(74,222,128,0.5)' : '#1a3a1a'; e.currentTarget.style.background = isNew ? 'linear-gradient(145deg, #0a2016, #0a1a0a)' : 'linear-gradient(145deg, #0f220f, #0a1a0a)'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                      <span style={{ color: '#2d5a1b', fontFamily: "'DM Mono', monospace", fontSize: 11, flexShrink: 0 }}>
                        #{ev.eventId}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{
                          color: '#f5f0e0', fontFamily: "'Playfair Display', serif",
                          fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                          {ev.eventName}
                        </div>
                        <div style={{ color: '#6b7c6b', fontFamily: "'DM Sans', sans-serif", fontSize: 12, marginTop: 2 }}>
                          {ev.race}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12, flexShrink: 0 }}>
                      {isNew && (
                        <span style={{
                          color: '#4ade80', fontFamily: "'DM Mono', monospace", fontSize: 9,
                          letterSpacing: '0.15em', background: 'rgba(74,222,128,0.1)',
                          border: '1px solid rgba(74,222,128,0.3)', borderRadius: 4, padding: '2px 6px',
                        }}>NEW</span>
                      )}
                      {!isMobile && <span style={{ color: '#6b7c6b', fontFamily: "'DM Mono', monospace", fontSize: 12 }}>{ev.time}</span>}
                      <StatusBadge status={ev.status === 'Official' ? 'Official' : 'Scheduled'} />
                      {ev.status !== 'Official' && clickable && (
                        <EventBellButton race={race} ev={ev} />
                      )}
                      {clickable
                        ? <span style={{ color: '#d4a017', fontFamily: "'DM Mono', monospace", fontSize: 13 }}>→</span>
                        : <span style={{ color: '#2d5a1b', fontFamily: "'DM Mono', monospace", fontSize: 10 }}>TBA</span>
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
          <div style={{ padding: '80px 0', textAlign: 'center', color: '#4a6b4a', fontFamily: "'DM Sans', sans-serif" }}>
            Loading results…
          </div>
        ) : resultsError ? (
          <div style={{
            background: '#2d1b1b', border: '1px solid #7f1d1d', borderRadius: 12,
            padding: 24, color: '#f87171', fontFamily: "'DM Sans', sans-serif",
          }}>
            Could not load results: {resultsError}
          </div>
        ) : entries ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Lane draw banner */}
            <div style={{
              background: 'linear-gradient(135deg, #0a1a14, #0f220f)',
              border: '1px solid #1a3a2a', borderLeft: '3px solid #4ade80',
              borderRadius: 10, padding: '10px 16px',
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4,
            }}>
              <span style={{ color: '#4ade80', fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', flexShrink: 0 }}>
                Lane Draw
              </span>
              <span style={{ color: '#6b7c6b', fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
                Results not yet posted
              </span>
            </div>
            {/* Progression rules */}
            {selectedEvent.progression && selectedEvent.progression.toLowerCase() !== 'final only' && (
              <div style={{
                background: 'linear-gradient(135deg, #0f1e0a, #0a1a14)',
                border: '1px solid #1a3a2a', borderLeft: '3px solid #d4a017',
                borderRadius: 10, padding: '10px 16px',
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4,
              }}>
                <span style={{ color: '#d4a017', fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', flexShrink: 0 }}>
                  Progression
                </span>
                <span style={{ color: '#e8e0c8', fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
                  {selectedEvent.progression}
                </span>
              </div>
            )}
            {entries.map((entry, i) => (
              <div key={i} style={{
                background: 'linear-gradient(145deg, #0f220f, #0a1a0a)',
                border: '1px solid #1a3a1a', borderRadius: 10,
                padding: isMobile ? '12px 14px' : '14px 18px',
                display: 'flex', alignItems: 'flex-start', gap: 14,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(212,160,23,0.08)', border: '1px solid rgba(212,160,23,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#d4a017', fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 700,
                }}>
                  {entry.lane}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    color: '#f5f0e0', fontFamily: "'DM Sans', sans-serif",
                    fontSize: isMobile ? 13 : 14, fontWeight: 600, marginBottom: 3,
                  }}>
                    {entry.org}
                  </div>
                  {entry.athletes && (
                    <div style={{
                      color: '#4a6b4a', fontFamily: "'DM Sans', sans-serif",
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
            {/* Progression banner */}
            {selectedEvent.progression && selectedEvent.progression.toLowerCase() !== 'final only' && (
              <div style={{
                background: 'linear-gradient(135deg, #0f1e0a, #0a1a14)',
                border: '1px solid #1a3a2a',
                borderLeft: '3px solid #d4a017',
                borderRadius: 10, padding: '10px 16px',
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4,
              }}>
                <span style={{ color: '#d4a017', fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', flexShrink: 0 }}>
                  Progression
                </span>
                <span style={{ color: '#e8e0c8', fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
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
                  background: isFirst ? 'linear-gradient(145deg, #1c1600, #0f220f)' : 'linear-gradient(145deg, #0f220f, #0a1a0a)',
                  border: `1px solid ${isFirst ? '#3d2e00' : '#1a3a1a'}`,
                  borderRadius: 10, padding: isMobile ? '12px 12px' : '14px 18px',
                  display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 16,
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: isFinished && medalColor ? `${medalColor}18` : 'transparent',
                    border: `2px solid ${isFinished ? (medalColor || '#1a3a1a') : '#2d1b1b'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isFinished ? (medalColor || '#4a6b4a') : '#4a6b4a',
                    fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: 12,
                  }}>
                    {isFinished ? row.place : '–'}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      color: '#f5f0e0', fontFamily: "'DM Sans', sans-serif",
                      fontSize: isMobile ? 13 : 14, fontWeight: 600, marginBottom: 2,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {row.athlete || '—'}
                    </div>
                    <div style={{ color: '#4a6b4a', fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: '0.04em' }}>
                      {row.org}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {isFinished ? (
                      <>
                        <div style={{
                          color: isFirst ? '#d4a017' : '#e8e0c8',
                          fontFamily: "'DM Mono', monospace",
                          fontSize: 15, fontWeight: isFirst ? 700 : 400,
                        }}>
                          {row.time}
                        </div>
                        {row.delta && row.delta !== '.00' && (
                          <div style={{ color: '#4a6b4a', fontFamily: "'DM Mono', monospace", fontSize: 12 }}>
                            {row.delta}
                          </div>
                        )}
                      </>
                    ) : (
                      <span style={{ color: '#4a6b4a', fontFamily: "'DM Mono', monospace", fontSize: 12 }}>
                        {row.status}
                      </span>
                    )}
                  </div>

                  <div style={{ color: '#2d5a1b', fontFamily: "'DM Mono', monospace", fontSize: 11, textAlign: 'center', flexShrink: 0 }}>
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
