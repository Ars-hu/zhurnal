const variants = {
  primary: { background: '#4f46e5', color: '#fff', border: 'none' },
  edit:    { background: '#f0f4ff', color: '#4f46e5', border: 'none' },
  delete:  { background: '#fff0f0', color: '#e53e3e', border: 'none' },
  cancel:  { background: '#f0f0f0', color: '#333',    border: 'none' },
  success: { background: '#f0fdf4', color: '#16a34a', border: 'none' },
};

export default function Button({ children, onClick, variant = 'primary', size = 'md', style: extra = {} }) {
  const pad = size === 'sm' ? '6px 12px' : '10px 20px';
  const fontSize = size === 'sm' ? '13px' : '14px';

  return (
    <button
      onClick={onClick}
      style={{
        ...s.base,
        ...variants[variant],
        padding: pad,
        fontSize,
        ...extra,
      }}
    >
      {children}
    </button>
  );
}

const s = {
  base: { borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '600', transition: 'opacity 0.15s' },
};
