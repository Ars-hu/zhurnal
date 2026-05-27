export default function StatCard({ icon, value, label, color = '#4f46e5', onClick }) {
  return (
    <div style={{ ...s.card, cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
      <div style={s.icon}>{icon}</div>
      <div style={{ ...s.value, color }}>{value}</div>
      <div style={s.label}>{label}</div>
    </div>
  );
}

const s = {
  card:  { background: '#fff', borderRadius: '16px', padding: '22px 20px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', textAlign: 'center', transition: 'transform 0.15s' },
  icon:  { fontSize: '28px', marginBottom: '10px' },
  value: { fontSize: '34px', fontWeight: '800', marginBottom: '4px' },
  label: { fontSize: '13px', color: '#94a3b8', fontWeight: '600' },
};
