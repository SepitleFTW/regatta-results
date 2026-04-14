import { useState, useEffect } from "react";

// ─── Real Data from regattaresults.co.za ──────────────────────────────────
const YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014];

const REGATTAS = {
  2026: [
    { id: "kes-jan", name: "KES U16, U19 & Seniors", date: "17 Jan 2026", location: "Roodeplaat Dam", province: "Gauteng", status: "Official", url: "http://regattaresults.co.za/Results/Results2026/2026-Jan-KES/results.htm" },
    { id: "vlc-jan", name: "VLC Nationals Sprints", date: "24–25 Jan 2026", location: "Germiston Lake", province: "Gauteng", status: "Official", url: "http://regattaresults.co.za/Results/Results2026/2026-Jan-VLC/results.htm" },
    { id: "nick-jan", name: "WC Nick Whaits Regatta", date: "24 Jan 2026", location: "Western Cape", province: "Western Cape", status: "Official", url: "http://regattaresults.co.za/Results/Results2026/2026-Jan-NickW/results.htm" },
    { id: "hrs-jan", name: "Holy Rosary U14, U15 & Masters", date: "31 Jan 2026", location: "Germiston Lake", province: "Gauteng", status: "Official", url: "http://regattaresults.co.za/Results/Results2026/2026-Jan-HRS/results.htm" },
    { id: "ec-champs", name: "EC Champs", date: "31 Jan 2026", location: "East London", province: "Eastern Cape", status: "Official", url: "http://regattaresults.co.za/Results/Results2026/2026-Jan-ECChamps/results.htm" },
    { id: "buffalo-feb", name: "Buffalo Regatta", date: "5 & 7 Feb 2026", location: "Buffalo City", province: "Eastern Cape", status: "Official", url: "http://regattaresults.co.za/Results/Results2026/2026-Feb-Buffalo/results.htm" },
    { id: "selborne-feb", name: "Selborne Sprints", date: "6 Feb 2026", location: "East London", province: "Eastern Cape", status: "Official", url: "http://regattaresults.co.za/Results/Results2026/2026-Feb-Selborne/results.htm" },
    { id: "jeppe-feb", name: "Jeppe U14, U15 & Masters", date: "14 Feb 2026", location: "Germiston Lake", province: "Gauteng", status: "Official", url: "http://regattaresults.co.za/Results/Results2026/2026-Feb-Jep1415M/results.htm" },
    { id: "albans-feb", name: "St Albans U16, U19 & Seniors", date: "21 Feb 2026", location: "Roodeplaat Dam", province: "Gauteng", status: "Official", url: "http://regattaresults.co.za/Results/Results2026/2026-Feb-Albans1619S/results.htm" },
    { id: "assumption-feb", name: "Assumption U14, U15 & Masters", date: "28 Feb 2026", location: "Roodeplaat Dam", province: "Gauteng", status: "Official", url: "http://regattaresults.co.za/Results/Results2026/2026-Feb-AC1415M/results.htm" },
    { id: "sa-schools", name: "SA Schools Champs", date: "6–8 Mar 2026", location: "Roodeplaat Dam", province: "Gauteng", status: "Official", url: "https://regattaresults.co.za/Results/Results2026/2026-Feb-SASChamps/results.htm" },
  ],
  2025: [
    { id: "kes-2025", name: "KES GSRF U16 & U19 Regatta", date: "18 Jan 2025", location: "Roodeplaat Dam", province: "Gauteng", status: "Official", url: "https://regattaresults.co.za/Results/Results2025/2025-Jan-KES1619/results.htm" },
    { id: "wc-newyear-2025", name: "WC New Year Regatta", date: "18 Jan 2025", location: "Western Cape", province: "Western Cape", status: "Official", url: "https://regattaresults.co.za/Results/Results2025/2025-Jan-WCNewYear/results.htm" },
    { id: "vlc-2025", name: "ISIS Engineering VLC National Sprints", date: "25–26 Jan 2025", location: "Germiston Lake", province: "Gauteng", status: "Official", url: "https://regattaresults.co.za/Results/Results2025/2025-Jan-VLCSprints/results.htm" },
    { id: "wc-champs-2025", name: "WC Champs", date: "25 Jan 2025", location: "Western Cape", province: "Western Cape", status: "Official", url: "https://regattaresults.co.za/Results/Results2025/2025-Jan-WCchamps/results.htm" },
    { id: "ecra-2025", name: "ECRA Champs", date: "1 Feb 2025", location: "East London", province: "Eastern Cape", status: "Official", url: "https://regattaresults.co.za/Results/Results2025/2025-Feb-ECRAChamps/results.htm" },
    { id: "jeppe-2025", name: "Jeppe U14 & U15 GSRF Regatta", date: "1 Feb 2025", location: "Germiston Lake", province: "Gauteng", status: "Official", url: "https://regattaresults.co.za/Results/Results2025/2025-Feb-Jeppe1415/results.htm" },
    { id: "buffalo-2025", name: "Buffalo Regatta", date: "6 & 8 Feb 2025", location: "Buffalo City", province: "Eastern Cape", status: "Official", url: "https://regattaresults.co.za/Results/Results2025/2025-Feb-Buffalo/results.htm" },
    { id: "selborne-2025", name: "Selborne Sprints", date: "7 Feb 2025", location: "East London", province: "Eastern Cape", status: "Official", url: "https://regattaresults.co.za/Results/Results2025/2025-Feb-SelborneS/results.htm" },
    { id: "saints-2025", name: "St Stithians GSRF U16 & U19", date: "15 Feb 2025", location: "Roodeplaat Dam", province: "Gauteng", status: "Official", url: "https://regattaresults.co.za/Results/Results2025/2025-Feb-Saints1619/results.htm" },
    { id: "albans-2025", name: "St Albans Regatta", date: "22 Feb 2025", location: "Roodeplaat Dam", province: "Gauteng", status: "Official", url: "https://regattaresults.co.za/Results/Results2025/2025-Feb-Albans/results.htm" },
    { id: "sa-schools-2025", name: "SA Schools Champs", date: "28 Feb – 2 Mar 2025", location: "Roodeplaat Dam", province: "Gauteng", status: "Official", url: "https://regattaresults.co.za/Results/Results2025/2025-Mar-SAChamps/results.htm" },
    { id: "ussar-2025", name: "USSAR Sprints", date: "4–5 Apr 2025", location: "Roodeplaat Dam", province: "Gauteng", status: "Official", url: "https://regattaresults.co.za/Results/Results2025/2025-Apr-USSAR/results.htm" },
    { id: "gp-champs-2025", name: "Gauteng Champs", date: "12 Apr 2025", location: "Roodeplaat Dam", province: "Gauteng", status: "Official", url: "https://regattaresults.co.za/Results/Results2025/2025-Apr-Gauteng/results.htm" },
    { id: "sa-champs-2025", name: "SA National Rowing Champs", date: "26–27 Apr 2025", location: "Roodeplaat Dam", province: "Gauteng", status: "Official", url: "https://regattaresults.co.za/Results/Results2025/2025-Apr-SANChamps/results.htm" },
    { id: "bennies-sept-2025", name: "St Bennies U14 & U15", date: "20 Sep 2025", location: "Roodeplaat Dam", province: "Gauteng", status: "Official", url: "http://regattaresults.co.za/Results/Results2025/2025-Sept-Ben1415/results.htm" },
    { id: "sj-sept-2025", name: "St John's U16, U19 & Snr", date: "27 Sep 2025", location: "Roodeplaat Dam", province: "Gauteng", status: "Official", url: "http://www.regattaresults.co.za/Results/Results2025/2025-Sept-SJ1619S/results.htm" },
    { id: "mary-oct-2025", name: "St Mary's U14, U15 & Masters", date: "4 Oct 2025", location: "Roodeplaat Dam", province: "Gauteng", status: "Official", url: "http://www.regattaresults.co.za/Results/Results2025/2025-Oct-Mary1415S/results.htm" },
    { id: "mile-oct-2025", name: "The Mile Regatta", date: "11–12 Oct 2025", location: "Roodeplaat Dam", province: "Gauteng", status: "Official", url: "http://www.regattaresults.co.za/Results/Results2025/2025-Oct-Mile/results.htm" },
    { id: "saints-oct-2025", name: "St Stithian's U16, U19 & Seniors", date: "18 Oct 2025", location: "Roodeplaat Dam", province: "Gauteng", status: "Official", url: "http://regattaresults.co.za/Results/Results2025/2025-Oct-Saints1619s/results.htm" },
    { id: "cpc-2025", name: "Cape Peninsula Champs", date: "18–19 Oct 2025", location: "Western Cape", province: "Western Cape", status: "Official", url: "http://regattaresults.co.za/Results/Results2025/2025-Oct-CPC/results.htm" },
    { id: "dunstans-2025", name: "St Dunstan's U14, U15 & Masters", date: "25 Oct 2025", location: "East London", province: "Eastern Cape", status: "Official", url: "http://www.regattaresults.co.za/Results/Results2025/2025-Oct-Dunstans1415M/results.htm" },
    { id: "wc-champs-oct-2025", name: "WC Champs", date: "25–26 Oct 2025", location: "Western Cape", province: "Western Cape", status: "Official", url: "http://www.regattaresults.co.za/Results/Results2025/2025-Oct-WCChamps/results.htm" },
    { id: "gsrf-2025", name: "GSRF & Africa Champs", date: "31 Oct – 2 Nov 2025", location: "Roodeplaat Dam", province: "Gauteng", status: "Official", url: "http://www.regattaresults.co.za/Results/Results2025/2025-OctNov-GSRF/results.htm" },
  ],
  2024: [
    { id: "mary-jan-2024", name: "St Mary's", date: "Jan 2024", location: "Roodeplaat Dam", province: "Gauteng", status: "Official", url: "http://regattaresults.co.za/Results/Results2024/2024-jan-stmarys/results.htm" },
    { id: "wc-novice-2024", name: "WC Novice", date: "Jan 2024", location: "Western Cape", province: "Western Cape", status: "Official", url: "http://regattaresults.co.za/Results/Results2024/2024-jan-summer/results.htm" },
    { id: "vlc-2024", name: "VLC", date: "Jan 2024", location: "Germiston Lake", province: "Gauteng", status: "Official", url: "http://regattaresults.co.za/Results/Results2024/2024-jan-vlc/results.htm" },
    { id: "wc-champ-jan-2024", name: "WC Champs", date: "Jan 2024", location: "Western Cape", province: "Western Cape", status: "Official", url: "http://regattaresults.co.za/Results/Results2024/2024-jan-wcchamp/results.htm" },
    { id: "buffalo-2024", name: "Buffalo Regatta", date: "Feb 2024", location: "Buffalo City", province: "Eastern Cape", status: "Official", url: "http://regattaresults.co.za/Results/Results2024/2024-feb-buffalo/results.htm" },
    { id: "ecra-2024", name: "ECRA Champs", date: "Feb 2024", location: "East London", province: "Eastern Cape", status: "Official", url: "http://regattaresults.co.za/Results/Results2024/2024-feb-ecra/results.htm" },
    { id: "harvest-2024", name: "Harvest Regatta", date: "Feb 2024", location: "Roodeplaat Dam", province: "Gauteng", status: "Official", url: "http://regattaresults.co.za/Results/Results2024/2024-feb-harvest/results.htm" },
    { id: "jeppe-2024", name: "Jeppe Regatta", date: "Feb 2024", location: "Germiston Lake", province: "Gauteng", status: "Official", url: "http://regattaresults.co.za/Results/Results2024/2024-feb-jeppe/results.htm" },
    { id: "selborne-2024", name: "Selborne Sprints", date: "Feb 2024", location: "East London", province: "Eastern Cape", status: "Official", url: "http://regattaresults.co.za/Results/Results2024/2024-feb-selborne/results.htm" },
    { id: "albans-2024", name: "St Albans Regatta", date: "Feb 2024", location: "Roodeplaat Dam", province: "Gauteng", status: "Official", url: "http://regattaresults.co.za/Results/Results2024/2024-feb-stalbanss/results.htm" },
    { id: "sj-feb-2024", name: "St John's Regatta", date: "Feb 2024", location: "Roodeplaat Dam", province: "Gauteng", status: "Official", url: "http://regattaresults.co.za/Results/Results2024/2024-feb-stjohns/results.htm" },
    { id: "wc-seniors-2024", name: "WC Seniors Champs", date: "Feb 2024", location: "Western Cape", province: "Western Cape", status: "Official", url: "http://regattaresults.co.za/Results/Results2024/2024-feb-wcchamp/results.htm" },
    { id: "sa-schools-2024", name: "SA Schools Champs", date: "Mar 2024", location: "Roodeplaat Dam", province: "Gauteng", status: "Official", url: "http://regattaresults.co.za/Results/Results2024/2024-mar-saschools/results.htm" },
    { id: "gp-champs-2024", name: "Gauteng Champs", date: "Apr 2024", location: "Roodeplaat Dam", province: "Gauteng", status: "Official", url: "http://regattaresults.co.za/Results/Results2024/2024-apr-gc/results.htm" },
    { id: "sa-senior-2024", name: "SA Senior Champs", date: "Apr 2024", location: "Roodeplaat Dam", province: "Gauteng", status: "Official", url: "http://regattaresults.co.za/Results/Results2024/2024-apr-sac/results.htm" },
    { id: "ussa-2024", name: "USSA Regatta", date: "Apr 2024", location: "Roodeplaat Dam", province: "Gauteng", status: "Official", url: "http://regattaresults.co.za/Results/Results2024/2024-apr-ussa-r/results.htm" },
    { id: "blades-2024", name: "The Blades", date: "7–8 Sep 2024", location: "Roodeplaat Dam", province: "Gauteng", status: "Official", url: "http://regattaresults.co.za/Results/Results2024/2024-blades-sept/results.htm" },
    { id: "bennies-2024", name: "St Bennies", date: "21 Sep 2024", location: "Roodeplaat Dam", province: "Gauteng", status: "Official", url: "http://regattaresults.co.za/Results/Results2024/2024-sept-bennies/results.htm.pdf" },
    { id: "sj-sept-2024", name: "St John's Regatta", date: "28 Sep 2024", location: "Roodeplaat Dam", province: "Gauteng", status: "Official", url: "http://regattaresults.co.za/Results/Results2024/2024-sept-SJ/results.htm" },
    { id: "hrs-2024", name: "Holy Rosary", date: "5 Oct 2024", location: "Germiston Lake", province: "Gauteng", status: "Official", url: "http://regattaresults.co.za/Results/Results2024/2024-oct-HRS/results.htm" },
    { id: "cape-2024", name: "Cape Peninsula Regatta", date: "11–13 Oct 2024", location: "Western Cape", province: "Western Cape", status: "Official", url: "http://regattaresults.co.za/Results/Results2024/2024-oct-cape/results.htm" },
    { id: "mary-oct-2024", name: "St Mary's Regatta", date: "12 Oct 2024", location: "Roodeplaat Dam", province: "Gauteng", status: "Official", url: "http://regattaresults.co.za/Results/Results2024/2024-oct-stmary/results.htm" },
    { id: "mile-2024", name: "The Mile Knock", date: "19–20 Oct 2024", location: "Roodeplaat Dam", province: "Gauteng", status: "Official", url: "http://regattaresults.co.za/Results/Results2024/2024-oct-mile/results.htm" },
    { id: "nwhaits-2024", name: "Nick Whaits Novice", date: "19 Oct 2024", location: "Western Cape", province: "Western Cape", status: "Official", url: "http://regattaresults.co.za/Results/Results2024/2024-oct-nwhaits/results.htm" },
    { id: "stben-2024", name: "St Benedict's U14 & U15", date: "26 Oct 2024", location: "East London", province: "Eastern Cape", status: "Official", url: "http://regattaresults.co.za/Results/Results2024/2024-oct-stben/results.htm" },
    { id: "gp-schools-2024", name: "Gauteng School Championships", date: "1–3 Nov 2024", location: "Roodeplaat Dam", province: "Gauteng", status: "Official", url: "http://regattaresults.co.za/Results/Results2024/2024-nov-gpchamps/results.htm" },
  ],
};

