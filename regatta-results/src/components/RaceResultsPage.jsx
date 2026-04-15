import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { toProxyUrl, parseEventList, parseEventResults } from '../utils/proxy';
import { REGATTAS } from '../data/regattas';
import { useIsMobile } from '../hooks/useIsMobile';

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

  const race = location.state?.race || findRaceById(raceId);

  const [events, setEvents] = useState([]);
  const [eventSearch, setEventSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [results, setResults] = useState(null);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState(null);

  const filteredEvents = eventSearch.trim()
    ? events.filter(ev =>
        ev.eventName.toLowerCase().includes(eventSearch.toLowerCase()) ||
        ev.race.toLowerCase().includes(eventSearch.toLowerCase())
      )
    : events;

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    if (!race) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    const proxyUrl = toProxyUrl(race.url);
    fetch(proxyUrl)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text(); })
      .then(html => { if (!cancelled) setEvents(parseEventList(html, proxyUrl)); })
      .catch(e => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [race?.url]);

  function openEvent(ev) {
    setSelectedEvent(ev);
    setResults(null);
    setResultsError(null);
    setResultsLoading(true);
    window.scrollTo(0, 0);
    fetch(ev.detailsUrl)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text(); })
      .then(html => setResults(parseEventResults(html)))
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

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? '24px 14px' : '32px 24px' }}>
      <button
        onClick={() => selectedEvent ? setSelectedEvent(null) : navigate('/results')}
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
        <h2 style={{
          fontFamily: "'Playfair Display', serif", color: '#f5f0e0',
          fontSize: 'clamp(1.4rem, 4vw, 2.2rem)', margin: '0 0 10px',
        }}>
          {selectedEvent ? selectedEvent.eventName : race.name}
        </h2>
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
              {filteredEvents.map((ev, i) => (
                <button key={i} onClick={() => openEvent(ev)} style={{
                  background: 'linear-gradient(145deg, #0f220f, #0a1a0a)',
                  border: '1px solid #1a3a1a', borderRadius: 10,
                  padding: '14px 18px', cursor: 'pointer', textAlign: 'left',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: 16, width: '100%', transition: 'all 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#d4a017'; e.currentTarget.style.background = 'linear-gradient(145deg, #122612, #0d1d0d)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#1a3a1a'; e.currentTarget.style.background = 'linear-gradient(145deg, #0f220f, #0a1a0a)'; }}
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
                    {!isMobile && <span style={{ color: '#6b7c6b', fontFamily: "'DM Mono', monospace", fontSize: 12 }}>{ev.time}</span>}
                    <StatusBadge status={ev.status === 'Official' ? 'Official' : 'Scheduled'} />
                    <span style={{ color: '#d4a017', fontFamily: "'DM Mono', monospace", fontSize: 13 }}>→</span>
                  </div>
                </button>
              ))}
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
                  borderRadius: 10, padding: '14px 18px',
                  display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
                }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                    background: isFinished && medalColor ? `${medalColor}18` : 'transparent',
                    border: `2px solid ${isFinished ? (medalColor || '#1a3a1a') : '#2d1b1b'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isFinished ? (medalColor || '#4a6b4a') : '#4a6b4a',
                    fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: 13,
                  }}>
                    {isFinished ? row.place : '–'}
                  </div>

                  <div style={{ flex: 1, minWidth: 120 }}>
                    <div style={{ color: '#f5f0e0', fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, marginBottom: 2 }}>
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
