export default function SearchInput({ value, onChange, placeholder = '🔍 Поиск...' }) {
  return (
    <input
      style={s.input}
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

const s = {
  input: { width: '100%', padding: '10px 14px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'inherit' },
};
