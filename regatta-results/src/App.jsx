import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import OarIcon from './components/OarIcon';
import HeroSection from './components/HeroSection';
import ResultsBrowser from './components/ResultsBrowser';
import RaceResultsPage from './components/RaceResultsPage';
import AthleteSearch from './components/AthleteSearch';
import RegattaCalendar from './components/RegattaCalendar';
import DonateSection from './components/DonateSection';
import Footer from './components/Footer';

const NAV_LINKS = [
  { label: 'Results', path: '/results' },
  { label: 'Search', path: '/search' },
  { label: 'Calendar', path: '/calendar' },
];

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div style={{ background: "#0a1a0a", minHeight: "100vh" }}>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(3,10,3,0.88)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(26,58,26,0.6)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px", height: 60,
      }}>
        <button onClick={() => navigate('/')} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
          <OarIcon />
          <span style={{ color: "#f5f0e0", fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1rem" }}>Regatta Results SA</span>
        </button>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {NAV_LINKS.map(({ label, path }) => {
            const active = location.pathname.startsWith(path);
            return (
              <button key={path} onClick={() => navigate(path)} style={{
                background: active ? "rgba(212,160,23,0.12)" : "none",
                border: "none", color: active ? "#d4a017" : "#6b7c6b",
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                padding: "6px 14px", borderRadius: 8, fontSize: 14, fontWeight: 500,
              }}>{label}</button>
            );
          })}
          <a href="#donate" onClick={e => {
            e.preventDefault();
            if (!isHome) { navigate('/'); setTimeout(() => document.getElementById("donate")?.scrollIntoView({ behavior: "smooth" }), 100); }
            else document.getElementById("donate")?.scrollIntoView({ behavior: "smooth" });
          }} style={{
            background: "rgba(212,160,23,0.12)", border: "1px solid rgba(212,160,23,0.3)",
            color: "#d4a017", borderRadius: 8, padding: "6px 16px",
            fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
            textDecoration: "none", cursor: "pointer", marginLeft: 4,
          }}>Donate</a>
        </div>
      </nav>

      <div style={{ paddingTop: isHome ? 0 : 60 }}>
        <Routes>
          <Route path="/" element={
            <>
              <HeroSection onBrowse={() => navigate('/results')} />
              <DonateSection />
            </>
          } />
          <Route path="/results" element={<ResultsBrowser />} />
          <Route path="/results/:raceId" element={<RaceResultsPage />} />
          <Route path="/search" element={<AthleteSearch />} />
          <Route path="/calendar" element={<RegattaCalendar />} />
        </Routes>
      </div>

      <Footer />
      <Analytics />
    </div>
  );
}
