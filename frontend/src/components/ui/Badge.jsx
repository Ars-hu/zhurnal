const colors = {
  indigo: { background: '#eef2ff', color: '#4f46e5' },
  green:  { background: '#f0fdf4', color: '#16a34a' },
  yellow: { background: '#fef9c3', color: '#854d0e' },
  red:    { background: '#fef2f2', color: '#dc2626' },
  purple: { background: '#faf5ff', color: '#9333ea' },
  gray:   { background: '#f1f5f9', color: '#64748b' },
};

export default function Badge({ children, color = 'indigo' }) {
  return (
    <span style={{ ...s.badge, ...colors[color] }}>
      {children}
    </span>
  );
}

const s = {
  badge: { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', display: 'inline-block' },
};
