import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { useIsMobile } from './hooks/useIsMobile';
import { useResultsAlerts } from './hooks/useResultsAlerts';
import OarIcon from './components/OarIcon';
import HeroSection from './components/HeroSection';
import ResultsBrowser from './components/ResultsBrowser';
import RaceResultsPage from './components/RaceResultsPage';
import AthleteSearch from './components/AthleteSearch';
import AthleteProfile from './components/AthleteProfile';
import RegattaCalendar from './components/RegattaCalendar';
import CourseRecords from './components/CourseRecords';
import ChampionshipPoints from './components/ChampionshipPoints';
import HallOfFame from './components/HallOfFame';
import DonateSection from './components/DonateSection';
import Footer from './components/Footer';

const NAV_LINKS = [
  { label: 'Results', path: '/results' },
  { label: 'Search', path: '/search' },
  { label: 'Calendar', path: '/calendar' },
  { label: 'Records', path: '/records' },
  { label: 'Standings', path: '/standings' },
  { label: 'Hall of Fame', path: '/halloffame' },
];

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const { alerts, dismiss } = useResultsAlerts();

  const isHome = location.pathname === '/';

  function handleNavClick(path) {
    navigate(path);
    setMenuOpen(false);
  }

  function handleDonateClick(e) {
    e.preventDefault();
    setMenuOpen(false);
    if (!isHome) {
      navigate('/');
      setTimeout(() => document.getElementById('donate')?.scrollIntoView({ behavior: 'smooth' }), 100);
    } else {
      document.getElementById('donate')?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return (
    <div style={{ background: '#0a1a0a', minHeight: '100vh' }}>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(3,10,3,0.88)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(26,58,26,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', height: 60,
      }}>
        <button onClick={() => { navigate('/'); setMenuOpen(false); }} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <OarIcon />
          <span style={{
            color: '#f5f0e0', fontFamily: "'Playfair Display', serif",
            fontWeight: 700, fontSize: isMobile ? '0.85rem' : '1rem',
          }}>Regatta Results SA</span>
        </button>

        {isMobile ? (
          <button
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            style={{
              background: 'none', border: '1px solid rgba(26,58,26,0.8)',
              borderRadius: 8, cursor: 'pointer', color: '#f5f0e0',
              fontSize: 20, lineHeight: 1, padding: '6px 10px',
              fontFamily: 'monospace',
            }}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {NAV_LINKS.map(({ label, path }) => {
              const active = location.pathname.startsWith(path);
              return (
                <button key={path} onClick={() => navigate(path)} style={{
                  background: active ? 'rgba(212,160,23,0.12)' : 'none',
                  border: 'none', color: active ? '#d4a017' : '#6b7c6b',
                  cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                  padding: '6px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500,
                }}>{label}</button>
              );
            })}
            <a href="#donate" onClick={handleDonateClick} style={{
              background: 'rgba(212,160,23,0.12)', border: '1px solid rgba(212,160,23,0.3)',
              color: '#d4a017', borderRadius: 8, padding: '6px 16px',
              fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
              textDecoration: 'none', cursor: 'pointer', marginLeft: 4,
            }}>Donate</a>
          </div>
        )}
      </nav>

      {/* Mobile dropdown menu */}
      {isMobile && menuOpen && (
        <div style={{
          position: 'fixed', top: 60, left: 0, right: 0, zIndex: 99,
          background: 'rgba(3,10,3,0.97)', backdropFilter: 'blur(16px)',
          borderBottom: '1px solid #1a3a1a',
          padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          {NAV_LINKS.map(({ label, path }) => {
            const active = location.pathname.startsWith(path);
            return (
              <button key={path} onClick={() => handleNavClick(path)} style={{
                background: active ? 'rgba(212,160,23,0.12)' : 'none',
                border: 'none', color: active ? '#d4a017' : '#e8e0c8',
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                padding: '12px 16px', borderRadius: 8, fontSize: 15, fontWeight: 500,
                textAlign: 'left',
              }}>{label}</button>
            );
          })}
          <a href="#donate" onClick={handleDonateClick} style={{
            background: 'rgba(212,160,23,0.1)', border: '1px solid rgba(212,160,23,0.3)',
            color: '#d4a017', borderRadius: 8, padding: '12px 16px',
            fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600,
            textDecoration: 'none', cursor: 'pointer', marginTop: 4, display: 'block',
            textAlign: 'center',
          }}>Donate</a>
        </div>
      )}

      {/* Results-live alerts banner */}
      {alerts.length > 0 && (
        <div style={{
          position: 'fixed', top: 60, left: 0, right: 0, zIndex: 98,
          padding: '6px 16px', display: 'flex', flexDirection: 'column', gap: 4,
          pointerEvents: 'none',
        }}>
          {alerts.map(a => (
            <div key={a.id} style={{
              background: 'linear-gradient(135deg, #0a1a14, #0f220f)',
              border: '1px solid rgba(74,222,128,0.5)',
              borderRadius: 10, padding: '10px 16px',
              display: 'flex', alignItems: 'center', gap: 12,
              pointerEvents: 'all',
              boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
            }}>
              <span style={{ color: '#4ade80', fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', flexShrink: 0 }}>
                Results Live
              </span>
              <span style={{ flex: 1, color: '#e8e0c8', fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>{a.name}</span>
              <button onClick={() => navigate(`/results/${a.raceId || a.id}`)} style={{
                background: '#4ade80', color: '#030a03', border: 'none', borderRadius: 6,
                padding: '4px 14px', cursor: 'pointer',
                fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 700,
              }}>View →</button>
              <button onClick={() => dismiss(a.id)} style={{
                background: 'none', border: 'none', color: '#4a6b4a',
                cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '0 4px',
              }}>✕</button>
            </div>
          ))}
        </div>
      )}

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
          <Route path="/athlete/:name" element={<AthleteProfile />} />
          <Route path="/calendar" element={<RegattaCalendar />} />
          <Route path="/records" element={<CourseRecords />} />
          <Route path="/standings" element={<ChampionshipPoints />} />
          <Route path="/halloffame" element={<HallOfFame />} />
        </Routes>
      </div>

      <Footer />
      <Analytics />
    </div>
  );
}
