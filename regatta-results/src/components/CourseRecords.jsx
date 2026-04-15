import { useState } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import { ROODEPLAAT_RECORDS } from '../data/courseRecords';

const THIS_YEAR = new Date().getFullYear();

function ageBadge(year) {
  const age = THIS_YEAR - year;
  if (age <= 3)  return { label: `${year}`, color: '#4ade80' };   // recent — green
  if (age <= 8)  return { label: `${year}`, color: '#d4a017' };   // medium — gold
  return         { label: `${year}`, color: '#6b7c6b' };           // old — grey
}

function RecordRow({ record, isMobile }) {
  const badge = ageBadge(record.year);
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr 1fr' : '2fr 1.5fr 1.5fr 1fr 1fr',
      gap: isMobile ? '2px 12px' : 0,
      padding: isMobile ? '12px 14px' : '11px 20px',
      borderBottom: '1px solid #0f220f',
      alignItems: 'center',
    }}>
      <div style={{ color: '#f5f0e0', fontFamily: "'DM Sans', sans-serif", fontSize: isMobile ? 13 : 14, fontWeight: 500 }}>
        {record.event}
      </div>
      <div style={{ color: '#6b7c6b', fontFamily: "'DM Sans', sans-serif", fontSize: isMobile ? 12 : 13 }}>
        {record.club}
      </div>
      {!isMobile && (
        <div style={{ color: '#6b7c6b', fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
          {record.athlete}
        </div>
      )}
      <div style={{ color: '#d4a017', fontFamily: "'DM Mono', monospace", fontSize: isMobile ? 13 : 14, fontWeight: 700 }}>
        {record.time}
      </div>
      <div style={{ color: badge.color, fontFamily: "'DM Mono', monospace", fontSize: 12 }}>
        {badge.label}
      </div>
      {isMobile && (
        <div style={{ color: '#4a6b4a', fontFamily: "'DM Sans', sans-serif", fontSize: 11, gridColumn: '1 / -1', marginTop: 2 }}>
          {record.athlete}
        </div>
      )}
    </div>
  );
}

function DistanceGroup({ distance, records, isMobile }) {
  return (
    <div style={{ marginBottom: 24 }}>
      {/* Distance header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8,
      }}>
        <div style={{
          background: '#0f220f', border: '1px solid #1a3a1a', borderRadius: 8,
          padding: '5px 14px', flexShrink: 0,
        }}>
          <span style={{ color: '#d4a017', fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 700 }}>
            {distance}m
          </span>
        </div>
        <div style={{ flex: 1, height: 1, background: '#1a3a1a' }} />
        <span style={{ color: '#2d5a1b', fontFamily: "'DM Mono', monospace", fontSize: 11 }}>
          {records.length} events
        </span>
      </div>

      {/* Table */}
      <div style={{ background: 'linear-gradient(145deg, #0f220f, #0a1a0a)', border: '1px solid #1a3a1a', borderRadius: 12, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : '2fr 1.5fr 1.5fr 1fr 1fr',
          padding: isMobile ? '8px 14px' : '8px 20px',
          background: '#0a1a0a',
          borderBottom: '1px solid #1a3a1a',
        }}>
          {['Event', 'Club', ...(isMobile ? [] : ['Athlete']), 'Time', 'Year'].map(h => (
            <span key={h} style={{ color: '#2d5a1b', fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              {h}
            </span>
          ))}
        </div>
        {records.map((r, i) => (
          <RecordRow key={i} record={r} isMobile={isMobile} />
        ))}
      </div>
    </div>
  );
}

export default function CourseRecords() {
  const isMobile = useIsMobile();
  const [gender, setGender] = useState('boys');

  const records = ROODEPLAAT_RECORDS[gender];

  // Group by distance, preserving order
  const groups = {};
  for (const r of records) {
    if (!groups[r.distance]) groups[r.distance] = [];
    groups[r.distance].push(r);
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? '24px 16px' : '32px 24px' }}>
      <div style={{ marginBottom: 24 }}>
        <span style={{ color: '#d4a017', fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          Roodeplaat Dam
        </span>
        <h2 style={{ fontFamily: "'Playfair Display', serif", color: '#f5f0e0', fontSize: isMobile ? '1.8rem' : '2.2rem', margin: '8px 0 4px' }}>
          Course Records
        </h2>
        <p style={{ color: '#6b7c6b', fontFamily: "'DM Sans', sans-serif", fontSize: 14, marginBottom: 0 }}>
          All-time records set at Roodeplaat Dam.{' '}
          <span style={{ color: '#4ade80' }}>●</span> recent{' '}
          <span style={{ color: '#d4a017' }}>●</span> classic{' '}
          <span style={{ color: '#6b7c6b' }}>●</span> historic
        </p>
      </div>

      {/* Gender tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        {[['boys', 'Boys'], ['girls', 'Girls']].map(([val, label]) => (
          <button key={val} onClick={() => setGender(val)} style={{
            background: gender === val ? '#d4a017' : '#0f220f',
            color: gender === val ? '#030a03' : '#6b7c6b',
            border: gender === val ? 'none' : '1px solid #1a3a1a',
            borderRadius: 8, padding: '8px 24px', fontSize: 14, fontWeight: 700,
            cursor: 'pointer', fontFamily: "'DM Mono', monospace", transition: 'all 0.15s',
          }}>{label}</button>
        ))}
      </div>

      {/* Groups */}
      {Object.entries(groups).map(([dist, recs]) => (
        <DistanceGroup key={dist} distance={+dist} records={recs} isMobile={isMobile} />
      ))}

      <p style={{ color: '#1a3a1a', fontFamily: "'DM Mono', monospace", fontSize: 11, marginTop: 32, textAlign: 'center' }}>
        Records sourced from Rowing SA / Roodeplaat Course Records document
      </p>
    </div>
  );
}
