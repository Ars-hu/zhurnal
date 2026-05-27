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
  btn:      { width: '32px', height: '32px', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', background: '#fff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 },
  num:      { width: '32px', height: '32px', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', background: '#fff', color: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  active:   { background: '#4f46e5', color: '#fff', border: '1px solid #4f46e5', fontWeight: '600' },
  disabled: { opacity: 0.35, cursor: 'not-allowed' },
};

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [groups,   setGroups]   = useState([]);
  const [modal,    setModal]    = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState({ name: '', email: '', password: '', group_id: '' });
  const [search,   setSearch]   = useState('');
  const [error,    setError]    = useState('');
  const [page,     setPage]     = useState(1);

  useEffect(() => { fetchStudents(); fetchGroups(); }, []);

  const fetchStudents = async () => { const res = await api.get('?route=students'); setStudents(res.data); };
  const fetchGroups   = async () => { const res = await api.get('?route=groups');   setGroups(res.data); };

  const openAdd  = () => { setEditing(null); setForm({ name: '', email: '', password: '', group_id: '' }); setError(''); setModal(true); };
  const openEdit = (st) => { setEditing(st); setForm({ name: st.name, email: st.email, password: '', group_id: st.group_id }); setError(''); setModal(true); };

  const handleSave = async () => {
    if (!form.name || !form.email || !form.group_id) { setError('Заполните все поля'); return; }
    try {
      if (editing) { await api.put(`?route=students/${editing.id}`, form); }
      else { if (!form.password) { setError('Введите пароль'); return; } await api.post('?route=students', form); }
      setModal(false); fetchStudents();
    } catch { setError('Ошибка при сохранении'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить студента?')) return;
    await api.delete(`?route=students/${id}`); fetchStudents();
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated   = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div>
      <div style={s.header}>
        <h2 style={s.title}>👨‍🎓 Студенты</h2>
        <button style={s.btnAdd} onClick={openAdd}>+ Добавить</button>
      </div>

      <input style={s.search} placeholder="🔍 Поиск..." value={search}
        onChange={e => { setSearch(e.target.value); setPage(1); }} />

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead><tr style={s.thead}>
            <th style={s.th}>#</th><th style={s.th}>ФИО</th><th style={s.th}>Email</th>
            <th style={s.th}>Группа</th><th style={s.th}>Действия</th>
          </tr></thead>
          <tbody>
            {paginated.map((st, i) => (
              <tr key={st.id} style={s.tr}>
                <td style={s.td}>{(currentPage - 1) * PAGE_SIZE + i + 1}</td>
                <td style={s.td}>{st.name}</td>
                <td style={s.td}>{st.email}</td>
                <td style={s.td}><span style={s.badge}>{st.group_name}</span></td>
                <td style={s.td}>
                  <button style={s.btnEdit}   onClick={() => openEdit(st)}>✏️ Изменить</button>
                  <button style={s.btnDelete} onClick={() => handleDelete(st.id)}>🗑 Удалить</button>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && <tr><td colSpan={5} style={s.empty}>Студенты не найдены</td></tr>}
          </tbody>
        </table>
      </div>

      <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
      {totalPages > 1 && (
        <div style={s.pageInfo}>
          {(currentPage-1)*PAGE_SIZE+1}–{(currentPage-1)*PAGE_SIZE+paginated.length} из {filtered.length}
        </div>
      )}

      {modal && (
        <div style={s.overlay}><div style={s.modal}>
          <h3 style={s.modalTitle}>{editing ? 'Редактировать студента' : 'Добавить студента'}</h3>
          {error && <p style={s.error}>{error}</p>}
          <label style={s.label}>ФИО *</label>
          <input style={s.input} value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Иванов Иван Иванович" />
          <label style={s.label}>Email *</label>
          <input style={s.input} type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="student@college.ru" />
          <label style={s.label}>{editing ? 'Новый пароль (оставьте пустым, чтобы не менять)' : 'Пароль *'}</label>
          <input style={s.input} type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder={editing ? 'Введите новый пароль' : 'Минимум 6 символов'} />
          <label style={s.label}>Группа *</label>
          <select style={s.input} value={form.group_id} onChange={e => setForm({...form, group_id: e.target.value})}>
            <option value="">— Выберите группу —</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
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
  badge:      { background: '#eef2ff', color: '#4f46e5', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
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
