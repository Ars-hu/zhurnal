export default function Modal({ open, title, onClose, onSave, children, saveLabel = 'Сохранить' }) {
  if (!open) return null;
  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <h3 style={s.title}>{title}</h3>
        {children}
        <div style={s.footer}>
          <button style={s.btnCancel} onClick={onClose}>Отмена</button>
          <button style={s.btnSave}   onClick={onSave}>{saveLabel}</button>
        </div>
      </div>
    </div>
  );
}

const s = {
  overlay:   { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal:     { background: '#fff', borderRadius: '12px', padding: '32px', width: '420px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' },
  title:     { fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', marginTop: 0 },
  footer:    { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' },
  btnCancel: { padding: '10px 20px', background: '#f0f0f0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  btnSave:   { padding: '10px 20px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
};
