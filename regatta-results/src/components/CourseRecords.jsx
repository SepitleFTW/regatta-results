import { useState } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import { ROODEPLAAT_RECORDS } from '../data/courseRecords';

const THIS_YEAR = new Date().getFullYear();

function ageBadge(year) {
  const age = THIS_YEAR - year;
  if (age <= 3)  return { label: `${year}`, color: 'var(--t-green)' };
  if (age <= 8)  return { label: `${year}`, color: 'var(--t-gold)' };
  return         { label: `${year}`, color: 'var(--t-muted)' };
}

function RecordRow({ record, isMobile }) {
  const badge = ageBadge(record.year);
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr 1fr' : '2fr 1.5fr 1.5fr 1fr 1fr',
      gap: isMobile ? '2px 12px' : 0,
      padding: isMobile ? '12px 14px' : '11px 20px',
      borderBottom: '1px solid var(--t-border)',
      alignItems: 'center',
    }}>
      <div style={{ color: 'var(--t-text)', fontFamily: "'DM Sans', sans-serif", fontSize: isMobile ? 13 : 14, fontWeight: 500 }}>
        {record.event}
      </div>
      <div style={{ color: 'var(--t-muted)', fontFamily: "'DM Sans', sans-serif", fontSize: isMobile ? 12 : 13 }}>
        {record.club}
      </div>
      {!isMobile && (
        <div style={{ color: 'var(--t-muted)', fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
          {record.athlete}
        </div>
      )}
      <div style={{ color: 'var(--t-gold)', fontFamily: "'DM Mono', monospace", fontSize: isMobile ? 13 : 14, fontWeight: 700 }}>
        {record.time}
      </div>
      <div style={{ color: badge.color, fontFamily: "'DM Mono', monospace", fontSize: 12 }}>
        {badge.label}
      </div>
      {isMobile && (
        <div style={{ color: 'var(--t-dim)', fontFamily: "'DM Sans', sans-serif", fontSize: 11, gridColumn: '1 / -1', marginTop: 2 }}>
          {record.athlete}
        </div>
      )}
    </div>
  );
}

function DistanceGroup({ distance, records, isMobile }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <div style={{
          background: 'var(--t-bg-card)', border: '1px solid var(--t-border-s)', borderRadius: 8,
          padding: '5px 14px', flexShrink: 0,
        }}>
          <span style={{ color: 'var(--t-gold)', fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 700 }}>
            {distance}m
          </span>
        </div>
        <div style={{ flex: 1, height: 1, background: 'var(--t-border-s)' }} />
        <span style={{ color: 'var(--t-vdim)', fontFamily: "'DM Mono', monospace", fontSize: 11 }}>
          {records.length} events
        </span>
      </div>

      <div style={{ background: 'linear-gradient(145deg, var(--t-bg-card), var(--t-bg))', border: '1px solid var(--t-border-s)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : '2fr 1.5fr 1.5fr 1fr 1fr',
          padding: isMobile ? '8px 14px' : '8px 20px',
          background: 'var(--t-bg)',
          borderBottom: '1px solid var(--t-border-s)',
        }}>
          {['Event', 'Club', ...(isMobile ? [] : ['Athlete']), 'Time', 'Year'].map(h => (
            <span key={h} style={{ color: 'var(--t-vdim)', fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
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

  const groups = {};
  for (const r of records) {
    if (!groups[r.distance]) groups[r.distance] = [];
    groups[r.distance].push(r);
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? '24px 16px' : '32px 24px' }}>
      <div style={{ marginBottom: 24 }}>
        <span style={{ color: 'var(--t-gold)', fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          Roodeplaat Dam
        </span>
        <h2 style={{ fontFamily: "'Playfair Display', serif", color: 'var(--t-text)', fontSize: isMobile ? '1.8rem' : '2.2rem', margin: '8px 0 4px' }}>
          Course Records
        </h2>
        <p style={{ color: 'var(--t-muted)', fontFamily: "'DM Sans', sans-serif", fontSize: 14, marginBottom: 0 }}>
          All-time records set at Roodeplaat Dam.{' '}
          <span style={{ color: 'var(--t-green)' }}>●</span> recent{' '}
          <span style={{ color: 'var(--t-gold)' }}>●</span> classic{' '}
          <span style={{ color: 'var(--t-muted)' }}>●</span> historic
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        {[['boys', 'Boys'], ['girls', 'Girls']].map(([val, label]) => (
          <button key={val} onClick={() => setGender(val)} style={{
            background: gender === val ? 'var(--t-gold)' : 'var(--t-bg-card)',
            color: gender === val ? 'var(--t-bg-deep)' : 'var(--t-muted)',
            border: gender === val ? 'none' : '1px solid var(--t-border-s)',
            borderRadius: 8, padding: '8px 24px', fontSize: 14, fontWeight: 700,
            cursor: 'pointer', fontFamily: "'DM Mono', monospace", transition: 'all 0.15s',
          }}>{label}</button>
        ))}
      </div>

      {Object.entries(groups).map(([dist, recs]) => (
        <DistanceGroup key={dist} distance={+dist} records={recs} isMobile={isMobile} />
      ))}

      <p style={{ color: 'var(--t-vdim)', fontFamily: "'DM Mono', monospace", fontSize: 11, marginTop: 32, textAlign: 'center' }}>
        Records sourced from Rowing SA / Roodeplaat Course Records document
      </p>
    </div>
  );
}