// For older years, link to the year page on the real site
const YEAR_PAGES = {
  2023: "https://regattaresults.co.za/home/2023-2/",
  2022: "https://regattaresults.co.za/home/2022-2/",
  2021: "https://regattaresults.co.za/home/2021-2/",
  2020: "https://regattaresults.co.za/home/2020-2/",
  2019: "https://regattaresults.co.za/home/2019-2/",
  2018: "https://regattaresults.co.za/home/2018-2/",
  2017: "https://regattaresults.co.za/home/2017-2/",
  2016: "https://regattaresults.co.za/home/2016-2/",
  2015: "https://regattaresults.co.za/home/2015-2/",
  2014: "https://regattaresults.co.za/home/2014-2/",
};

const PROVINCES = ["All", "Gauteng", "Western Cape", "Eastern Cape", "KwaZulu-Natal"];

// ─── Helpers ───────────────────────────────────────────────────────────────
const Wave = () => (
  <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: 80 }}>
    <path fill="#0a1a0a" d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" />
  </svg>
);

const OarIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <ellipse cx="14" cy="6" rx="5" ry="3" fill="#d4a017" opacity="0.9" />
    <rect x="13" y="8" width="2" height="16" rx="1" fill="#d4a017" opacity="0.9" />
    <circle cx="14" cy="25" r="1.5" fill="#f0c040" />
  </svg>
);

