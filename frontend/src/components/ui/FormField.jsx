export default function FormField({ label, children }) {
  return (
    <div style={s.wrap}>
      <label style={s.label}>{label}</label>
      {children}
    </div>
  );
}

export function Input({ value, onChange, type = 'text', placeholder = '' }) {
  return (
    <input
      style={s.input}
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

export function Select({ value, onChange, children }) {
  return (
    <select style={s.input} value={value} onChange={e => onChange(e.target.value)}>
      {children}
    </select>
  );
}

const s = {
  wrap:  { marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', color: '#555', marginBottom: '6px', fontWeight: '600' },
  input: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'inherit' },
};
