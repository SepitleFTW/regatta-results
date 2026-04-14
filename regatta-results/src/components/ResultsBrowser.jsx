import { useState, useEffect } from 'react';
import StatusBadge from './StatusBadge';
import { YEARS, PROVINCES, REGATTAS } from '../data/regattas';

// Some years use non-standard slugs on regattaresults.co.za
const YEAR_SLUGS = {
  2025: '2025-results',
};
const yearSlug = y => YEAR_SLUGS[y] ?? `${y}-2`;

export default function ResultsBrowser({ onRaceSelect }) {
  const [year, setYear] = useState(2026);
  const [province, setProvince] = useState("All");
  const [search, setSearch] = useState("");
  const [fetched, setFetched] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setFetched(null);
    setFetchError(null);
    fetch(`/rr-proxy/home/${yearSlug(year)}/`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text(); })
      .then(html => {
        if (cancelled) return;
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const links = [...doc.querySelectorAll('a[href*="results.htm"]')];
        const hardcoded = REGATTAS[year] || [];
        const norm = u => u.replace(/^https?:\/\/(www\.)?/, '');
        const hardcodedNorms = new Set(hardcoded.map(r => norm(r.url)));
        const newRaces = links
          .filter(a => !hardcodedNorms.has(norm(a.getAttribute('href'))))
          .map(a => {
            const url = a.getAttribute('href');
            const text = a.textContent.trim();
            const lastDash = text.lastIndexOf(' - ');
            const name = lastDash > 0 ? text.substring(0, lastDash).trim() : text;
            const dateStr = lastDash > 0 ? text.substring(lastDash + 3).trim() : '';
            return {
              id: url.split('/').filter(Boolean).slice(-2)[0],
              name,
              date: dateStr ? `${dateStr} ${year}` : '',
              location: '',
              province: '',
              status: 'Official',
              url,
            };
          });
        setFetched([...hardcoded, ...newRaces]);
      })
      .catch(e => { if (!cancelled) setFetchError(e.message); });
    return () => { cancelled = true; };
  }, [year]);

  const allRegattas = fetched ?? REGATTAS[year] ?? [];
  const regattas = allRegattas.filter(r =>
    (province === "All" || r.province === province) &&
    (search === "" || r.name.toLowerCase().includes(search.toLowerCase()) || r.location.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ padding: "32px 24px", maxWidth: 1100, margin: "0 auto" }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#f5f0e0", fontSize: "2.2rem", marginBottom: 8 }}>Results</h2>
      <p style={{ color: "#6b7c6b", marginBottom: 32, fontFamily: "'DM Sans', sans-serif" }}>
        Browse South African rowing regattas by year. Click a race to view results.
      </p>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 28, borderBottom: "1px solid #1a3a1a", paddingBottom: 16 }}>
        {YEARS.map(y => (
          <button key={y} onClick={() => { setYear(y); setSearch(""); setProvince("All"); }} style={{
            background: year === y ? "#d4a017" : "transparent",
            color: year === y ? "#030a03" : "#6b7c6b",
            border: year === y ? "none" : "1px solid #1a3a1a",
            borderRadius: 8, padding: "7px 18px", fontSize: 14,
            fontWeight: year === y ? 700 : 500, cursor: "pointer",
            fontFamily: "'DM Mono', monospace", transition: "all 0.15s"
          }}>{y}</button>
        ))}
      </div>

      {fetched === null && !fetchError && (
        <div style={{ padding: "80px 0", textAlign: "center", color: "#4a6b4a", fontFamily: "'DM Sans', sans-serif" }}>
          Loading {year} regattas…
        </div>
      )}

      {fetchError && (
        <div style={{ background: "#0f220f", border: "1px solid #1a3a1a", borderRadius: 20, padding: "64px 48px", textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 20 }}>🚣</div>
          <h3 style={{ color: "#f5f0e0", fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", marginBottom: 12 }}>{year} Results</h3>
          <p style={{ color: "#6b7c6b", fontFamily: "'DM Sans', sans-serif", marginBottom: 32, maxWidth: 400, margin: "0 auto 32px" }}>
            View the full archive for {year} directly on regattaresults.co.za.
          </p>
          <a href={`https://regattaresults.co.za/home/${yearSlug(year)}/`} target="_blank" rel="noopener noreferrer" style={{
            background: "#d4a017", color: "#030a03", borderRadius: 8, padding: "14px 32px",
            fontSize: 15, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
            textDecoration: "none", display: "inline-block",
          }}>
            View {year} on regattaresults.co.za →
          </a>
        </div>
      )}

      {fetched !== null && (
        <>
          <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap", alignItems: "center" }}>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search regattas or venues…"
              style={{
                background: "#0f220f", border: "1px solid #1a3a1a", borderRadius: 8,
                padding: "10px 16px", color: "#e8e0c8", fontFamily: "'DM Sans', sans-serif",
                fontSize: 14, flex: 1, minWidth: 200, outline: "none"
              }}
            />
            <select value={province} onChange={e => setProvince(e.target.value)} style={{
              background: "#0f220f", border: "1px solid #1a3a1a", borderRadius: 8,
              padding: "10px 16px", color: "#e8e0c8", fontFamily: "'DM Sans', sans-serif",
              fontSize: 14, cursor: "pointer", outline: "none"
            }}>
              {PROVINCES.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>

          {regattas.length === 0 ? (
            <div style={{
              background: "#0f220f", border: "1px dashed #1a3a1a", borderRadius: 16,
              padding: "48px", textAlign: "center", color: "#4a6b4a",
              fontFamily: "'DM Sans', sans-serif", fontSize: 15
            }}>No regattas found for the selected filters.</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
              {regattas.map(r => (
                <div
                  key={r.id}
                  onClick={() => r.status !== "Upcoming" && onRaceSelect(r)}
                  style={{ cursor: r.status !== "Upcoming" ? "pointer" : "default" }}
                >
                  <div style={{
                    background: "linear-gradient(145deg, #0f220f, #0a1a0a)",
                    border: "1px solid #1a3a1a", borderRadius: 16,
                    padding: "24px", transition: "all 0.2s", position: "relative", overflow: "hidden",
                    height: "100%"
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#d4a017"; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.3)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a3a1a"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
                  >
                    <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, background: "radial-gradient(circle, rgba(212,160,23,0.07) 0%, transparent 70%)", borderRadius: "0 16px 0 80px" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                      <StatusBadge status={r.status} />
                      {r.province && <span style={{ color: "#2d5a1b", fontSize: 11, fontFamily: "'DM Mono', monospace" }}>{r.province}</span>}
                    </div>
                    <h3 style={{ color: "#f5f0e0", fontFamily: "'Playfair Display', serif", fontSize: "1.15rem", marginBottom: 10, lineHeight: 1.3 }}>{r.name}</h3>
                    <div style={{ color: "#6b7c6b", fontSize: 13, fontFamily: "'DM Sans', sans-serif", display: "flex", flexDirection: "column", gap: 4 }}>
                      {r.date && <span>📅 {r.date}</span>}
                      {r.location && <span>📍 {r.location}</span>}
                    </div>
                    <div style={{ marginTop: 16 }}>
                      <span style={{ color: "#d4a017", fontSize: 12, fontFamily: "'DM Mono', monospace" }}>
                        {r.status === "Upcoming" ? "Results coming soon" : "View results →"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
