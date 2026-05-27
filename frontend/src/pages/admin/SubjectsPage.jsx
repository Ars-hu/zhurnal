import { useState, useEffect } from 'react';
import api from '../../api/axios';

const PAGE_SIZE = 10;

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div style={pg.wrap}>
      <button style={{ ...pg.btn, ...(page === 1 ? pg.disabled : {}) }}
        onClick={() => onChange(page - 1)} disabled={page === 1}>‹</button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
        <button key={n} style={{ ...pg.num, ...(n === page ? pg.active : {}) }} onClick={() => onChange(n)}>{n}</button>
      ))}
      <button style={{ ...pg.btn, ...(page === totalPages ? pg.disabled : {}) }}
        onClick={() => onChange(page + 1)} disabled={page === totalPages}>›</button>
    </div>
  );
}

const pg = {
  wrap:     { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '16px' },
  btn:      { width: '32px', height: '32px', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', background: '#fff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  num:      { width: '32px', height: '32px', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', background: '#fff', color: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  active:   { background: '#854d0e', color: '#fff', border: '1px solid #854d0e', fontWeight: '600' },
  disabled: { opacity: 0.35, cursor: 'not-allowed' },
};

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [modal,    setModal]    = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState({ name: '', description: '', hours: '' });
  const [error,    setError]    = useState('');
  const [search,   setSearch]   = useState('');
  const [page,     setPage]     = useState(1);

  useEffect(() => { fetchSubjects(); }, []);

  const fetchSubjects = async () => { const res = await api.get('?route=subjects'); setSubjects(res.data); };

  const openAdd  = () => { setEditing(null); setForm({ name: '', description: '', hours: '' }); setError(''); setModal(true); };
  const openEdit = (sub) => { setEditing(sub); setForm({ name: sub.name, description: sub.description || '', hours: sub.hours }); setError(''); setModal(true); };

  const handleSave = async () => {
    if (!form.name) { setError('Введите название'); return; }
    try {
      if (editing) { await api.put(`?route=subjects/${editing.id}`, form); }
      else         { await api.post('?route=subjects', form); }
      setModal(false); fetchSubjects();
    } catch { setError('Ошибка при сохранении'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить предмет?')) return;
    await api.delete(`?route=subjects/${id}`); fetchSubjects();
  };

  const filtered    = subjects.filter(sub =>
    sub.name.toLowerCase().includes(search.toLowerCase()) ||
    (sub.description || '').toLowerCase().includes(search.toLowerCase())
  );
  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated   = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div>
      <div style={s.header}>
        <h2 style={s.title}>📚 Предметы</h2>
        <button style={s.btnAdd} onClick={openAdd}>+ Добавить</button>
      </div>

      <input style={s.search} placeholder="🔍 Поиск по названию или описанию..." value={search}
        onChange={e => { setSearch(e.target.value); setPage(1); }} />

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead><tr style={s.thead}>
            <th style={s.th}>#</th><th style={s.th}>Название</th>
            <th style={s.th}>Описание</th><th style={s.th}>Часов</th><th style={s.th}>Действия</th>
          </tr></thead>
          <tbody>
            {paginated.map((sub, i) => (
              <tr key={sub.id} style={s.tr}>
                <td style={s.td}>{(currentPage-1)*PAGE_SIZE + i + 1}</td>
                <td style={s.td}><span style={s.badge}>{sub.name}</span></td>
                <td style={s.td}>{sub.description || '—'}</td>
                <td style={s.td}>{sub.hours}</td>
                <td style={s.td}>
                  <button style={s.btnEdit}   onClick={() => openEdit(sub)}>✏️ Изменить</button>
                  <button style={s.btnDelete} onClick={() => handleDelete(sub.id)}>🗑 Удалить</button>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && <tr><td colSpan={5} style={s.empty}>Предметы не найдены</td></tr>}
          </tbody>
        </table>
      </div>

      <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
      {totalPages > 1 && (
        <div style={s.pageInfo}>{(currentPage-1)*PAGE_SIZE+1}–{(currentPage-1)*PAGE_SIZE+paginated.length} из {filtered.length}</div>
      )}

      {modal && (
        <div style={s.overlay}><div style={s.modal}>
          <h3 style={s.modalTitle}>{editing ? 'Редактировать предмет' : 'Добавить предмет'}</h3>
          {error && <p style={s.error}>{error}</p>}
          <label style={s.label}>Название *</label>
          <input style={s.input} value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Математика" />
          <label style={s.label}>Описание</label>
          <input style={s.input} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Высшая математика" />
          <label style={s.label}>Количество часов</label>
          <input style={s.input} type="number" value={form.hours} onChange={e => setForm({...form, hours: e.target.value})} placeholder="72" />
          <div style={s.modalBtns}>
            <button style={s.btnCancel} onClick={() => setModal(false)}>Отмена</button>
            <button style={s.btnSave}   onClick={handleSave}>Сохранить</button>
          </div>
        </div></div>
      )}
    </div>
  );
}

const s = {
  header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title:      { fontSize: '22px', fontWeight: 'bold', margin: 0 },
  btnAdd:     { padding: '10px 20px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  search:     { width: '100%', padding: '10px 14px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
  tableWrap:  { background: '#fff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' },
  table:      { width: '100%', borderCollapse: 'collapse' },
  thead:      { background: '#f8f9fa' },
  th:         { padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#555', borderBottom: '1px solid #eee' },
  tr:         { borderBottom: '1px solid #f0f0f0' },
  td:         { padding: '12px 16px', fontSize: '14px', color: '#333' },
  empty:      { padding: '32px', textAlign: 'center', color: '#aaa' },
  badge:      { background: '#fef9c3', color: '#854d0e', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  btnEdit:    { marginRight: '8px', padding: '6px 12px', background: '#f0f4ff', color: '#4f46e5', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  btnDelete:  { padding: '6px 12px', background: '#fff0f0', color: '#e53e3e', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  pageInfo:   { textAlign: 'center', fontSize: '12px', color: '#aaa', marginTop: '6px' },
  overlay:    { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal:      { background: '#fff', borderRadius: '12px', padding: '32px', width: '420px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' },
  modalTitle: { fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', marginTop: 0 },
  label:      { display: 'block', fontSize: '13px', color: '#555', marginBottom: '6px', fontWeight: '500' },
  input:      { width: '100%', padding: '10px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
  modalBtns:  { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' },
  btnCancel:  { padding: '10px 20px', background: '#f0f0f0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  btnSave:    { padding: '10px 20px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  error:      { color: '#e53e3e', fontSize: '13px', marginBottom: '12px' },
};
