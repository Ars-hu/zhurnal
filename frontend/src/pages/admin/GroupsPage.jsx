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
  active:   { background: '#4f46e5', color: '#fff', border: '1px solid #4f46e5', fontWeight: '600' },
  disabled: { opacity: 0.35, cursor: 'not-allowed' },
};

export default function GroupsPage() {
  const [groups,          setGroups]          = useState([]);
  const [modal,           setModal]           = useState(false);
  const [editing,         setEditing]         = useState(null);
  const [form,            setForm]            = useState({ name: '', specialty: '', year: '' });
  const [error,           setError]           = useState('');
  const [search,          setSearch]          = useState('');
  const [page,            setPage]            = useState(1);
  const [selectedGroup,   setSelectedGroup]   = useState(null);
  const [groupStudents,   setGroupStudents]   = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => { fetchGroups(); }, []);

  const fetchGroups = async () => { const res = await api.get('?route=groups'); setGroups(res.data); };

  const openAdd  = () => { setEditing(null); setForm({ name: '', specialty: '', year: '' }); setError(''); setModal(true); };
  const openEdit = (g) => { setEditing(g); setForm({ name: g.name, specialty: g.specialty, year: g.year }); setError(''); setModal(true); };

  const handleSave = async () => {
    if (!form.name || !form.specialty || !form.year) { setError('Заполните все поля'); return; }
    try {
      if (editing) { await api.put(`?route=groups/${editing.id}`, form); }
      else         { await api.post('?route=groups', form); }
      setModal(false); fetchGroups();
    } catch { setError('Ошибка при сохранении'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить группу?')) return;
    await api.delete(`?route=groups/${id}`);
    if (selectedGroup?.id === id) { setSelectedGroup(null); setGroupStudents([]); }
    fetchGroups();
  };

  const handleGroupClick = async (g) => {
    if (selectedGroup?.id === g.id) { setSelectedGroup(null); setGroupStudents([]); return; }
    setSelectedGroup(g);
    setLoadingStudents(true);
    try {
      const res = await api.get('?route=students');
      setGroupStudents(res.data.filter(st => String(st.group_id) === String(g.id)));
    } catch { setGroupStudents([]); }
    setLoadingStudents(false);
  };

  const filtered    = groups.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    (g.specialty || '').toLowerCase().includes(search.toLowerCase())
  );
  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated   = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div>
      <div style={s.header}>
        <h2 style={s.title}>👥 Группы</h2>
        <button style={s.btnAdd} onClick={openAdd}>+ Добавить</button>
      </div>

      <input style={s.search} placeholder="🔍 Поиск по названию или специальности..." value={search}
        onChange={e => { setSearch(e.target.value); setPage(1); }} />

      <div style={s.layout}>
        <div style={s.left}>
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead><tr style={s.thead}>
                <th style={s.th}>#</th><th style={s.th}>Название</th>
                <th style={s.th}>Специальность</th><th style={s.th}>Год</th><th style={s.th}>Действия</th>
              </tr></thead>
              <tbody>
                {paginated.map((g, i) => (
                  <tr key={g.id}
                    style={{ ...s.tr, ...(selectedGroup?.id === g.id ? s.trSelected : {}) }}
                    onClick={() => handleGroupClick(g)}>
                    <td style={s.td}>{(currentPage-1)*PAGE_SIZE + i + 1}</td>
                    <td style={s.td}><span style={{ ...s.badge, ...(selectedGroup?.id === g.id ? s.badgeActive : {}) }}>{g.name}</span></td>
                    <td style={s.td}>{g.specialty}</td>
                    <td style={s.td}>{g.year}</td>
                    <td style={s.td} onClick={e => e.stopPropagation()}>
                      <button style={s.btnEdit}   onClick={() => openEdit(g)}>✏️ Изменить</button>
                      <button style={s.btnDelete} onClick={() => handleDelete(g.id)}>🗑 Удалить</button>
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 && <tr><td colSpan={5} style={s.empty}>Группы не найдены</td></tr>}
              </tbody>
            </table>
            <div style={s.hint}>💡 Нажмите на строку группы, чтобы увидеть её студентов</div>
          </div>
          <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
          {totalPages > 1 && (
            <div style={s.pageInfo}>{(currentPage-1)*PAGE_SIZE+1}–{(currentPage-1)*PAGE_SIZE+paginated.length} из {filtered.length}</div>
          )}
        </div>

        {selectedGroup && (
          <div style={s.studentsPanel}>
            <div style={s.panelHeader}>
              <h3 style={s.panelTitle}>👨‍🎓 <span style={s.groupBadge}>{selectedGroup.name}</span></h3>
              <button style={s.closeBtn} onClick={() => { setSelectedGroup(null); setGroupStudents([]); }}>✕</button>
            </div>
            {loadingStudents ? (
              <div style={s.loading}>Загрузка...</div>
            ) : groupStudents.length === 0 ? (
              <div style={s.noStudents}>В этой группе пока нет студентов</div>
            ) : (
              <div style={s.studentsList}>
                {groupStudents.map((st, i) => (
                  <div key={st.id} style={s.studentItem}>
                    <div style={s.studentNum}>{i + 1}</div>
                    <div>
                      <div style={s.studentName}>{st.name}</div>
                      <div style={s.studentEmail}>{st.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={s.studentCount}>Всего: {groupStudents.length} чел.</div>
          </div>
        )}
      </div>

      {modal && (
        <div style={s.overlay}><div style={s.modal}>
          <h3 style={s.modalTitle}>{editing ? 'Редактировать группу' : 'Добавить группу'}</h3>
          {error && <p style={s.error}>{error}</p>}
          <label style={s.label}>Название *</label>
          <input style={s.input} value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="ИС-21" />
          <label style={s.label}>Специальность *</label>
          <input style={s.input} value={form.specialty} onChange={e => setForm({...form, specialty: e.target.value})} placeholder="Информационные системы" />
          <label style={s.label}>Год поступления *</label>
          <input style={s.input} type="number" value={form.year} onChange={e => setForm({...form, year: e.target.value})} placeholder="2024" />
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
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title:        { fontSize: '22px', fontWeight: 'bold', margin: 0 },
  btnAdd:       { padding: '10px 20px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  search:       { width: '100%', padding: '10px 14px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
  layout:       { display: 'flex', gap: '20px', alignItems: 'flex-start' },
  left:         { flex: 1, minWidth: 0 },
  tableWrap:    { background: '#fff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' },
  table:        { width: '100%', borderCollapse: 'collapse' },
  thead:        { background: '#f8f9fa' },
  th:           { padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#555', borderBottom: '1px solid #eee' },
  tr:           { borderBottom: '1px solid #f0f0f0', cursor: 'pointer' },
  trSelected:   { background: '#eef2ff' },
  td:           { padding: '12px 16px', fontSize: '14px', color: '#333' },
  empty:        { padding: '32px', textAlign: 'center', color: '#aaa' },
  badge:        { background: '#eef2ff', color: '#4f46e5', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  badgeActive:  { background: '#4f46e5', color: '#fff' },
  btnEdit:      { marginRight: '8px', padding: '6px 12px', background: '#f0f4ff', color: '#4f46e5', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  btnDelete:    { padding: '6px 12px', background: '#fff0f0', color: '#e53e3e', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  hint:         { padding: '10px 16px', fontSize: '12px', color: '#aaa', borderTop: '1px solid #f0f0f0' },
  pageInfo:     { textAlign: 'center', fontSize: '12px', color: '#aaa', marginTop: '6px' },

  studentsPanel:{ width: '280px', background: '#fff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden', flexShrink: 0 },
  panelHeader:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #eee', background: '#f8f9fa' },
  panelTitle:   { fontSize: '14px', fontWeight: '600', margin: 0 },
  groupBadge:   { background: '#4f46e5', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' },
  closeBtn:     { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#888', padding: '4px 8px' },
  loading:      { padding: '32px', textAlign: 'center', color: '#888' },
  noStudents:   { padding: '32px', textAlign: 'center', color: '#aaa', fontSize: '13px' },
  studentsList: { maxHeight: '420px', overflowY: 'auto' },
  studentItem:  { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderBottom: '1px solid #f5f5f5' },
  studentNum:   { width: '22px', height: '22px', background: '#eef2ff', color: '#4f46e5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '600', flexShrink: 0 },
  studentName:  { fontSize: '13px', fontWeight: '500', color: '#333' },
  studentEmail: { fontSize: '11px', color: '#888', marginTop: '2px' },
  studentCount: { padding: '10px 16px', fontSize: '12px', color: '#888', borderTop: '1px solid #eee', textAlign: 'right' },

  overlay:      { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal:        { background: '#fff', borderRadius: '12px', padding: '32px', width: '420px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' },
  modalTitle:   { fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', marginTop: 0 },
  label:        { display: 'block', fontSize: '13px', color: '#555', marginBottom: '6px', fontWeight: '500' },
  input:        { width: '100%', padding: '10px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
  modalBtns:    { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' },
  btnCancel:    { padding: '10px 20px', background: '#f0f0f0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  btnSave:      { padding: '10px 20px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  error:        { color: '#e53e3e', fontSize: '13px', marginBottom: '12px' },
};
