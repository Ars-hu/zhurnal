import { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [modal,    setModal]    = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState({ name: '', email: '', password: '', department: '' });
  const [search,   setSearch]   = useState('');
  const [error,    setError]    = useState('');

  useEffect(() => { fetchTeachers(); }, []);

  const fetchTeachers = async () => {
    const res = await api.get('?route=teachers');
    setTeachers(res.data);
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', email: '', password: '', department: '' });
    setError('');
    setModal(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    setForm({ name: t.name, email: t.email, password: '', department: t.department || '' });
    setError('');
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email) { setError('Заполните все поля'); return; }
    try {
      if (editing) {
        await api.put(`?route=teachers/${editing.id}`, form);
      } else {
        if (!form.password) { setError('Введите пароль'); return; }
        await api.post('?route=teachers', form);
      }
      setModal(false);
      fetchTeachers();
    } catch { setError('Ошибка при сохранении'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить преподавателя?')) return;
    await api.delete(`?route=teachers/${id}`);
    fetchTeachers();
  };

  const filtered = teachers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={s.header}>
        <h2 style={s.title}>👨‍🏫 Преподаватели</h2>
        <button style={s.btnAdd} onClick={openAdd}>+ Добавить</button>
      </div>

      <input style={s.search} placeholder="🔍 Поиск..." value={search} onChange={e => setSearch(e.target.value)} />

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr style={s.thead}>
              <th style={s.th}>#</th>
              <th style={s.th}>ФИО</th>
              <th style={s.th}>Email</th>
              <th style={s.th}>Кафедра</th>
              <th style={s.th}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, i) => (
              <tr key={t.id} style={s.tr}>
                <td style={s.td}>{i + 1}</td>
                <td style={s.td}>{t.name}</td>
                <td style={s.td}>{t.email}</td>
                <td style={s.td}><span style={s.badge}>{t.department || '—'}</span></td>
                <td style={s.td}>
                  <button style={s.btnEdit}   onClick={() => openEdit(t)}>✏️ Изменить</button>
                  <button style={s.btnDelete} onClick={() => handleDelete(t.id)}>🗑 Удалить</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={5} style={s.empty}>Преподаватели не найдены</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <h3 style={s.modalTitle}>{editing ? 'Редактировать преподавателя' : 'Добавить преподавателя'}</h3>
            {error && <p style={s.error}>{error}</p>}
            <label style={s.label}>ФИО *</label>
            <input style={s.input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Иванова Мария Петровна" />
            <label style={s.label}>Email *</label>
            <input style={s.input} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="teacher@college.ru" />
            <label style={s.label}>{editing ? 'Новый пароль (оставьте пустым, чтобы не менять)' : 'Пароль *'}</label>
            <input style={s.input} type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder={editing ? 'Введите новый пароль' : ''} />
            <label style={s.label}>Кафедра</label>
            <input style={s.input} value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} placeholder="Кафедра информатики" />
            <div style={s.modalBtns}>
              <button style={s.btnCancel} onClick={() => setModal(false)}>Отмена</button>
              <button style={s.btnSave}   onClick={handleSave}>Сохранить</button>
            </div>
          </div>
        </div>
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
  badge:      { background: '#f0fdf4', color: '#16a34a', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  btnEdit:    { marginRight: '8px', padding: '6px 12px', background: '#f0f4ff', color: '#4f46e5', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  btnDelete:  { padding: '6px 12px', background: '#fff0f0', color: '#e53e3e', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
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