const StatusBadge = ({ status }) => {
  const colors = {
    Official: { bg: "#0d2e0d", text: "#4ade80", border: "#166534" },
    Upcoming: { bg: "#2a1f00", text: "#f0c040", border: "#92400e" },
    Scheduled: { bg: "#2d1b1b", text: "#f87171", border: "#7f1d1d" },
  };
  const c = colors[status] || colors.Scheduled;
  return (
    <span style={{
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700,
      letterSpacing: "0.08em", textTransform: "uppercase"
    }}>{status}</span>
  );
};

// ─── Proxy helpers ─────────────────────────────────────────────────────────
function toProxyUrl(url) {
  return url.replace(/^https?:\/\/(www\.)?regattaresults\.co\.za/, '/rr-proxy');
}

function parseEventList(html, proxyUrl) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const baseDir = proxyUrl.substring(0, proxyUrl.lastIndexOf('/') + 1);
  const rows = [...doc.querySelectorAll('table tr')];
  return rows
    .filter(r => r.querySelectorAll('td').length >= 7)
    .map(row => {
      const cells = [...row.querySelectorAll('td')];
      const link = cells[7]?.querySelector('a');
      const href = link?.getAttribute('href');
      return {
        eventId: cells[0]?.textContent.trim(),
        eventName: cells[1]?.textContent.trim(),
        race: cells[2]?.textContent.trim(),
        time: cells[4]?.textContent.trim(),
        status: cells[5]?.textContent.trim(),
        detailsUrl: href ? baseDir + href : null,
      };
    })
    .filter(r => r.eventName && r.detailsUrl);
}

