import { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [teachers,    setTeachers]    = useState([]);
  const [subjects,    setSubjects]    = useState([]);
  const [groups,      setGroups]      = useState([]);
  const [modal,       setModal]       = useState(false);
  const [form,        setForm]        = useState({ teacher_id: '', subject_id: '', group_id: '' });
  const [error,       setError]       = useState('');

  useEffect(() => {
    fetchAll();
    api.get('?route=teachers').then(r => setTeachers(r.data));
    api.get('?route=subjects').then(r => setSubjects(r.data));
    api.get('?route=groups').then(r => setGroups(r.data));
  }, []);

  const fetchAll = async () => {
    const r = await api.get('?route=assignments');
    setAssignments(r.data);
  };

  const handleSave = async () => {
    if (!form.teacher_id || !form.subject_id || !form.group_id) {
      setError('Заполните все поля'); return;
    }
    try {
      await api.post('?route=assignments', form);
      setModal(false);
      setForm({ teacher_id: '', subject_id: '', group_id: '' });
      fetchAll();
    } catch (e) {
      setError(e.response?.data?.error || 'Ошибка при сохранении');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить назначение?')) return;
    await api.delete(`?route=assignments/${id}`);
    fetchAll();
  };

  // Группировка по преподавателю
  const grouped = assignments.reduce((acc, a) => {
    if (!acc[a.teacher_name]) acc[a.teacher_name] = [];
    acc[a.teacher_name].push(a);
    return acc;
  }, {});

  return (
    <div>
      <div style={s.header}>
        <h2 style={s.title}>🔗 Назначения преподавателей</h2>
        <button style={s.btnAdd} onClick={() => { setForm({ teacher_id: '', subject_id: '', group_id: '' }); setError(''); setModal(true); }}>
          + Назначить
        </button>
      </div>

      {Object.entries(grouped).map(([teacherName, items]) => (
        <div key={teacherName} style={s.group}>
          <div style={s.groupHeader}>👨‍🏫 {teacherName}</div>
          <table style={s.table}>
            <thead>
              <tr style={s.thead}>
                <th style={s.th}>Предмет</th>
                <th style={s.th}>Группа</th>
                <th style={s.th}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {items.map(a => (
                <tr key={a.id} style={s.tr}>
                  <td style={s.td}><span style={s.badgeSubj}>{a.subject_name}</span></td>
                  <td style={s.td}><span style={s.badgeGroup}>{a.group_name}</span></td>
                  <td style={s.td}>
                    <button style={s.btnDelete} onClick={() => handleDelete(a.id)}>🗑 Удалить</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {assignments.length === 0 && (
        <div style={s.empty}>Назначений нет. Нажмите «+ Назначить» чтобы добавить.</div>
      )}

      {modal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <h3 style={s.modalTitle}>Новое назначение</h3>
            {error && <p style={s.error}>{error}</p>}

            <label style={s.label}>Преподаватель *</label>
            <select style={s.input} value={form.teacher_id} onChange={e => setForm({ ...form, teacher_id: e.target.value })}>
              <option value="">— Выберите преподавателя —</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>

            <label style={s.label}>Предмет *</label>
            <select style={s.input} value={form.subject_id} onChange={e => setForm({ ...form, subject_id: e.target.value })}>
              <option value="">— Выберите предмет —</option>
              {subjects.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
            </select>

            <label style={s.label}>Группа *</label>
            <select style={s.input} value={form.group_id} onChange={e => setForm({ ...form, group_id: e.target.value })}>
              <option value="">— Выберите группу —</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>

            <div style={s.modalBtns}>
              <button style={s.btnCancel} onClick={() => setModal(false)}>Отмена</button>
              <button style={s.btnSave}   onClick={handleSave}>Назначить</button>
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
  group:      { background: '#fff', borderRadius: '12px', marginBottom: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' },
  groupHeader:{ padding: '14px 16px', background: '#f8f9fa', fontWeight: '600', fontSize: '15px', borderBottom: '1px solid #eee' },
  table:      { width: '100%', borderCollapse: 'collapse' },
  thead:      { background: '#fafafa' },
  th:         { padding: '10px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#555', borderBottom: '1px solid #eee' },
  tr:         { borderBottom: '1px solid #f0f0f0' },
  td:         { padding: '10px 16px', fontSize: '14px' },
  badgeSubj:  { background: '#fef9c3', color: '#854d0e', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  badgeGroup: { background: '#eef2ff', color: '#4f46e5', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  btnDelete:  { padding: '6px 12px', background: '#fff0f0', color: '#e53e3e', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  empty:      { textAlign: 'center', padding: '60px', color: '#aaa', background: '#fff', borderRadius: '12px' },
  overlay:    { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal:      { background: '#fff', borderRadius: '12px', padding: '32px', width: '420px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' },
  modalTitle: { fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', marginTop: 0 },
  label:      { display: 'block', fontSize: '13px', color: '#555', marginBottom: '6px', fontWeight: '500' },
  input:      { width: '100%', padding: '10px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
  modalBtns:  { display: 'flex', justifyContent: 'flex-end', gap: '12px' },
  btnCancel:  { padding: '10px 20px', background: '#f0f0f0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  btnSave:    { padding: '10px 20px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  error:      { color: '#e53e3e', fontSize: '13px', marginBottom: '12px' },
};
