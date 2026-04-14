const COLORS = {
  Official:  { bg: "#0d2e0d", text: "#4ade80", border: "#166534" },
  Upcoming:  { bg: "#2a1f00", text: "#f0c040", border: "#92400e" },
  Scheduled: { bg: "#2d1b1b", text: "#f87171", border: "#7f1d1d" },
};

export default function StatusBadge({ status }) {
  const c = COLORS[status] || COLORS.Scheduled;
  return (
    <span style={{
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700,
      letterSpacing: "0.08em", textTransform: "uppercase",
    }}>
      {status}
    </span>
  );
}