function parseEventResults(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const rows = [...doc.querySelectorAll('table tr')]
    .filter(r => r.querySelectorAll('td').length >= 5)
    .map(row => {
      const cells = [...row.querySelectorAll('td')];
      return {
        place: cells[0]?.textContent.trim(),
        lane: cells[1]?.textContent.trim(),
        org: cells[3]?.textContent.trim(),
        time: cells[4]?.textContent.trim(),
        delta: cells[6]?.textContent.trim() || '',
        status: cells[7]?.textContent.trim() || 'Finished',
        athlete: cells[8]?.textContent.trim() || '',
      };
    })
    .filter(r => r.place && r.org);
  return rows;
}

// ─── Race Results Page ─────────────────────────────────────────────────────
const PLACE_MEDAL = { '1': '#d4a017', '2': '#9ca3af', '3': '#a0522d' };

function RaceResultsPage({ race, onBack }) {
  const [events, setEvents] = useState([]);
  const [eventSearch, setEventSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [results, setResults] = useState(null);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState(null);

  const proxyUrl = toProxyUrl(race.url);
  const filteredEvents = eventSearch.trim()
    ? events.filter(ev =>
        ev.eventName.toLowerCase().includes(eventSearch.toLowerCase()) ||
        ev.race.toLowerCase().includes(eventSearch.toLowerCase())
      )
    : events;

  // Scroll to top on mount
  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Load event list
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(proxyUrl)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text(); })
      .then(html => { if (!cancelled) setEvents(parseEventList(html, proxyUrl)); })
      .catch(e => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [proxyUrl]);

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

  const raceLabel = selectedEvent
    ? selectedEvent.race.includes(' - ')
      ? selectedEvent.race.split(' - ').slice(1).join(' ')
      : selectedEvent.race
    : null;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      {/* Back button */}
      <button
        onClick={() => selectedEvent ? setSelectedEvent(null) : onBack()}
        style={{
          background: 'none', border: 'none', color: '#d4a017', cursor: 'pointer',
          fontFamily: "'DM Mono', monospace", fontSize: 12, letterSpacing: '0.12em',
          textTransform: 'uppercase', padding: 0, marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 6,
        }}
      >
        ← {selectedEvent ? 'All events' : 'All regattas'}
      </button>

      {/* Page header */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{
          fontFamily: "'Playfair Display', serif", color: '#f5f0e0',
          fontSize: 'clamp(1.4rem, 4vw, 2.2rem)', margin: '0 0 10px',
        }}>
          {selectedEvent ? `${selectedEvent.eventName}` : race.name}
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

      {/* ── Event list ── */}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                    <span style={{ color: '#6b7c6b', fontFamily: "'DM Mono', monospace", fontSize: 12 }}>{ev.time}</span>
                    <StatusBadge status={ev.status === 'Official' ? 'Official' : 'Scheduled'} />
                    <span style={{ color: '#d4a017', fontFamily: "'DM Mono', monospace", fontSize: 13 }}>→</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )
      )}

      {/* ── Individual event results ── */}
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
            {results.map((row, i) => {
              const medalColor = PLACE_MEDAL[row.place];
              const isFinished = !row.status.toLowerCase().includes('scratch') &&
                !row.status.toLowerCase().includes('dns') &&
                !row.status.toLowerCase().includes('dnf');
              const isFirst = row.place === '1';

              return (
                <div key={i} style={{
                  background: isFirst
                    ? 'linear-gradient(145deg, #1c1600, #0f220f)'
                    : 'linear-gradient(145deg, #0f220f, #0a1a0a)',
                  border: `1px solid ${isFirst ? '#3d2e00' : '#1a3a1a'}`,
                  borderRadius: 10, padding: '14px 18px',
                  display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
                }}>
                  {/* Place badge */}
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

                  {/* Athlete + org */}
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <div style={{
                      color: '#f5f0e0', fontFamily: "'DM Sans', sans-serif",
                      fontSize: 14, fontWeight: 600, marginBottom: 2,
                    }}>
                      {row.athlete || '—'}
                    </div>
                    <div style={{
                      color: '#4a6b4a', fontFamily: "'DM Mono', monospace",
                      fontSize: 11, letterSpacing: '0.04em',
                    }}>
                      {row.org}
                    </div>
                  </div>

                  {/* Time + delta */}
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

                  {/* Lane */}
                  <div style={{
                    color: '#2d5a1b', fontFamily: "'DM Mono', monospace",
                    fontSize: 11, textAlign: 'center', flexShrink: 0,
                  }}>
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

// ─── Hero ──────────────────────────────────────────────────────────────────
function HeroSection({ onBrowse }) {
  return (
    <section style={{
      background: "linear-gradient(160deg, #030a03 0%, #0a1e0a 50%, #061506 100%)",
      minHeight: "100vh", display: "flex", flexDirection: "column",
      justifyContent: "center", alignItems: "center", position: "relative", overflow: "hidden"
    }}>
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{
          position: "absolute", left: 0, right: 0,
          top: `${20 + i * 14}%`, height: 1,
          background: `rgba(212,160,23,${0.04 + i * 0.015})`,
          animation: `wave ${3 + i * 0.4}s ease-in-out infinite alternate`,
          animationDelay: `${i * 0.3}s`,
        }} />
      ))}

      <div style={{
        position: "absolute", width: 500, height: 500,
        borderRadius: "50%", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        background: "radial-gradient(circle, rgba(212,160,23,0.07) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />

      <div style={{ position: "relative", textAlign: "center", padding: "0 24px", maxWidth: 800 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 24 }}>
          <OarIcon />
          <span style={{ color: "#d4a017", fontFamily: "'DM Mono', monospace", fontSize: 13, letterSpacing: "0.25em", textTransform: "uppercase" }}>
            South African Rowing
          </span>
          <OarIcon />
        </div>

        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "clamp(3rem, 8vw, 6.5rem)",
          fontWeight: 900, lineHeight: 1.0,
          color: "#f5f0e0", margin: "0 0 8px",
          textShadow: "0 0 80px rgba(212,160,23,0.3)"
        }}>Regatta</h1>
        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "clamp(3rem, 8vw, 6.5rem)",
          fontWeight: 900, lineHeight: 1.0,
          background: "linear-gradient(90deg, #d4a017, #f0c040, #fde68a)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          margin: "0 0 32px"
        }}>Results</h1>

        <p style={{
          color: "#94a3b8", fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
          lineHeight: 1.7, maxWidth: 560, margin: "0 auto 48px",
          fontFamily: "'DM Sans', sans-serif"
        }}>
          The homes of South African competitive rowing results — from school regattas to national championships, all in one place.
        </p>

        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={onBrowse} style={{
            background: "#d4a017", color: "#030a03", border: "none",
            borderRadius: 8, padding: "14px 36px", fontSize: 16,
            fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            letterSpacing: "0.02em", transition: "all 0.2s",
            boxShadow: "0 0 40px rgba(212,160,23,0.3)"
          }}
            onMouseEnter={e => { e.target.style.background = "#f0c040"; e.target.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.target.style.background = "#d4a017"; e.target.style.transform = "translateY(0)"; }}
          >
            Browse Results
          </button>
          <a href="#donate" onClick={e => { e.preventDefault(); document.getElementById("donate")?.scrollIntoView({ behavior: "smooth" }); }} style={{
            background: "transparent", color: "#d4a017",
            border: "1px solid rgba(212,160,23,0.4)",
            borderRadius: 8, padding: "14px 36px", fontSize: 16,
            fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            textDecoration: "none", display: "inline-block", transition: "all 0.2s"
          }}
            onMouseEnter={e => { e.target.style.borderColor = "#d4a017"; e.target.style.background = "rgba(212,160,23,0.08)"; }}
            onMouseLeave={e => { e.target.style.borderColor = "rgba(212,160,23,0.4)"; e.target.style.background = "transparent"; }}
          >
            Support Us
          </a>
        </div>

        <div style={{ display: "flex", gap: 48, justifyContent: "center", marginTop: 72, flexWrap: "wrap" }}>
          {[["13+", "Years of Results"], ["500+", "Regattas Archived"]].map(([num, label]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.2rem", fontWeight: 700, color: "#d4a017" }}>{num}</div>
              <div style={{ color: "#4a6b4a", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
        <Wave />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;600;700&family=DM+Mono:wght@400;500&display=swap');
        @keyframes wave { from { transform: scaleX(1) translateY(0); } to { transform: scaleX(1.02) translateY(3px); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a1a0a; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #0a1a0a; } ::-webkit-scrollbar-thumb { background: #1a3a1a; border-radius: 3px; }
      `}</style>
    </section>
  );
}

// ─── Results Browser ────────────────────────────────────────────────────────
function ResultsBrowser({ onRaceSelect }) {
  const [year, setYear] = useState(2026);
  const [province, setProvince] = useState("All");
  const [search, setSearch] = useState("");
  const [fetched, setFetched] = useState(null); // null=loading, []+=loaded
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setFetched(null);
    setFetchError(null);
    fetch(`/rr-proxy/home/${year}-2/`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text(); })
      .then(html => {
        if (cancelled) return;
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const links = [...doc.querySelectorAll('a[href*="results.htm"]')];
        const hardcoded = REGATTAS[year] || [];
        const norm = u => u.replace(/^https?:\/\/(www\.)?/, '');
        const hardcodedNorms = new Set(hardcoded.map(r => norm(r.url)));
        // Only pick up races from the live page that aren't already hardcoded
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

      {/* Year tabs */}
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

      {/* Loading */}
      {fetched === null && !fetchError && (
        <div style={{ padding: "80px 0", textAlign: "center", color: "#4a6b4a", fontFamily: "'DM Sans', sans-serif" }}>
          Loading {year} regattas…
        </div>
      )}

      {/* Error fallback */}
      {fetchError && (
        <div style={{ background: "#0f220f", border: "1px solid #1a3a1a", borderRadius: 20, padding: "64px 48px", textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 20 }}>🚣</div>
          <h3 style={{ color: "#f5f0e0", fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", marginBottom: 12 }}>{year} Results</h3>
          <p style={{ color: "#6b7c6b", fontFamily: "'DM Sans', sans-serif", marginBottom: 32, maxWidth: 400, margin: "0 auto 32px" }}>
            View the full archive for {year} directly on regattaresults.co.za.
          </p>
          <a href={`https://regattaresults.co.za/home/${year}-2/`} target="_blank" rel="noopener noreferrer" style={{
            background: "#d4a017", color: "#030a03", borderRadius: 8, padding: "14px 32px",
            fontSize: 15, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
            textDecoration: "none", display: "inline-block",
          }}>
            View {year} on regattaresults.co.za →
          </a>
        </div>
      )}

      {/* Loaded */}
      {fetched !== null && (
        <>
          {/* Filters */}
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

          {/* Regatta cards */}
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
                  style={{ textDecoration: "none", cursor: r.status !== "Upcoming" ? "pointer" : "default" }}
                >
                  <div style={{
                    background: "linear-gradient(145deg, #0f220f, #0a1a0a)",
                    border: "1px solid #1a3a1a", borderRadius: 16,
                    padding: "24px", cursor: "pointer",
                    transition: "all 0.2s", position: "relative", overflow: "hidden",
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
                    <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 6 }}>
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

// ─── Donate ────────────────────────────────────────────────────────────────
function DonateSection() {
  const [amount, setAmount] = useState("50");
  const [custom, setCustom] = useState("");
  const [donated, setDonated] = useState(false);

  const presets = ["20", "50", "100", "200"];
  const final = amount === "custom" ? custom : amount;

  return (
    <section id="donate" style={{
      background: "#030a03", borderTop: "1px solid #1a3a1a",
      padding: "80px 24px", textAlign: "center"
    }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <span style={{ color: "#d4a017", fontFamily: "'DM Mono', monospace", fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase" }}>Keep the oars moving</span>
        <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#f5f0e0", fontSize: "clamp(2rem,5vw,3rem)", margin: "16px 0 16px" }}>Support Regatta Results</h2>
        <p style={{ color: "#6b7c6b", lineHeight: 1.8, marginBottom: 40, fontFamily: "'DM Sans', sans-serif" }}>
          This platform is maintained by volunteers passionate about South African rowing. Your donation helps keep it free, fast, and up to date for clubs, parents, coaches, and athletes across the country.
        </p>

        {donated ? (
          <div style={{ background: "#0d2e0d", border: "1px solid #166534", borderRadius: 16, padding: "32px", color: "#4ade80" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🚣</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", marginBottom: 8 }}>Thank you!</div>
            <div style={{ color: "#86efac", fontFamily: "'DM Sans', sans-serif" }}>Your support means the world to the SA rowing community.</div>
          </div>
        ) : (
          <div style={{ background: "#0f220f", border: "1px solid #1a3a1a", borderRadius: 20, padding: "36px" }}>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 20 }}>
              {presets.map(p => (
                <button key={p} onClick={() => setAmount(p)} style={{
                  background: amount === p ? "#d4a017" : "#0a1a0a",
                  color: amount === p ? "#030a03" : "#8a9e8a",
                  border: `1px solid ${amount === p ? "#d4a017" : "#1a3a1a"}`,
                  borderRadius: 10, padding: "10px 22px", fontSize: 15,
                  fontWeight: 700, cursor: "pointer", fontFamily: "'DM Mono', monospace", transition: "all 0.15s"
                }}>R{p}</button>
              ))}
              <button onClick={() => setAmount("custom")} style={{
                background: amount === "custom" ? "#d4a017" : "#0a1a0a",
                color: amount === "custom" ? "#030a03" : "#8a9e8a",
                border: `1px solid ${amount === "custom" ? "#d4a017" : "#1a3a1a"}`,
                borderRadius: 10, padding: "10px 22px", fontSize: 15,
                fontWeight: 700, cursor: "pointer", fontFamily: "'DM Mono', monospace", transition: "all 0.15s"
              }}>Custom</button>
            </div>
            {amount === "custom" && (
              <input value={custom} onChange={e => setCustom(e.target.value)}
                placeholder="Enter amount (ZAR)"
                style={{
                  background: "#0a1a0a", border: "1px solid #1a3a1a", borderRadius: 10,
                  padding: "10px 16px", color: "#e8e0c8", fontSize: 15,
                  fontFamily: "'DM Mono', monospace", width: "100%", marginBottom: 20, outline: "none"
                }} />
            )}
            <button onClick={() => setDonated(true)} style={{
              background: "linear-gradient(135deg, #92400e, #d4a017)",
              color: "#fff", border: "none", borderRadius: 12,
              padding: "16px 40px", fontSize: 16, fontWeight: 700,
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              width: "100%", marginTop: 8,
              boxShadow: "0 8px 32px rgba(212,160,23,0.2)", transition: "all 0.2s"
            }}
              onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 12px 40px rgba(212,160,23,0.3)"; }}
              onMouseLeave={e => { e.target.style.transform = ""; e.target.style.boxShadow = "0 8px 32px rgba(212,160,23,0.2)"; }}
            >
              Donate {final ? `R${final}` : ""} via PayFast
            </button>
            <p style={{ color: "#2d5a1b", fontSize: 12, marginTop: 12, fontFamily: "'DM Sans', sans-serif" }}>Secure payment · No account needed</p>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: "#020702", borderTop: "1px solid #1a3a1a", padding: "40px 24px", textAlign: "center" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16 }}>
        <OarIcon />
        <span style={{ color: "#f5f0e0", fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", fontWeight: 700 }}>Regatta Results SA</span>
      </div>
      <p style={{ color: "#2d5a1b", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
        © {new Date().getFullYear()} Regatta Results South Africa · Built with love for the SA rowing community
      </p>
      <p style={{ color: "#1a3a1a", fontSize: 12, marginTop: 8, fontFamily: "'DM Mono', monospace" }}>
        Data sourced from{" "}
        <a href="https://regattaresults.co.za" target="_blank" rel="noopener noreferrer"
          style={{ color: "#2d5a1b", textDecoration: "underline" }}>regattaresults.co.za</a>
        {" "}· Not affiliated with Rowing South Africa
      </p>
    </footer>
  );
}

// ─── App ───────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [selectedRace, setSelectedRace] = useState(null);

  function goHome() { setPage("home"); setSelectedRace(null); }
  function goResults() { setPage("results"); setSelectedRace(null); }
  function openRace(race) { setSelectedRace(race); window.scrollTo(0, 0); }

  const isResults = page === "results" || selectedRace;

  return (
    <div style={{ background: "#0a1a0a", minHeight: "100vh" }}>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(3,10,3,0.88)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(26,58,26,0.6)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px", height: 60
      }}>
        <button onClick={goHome} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
          <OarIcon />
          <span style={{ color: "#f5f0e0", fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1rem" }}>Regatta Results SA</span>
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={goResults} style={{
            background: isResults ? "rgba(212,160,23,0.12)" : "none",
            border: "none", color: isResults ? "#d4a017" : "#6b7c6b",
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            padding: "6px 16px", borderRadius: 8, fontSize: 14, fontWeight: 500
          }}>Results</button>
          <a href="#donate" onClick={e => { e.preventDefault(); document.getElementById("donate")?.scrollIntoView({ behavior: "smooth" }); }} style={{
            background: "rgba(212,160,23,0.12)", border: "1px solid rgba(212,160,23,0.3)",
            color: "#d4a017", borderRadius: 8, padding: "6px 16px",
            fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
            textDecoration: "none", cursor: "pointer"
          }}>Donate</a>
        </div>
      </nav>

      <div style={{ paddingTop: page === "home" && !selectedRace ? 0 : 60 }}>
        {page === "home" && !selectedRace && <HeroSection onBrowse={goResults} />}
        {page === "results" && !selectedRace && <ResultsBrowser onRaceSelect={openRace} />}
        {selectedRace && <RaceResultsPage race={selectedRace} onBack={() => { setSelectedRace(null); setPage("results"); }} />}
      </div>

      <DonateSection />
      <Footer />
    </div>
  );
}
