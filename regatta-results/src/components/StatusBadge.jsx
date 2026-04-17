const COLORS = {
  Official:  { bg: 'var(--t-green-d)', text: 'var(--t-green)', border: 'var(--t-green-b)' },
  Upcoming:  { bg: 'rgba(212,160,23,0.1)', text: 'var(--t-gold)', border: 'var(--t-gold-b)' },
  Scheduled: { bg: 'var(--t-red-bg)', text: 'var(--t-red)', border: 'var(--t-red-b)' },
};

export default function StatusBadge({ status }) {
  const c = COLORS[status] || COLORS.Scheduled;
  return (
    <span style={{
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700,
      letterSpacing: '0.08em', textTransform: 'uppercase',
    }}>
      {status}
    </span>
  );
}
