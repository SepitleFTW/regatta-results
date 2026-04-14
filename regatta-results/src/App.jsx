import { useState } from 'react';
import OarIcon from './components/OarIcon';
import HeroSection from './components/HeroSection';
import ResultsBrowser from './components/ResultsBrowser';
import RaceResultsPage from './components/RaceResultsPage';
import DonateSection from './components/DonateSection';
import Footer from './components/Footer';

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
        padding: "0 32px", height: 60,
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
            padding: "6px 16px", borderRadius: 8, fontSize: 14, fontWeight: 500,
          }}>Results</button>
          <a href="#donate" onClick={e => { e.preventDefault(); document.getElementById("donate")?.scrollIntoView({ behavior: "smooth" }); }} style={{
            background: "rgba(212,160,23,0.12)", border: "1px solid rgba(212,160,23,0.3)",
            color: "#d4a017", borderRadius: 8, padding: "6px 16px",
            fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
            textDecoration: "none", cursor: "pointer",
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
