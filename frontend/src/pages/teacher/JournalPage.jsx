import { useState, useEffect } from 'react';
import api from '../../api/axios';

const ATTENDANCE_OPTIONS = [
  { value: 'present', label: '✅ Был',              color: '#16a34a', bg: '#dcfce7' },
  { value: 'excused', label: '🟡 Уваж. пропуск',   color: '#854d0e', bg: '#fef9c3' },
  { value: 'absent',  label: '❌ Пропуск',          color: '#dc2626', bg: '#fee2e2' },
];

export default function JournalPage() {
  const [assignments, setAssignments] = useState([]);
  const [students,    setStudents]    = useState([]);
  const [grades,      setGrades]      = useState([]);
  const [selected,    setSelected]    = useState(null);
  const [cell,        setCell]        = useState(null); // { student_id, date, existingId, existingGrade, existingStatus }
  const [newGrade,    setNewGrade]    = useState('');
  const [newStatus,   setNewStatus]   = useState('present');
  const [newDate,     setNewDate]     = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    api.get('?route=assignments').then(r => setAssignments(r.data));
  }, []);

  useEffect(() => {
    if (!selected) return;
    api.get(`?route=students&group_id=${selected.group_id}`).then(r => setStudents(r.data));
    fetchGrades();
  }, [selected]);

  const fetchGrades = async () => {
    if (!selected) return;
    const r = await api.get(`?route=grades&group_id=${selected.group_id}&subject_id=${selected.subject_id}`);
    setGrades(r.data);
  };

  const dates = [...new Set(grades.map(g => g.date))].sort();

  const getRecord = (studentId, date) =>
    grades.find(g => g.student_id === studentId && g.date === date);

  const getAvg = (studentId) => {
    const sg = grades.filter(g => g.student_id === studentId && g.grade !== null);
    return sg.length ? (sg.reduce((a, g) => a + parseInt(g.grade), 0) / sg.length).toFixed(1) : '—';
  };

  const handleCellClick = (student_id, date) => {
    const rec = getRecord(student_id, date);
    setCell({
      student_id,
      date,
      existingId:     rec?.id      ?? null,
      existingGrade:  rec?.grade   ?? null,
      existingStatus: rec?.attendance_status ?? 'present',
    });
    setNewGrade(rec?.grade !== null && rec?.grade !== undefined ? String(rec.grade) : '');
    setNewStatus(rec?.attendance_status ?? 'present');
  };

  const handleAddColumn = () => {
    if (!newDate || dates.includes(newDate)) return;
    setGrades(prev => [...prev, { __placeholder: true, date: newDate }]);
  };

  const handleSave = async () => {
    const gradeVal = newGrade !== '' ? parseInt(newGrade) : null;

    // Нельзя ставить оценку при обычном пропуске
    if (newStatus === 'absent' && gradeVal !== null) {
      alert('При неуважительном пропуске нельзя поставить оценку');
      return;
    }

    const payload = {
      student_id:        cell.student_id,
      subject_id:        selected.subject_id,
      grade:             gradeVal,
      attendance_status: newStatus,
      type:              'current',
      date:              cell.date,
    };

    await api.post('?route=grades', payload);
    setCell(null);
    fetchGrades();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Удалить запись?')) {
      await api.delete(`?route=grades/${id}`);
      fetchGrades();
    }
  };

  const cellDisplay = (rec) => {
    if (!rec || rec.__placeholder) return <span style={s.empty}>—</span>;
    const status = rec.attendance_status;
    if (status === 'absent') {
      return <span style={{ ...s.gradeChip, background: '#fee2e2', color: '#dc2626' }}>Н</span>;
    }
    if (status === 'excused' && (rec.grade === null || rec.grade === undefined)) {
      return <span style={{ ...s.gradeChip, background: '#fef9c3', color: '#854d0e' }}>У</span>;
    }
    if (rec.grade !== null && rec.grade !== undefined) {
      const g = parseInt(rec.grade);
      let style = { background: '#f0f0f0', color: '#333' };
      if (g === 5) style = { background: '#dcfce7', color: '#16a34a' };
      else if (g === 4) style = { background: '#dbeafe', color: '#1d4ed8' };
      else if (g === 3) style = { background: '#fef9c3', color: '#854d0e' };
      else if (g === 2) style = { background: '#fee2e2', color: '#dc2626' };
      // Если уважительный + оценка — показываем "У/4"
      if (status === 'excused') {
        return <span style={{ ...s.gradeChip, ...style, fontSize: '11px' }}>У/{g}</span>;
      }
      return <span style={{ ...s.gradeChip, ...style }}>{g}</span>;
    }
    return <span style={{ ...s.gradeChip, background: '#f0fdf4', color: '#16a34a', fontSize: '12px' }}>✓</span>;
  };

  return (
    <div>
      <h2 style={s.title}>📒 Журнал</h2>

      <div style={s.assignList}>
        {assignments.map(a => (
          <div key={a.id}
            style={{ ...s.assignCard, ...(selected?.subject_id === a.subject_id && selected?.group_id === a.group_id ? s.assignActive : {}) }}
            onClick={() => setSelected(a)}>
            <div style={s.assignSubj}>{a.subject_name}</div>
            <div style={s.assignGroup}>{a.group_name}</div>
          </div>
        ))}
        {assignments.length === 0 && <p style={{ color: '#aaa' }}>У вас нет назначенных предметов</p>}
      </div>

      {selected && (
        <>
          <div style={s.toolbar}>
            <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} style={s.dateInput} />
            <button style={s.btnAddDate} onClick={handleAddColumn}>+ Добавить занятие</button>
          </div>

          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={{ ...s.th, ...s.stickyCol }}>Студент</th>
                  {dates.map(d => (
                    <th key={d} style={s.th}>{d.slice(5)}</th>
                  ))}
                  <th style={s.th}>Ср. балл</th>
                </tr>
              </thead>
              <tbody>
                {students.map(st => (
                  <tr key={st.id} style={s.tr}>
                    <td style={{ ...s.td, ...s.stickyCol, fontWeight: '500' }}>{st.name}</td>
                    {dates.map(d => {
                      const rec = getRecord(st.id, d);
                      return (
                        <td key={d} style={{ ...s.td, ...s.cell }}
                          onClick={() => handleCellClick(st.id, d)}>
                          {cellDisplay(rec)}
                        </td>
                      );
                    })}
                    <td style={{ ...s.td, fontWeight: 'bold', color: '#4f46e5' }}>{getAvg(st.id)}</td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr><td colSpan={dates.length + 2} style={s.emptyRow}>В группе нет студентов</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <p style={{ fontSize: '12px', color: '#aaa', marginTop: '8px' }}>
            💡 Нажмите на ячейку чтобы поставить оценку / отметить посещаемость. Н = пропуск, У = уважительный пропуск.
          </p>
        </>
      )}

      {!selected && assignments.length > 0 && (
        <div style={s.hint}>Выберите предмет и группу выше</div>
      )}

      {/* Попап редактирования ячейки */}
      {cell && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <h3 style={s.modalTitle}>Ячейка журнала</h3>
            <p style={{ color: '#888', fontSize: '14px', marginBottom: '16px' }}>
              {students.find(st => st.id === cell.student_id)?.name} — {cell.date}
            </p>

            {/* Посещаемость */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', color: '#555', fontWeight: '600', marginBottom: '8px' }}>Посещаемость</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {ATTENDANCE_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => {
                    setNewStatus(opt.value);
                    // При обычном пропуске сбрасываем оценку
                    if (opt.value === 'absent') setNewGrade('');
                  }} style={{
                    padding: '8px 14px', borderRadius: '8px', border: '2px solid',
                    borderColor: newStatus === opt.value ? opt.color : 'transparent',
                    background: newStatus === opt.value ? opt.bg : '#f5f5f5',
                    color: newStatus === opt.value ? opt.color : '#555',
                    cursor: 'pointer', fontSize: '13px', fontWeight: '500',
                  }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Оценка — недоступна при обычном пропуске */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', color: '#555', fontWeight: '600', marginBottom: '8px' }}>
                Оценка {newStatus === 'absent' ? <span style={{ color: '#dc2626', fontWeight: '400' }}>(недоступна при пропуске)</span> : ''}
              </div>
              <div style={s.gradeRow}>
                {[5, 4, 3, 2].map(g => (
                  <button key={g} onClick={() => { if (newStatus !== 'absent') setNewGrade(newGrade === String(g) ? '' : String(g)); }}
                    disabled={newStatus === 'absent'}
                    style={{
                      ...s.gradeBtn,
                      opacity: newStatus === 'absent' ? 0.35 : 1,
                      cursor: newStatus === 'absent' ? 'not-allowed' : 'pointer',
                      background: newGrade === String(g) ? (g===5?'#dcfce7':g===4?'#dbeafe':g===3?'#fef9c3':'#fee2e2') : '#f5f5f5',
                      color: newGrade === String(g) ? (g===5?'#16a34a':g===4?'#1d4ed8':g===3?'#854d0e':'#dc2626') : '#333',
                      border: newGrade === String(g) ? '2px solid currentColor' : '2px solid transparent',
                    }}>
                    {g}
                  </button>
                ))}
                <button onClick={() => { if (newStatus !== 'absent') setNewGrade(''); }}
                  disabled={newStatus === 'absent'}
                  style={{
                    ...s.gradeBtn, fontSize: '12px',
                    opacity: newStatus === 'absent' ? 0.35 : 1,
                    cursor: newStatus === 'absent' ? 'not-allowed' : 'pointer',
                    background: newGrade === '' ? '#e0e7ff' : '#f5f5f5',
                    color: newGrade === '' ? '#4f46e5' : '#999',
                    border: newGrade === '' ? '2px solid #4f46e5' : '2px solid transparent',
                  }}>
                  Нет
                </button>
              </div>
            </div>

            <div style={s.modalBtns}>
              {cell.existingId && (
                <button style={{ ...s.btnCancel, color: '#dc2626' }} onClick={() => { handleDelete(cell.existingId); setCell(null); }}>
                  🗑 Удалить
                </button>
              )}
              <button style={s.btnCancel} onClick={() => setCell(null)}>Отмена</button>
              <button style={s.btnSave}   onClick={handleSave}>Сохранить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  title:       { fontSize: '22px', fontWeight: 'bold', marginBottom: '16px' },
  assignList:  { display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' },
  assignCard:  { padding: '12px 20px', background: '#fff', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', cursor: 'pointer', border: '2px solid transparent' },
  assignActive:{ border: '2px solid #4f46e5', background: '#eef2ff' },
  assignSubj:  { fontWeight: '600', fontSize: '14px' },
  assignGroup: { fontSize: '12px', color: '#888', marginTop: '2px' },
  toolbar:     { display: 'flex', gap: '10px', marginBottom: '12px', alignItems: 'center' },
  dateInput:   { padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' },
  btnAddDate:  { padding: '8px 16px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
  tableWrap:   { background: '#fff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'auto', maxWidth: '100%' },
  table:       { borderCollapse: 'collapse', minWidth: '100%' },
  th:          { padding: '12px 14px', background: '#f8f9fa', fontSize: '13px', fontWeight: '600', color: '#555', borderBottom: '1px solid #eee', whiteSpace: 'nowrap', textAlign: 'center' },
  tr:          { borderBottom: '1px solid #f0f0f0' },
  td:          { padding: '10px 14px', fontSize: '14px', textAlign: 'center' },
  stickyCol:   { textAlign: 'left', position: 'sticky', left: 0, background: '#fff', zIndex: 1, minWidth: '160px' },
  cell:        { cursor: 'pointer', minWidth: '52px' },
  gradeChip:   { display: 'inline-block', width: '36px', height: '36px', borderRadius: '50%', lineHeight: '36px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' },
  empty:       { color: '#ccc', fontSize: '18px' },
  emptyRow:    { padding: '32px', textAlign: 'center', color: '#aaa' },
  hint:        { textAlign: 'center', padding: '60px', color: '#aaa', background: '#fff', borderRadius: '12px' },
  overlay:     { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal:       { background: '#fff', borderRadius: '12px', padding: '28px', width: '360px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' },
  modalTitle:  { fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', marginTop: 0 },
  gradeRow:    { display: 'flex', gap: '10px', justifyContent: 'center' },
  gradeBtn:    { width: '52px', height: '52px', borderRadius: '50%', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer' },
  modalBtns:   { display: 'flex', justifyContent: 'flex-end', gap: '12px' },
  btnCancel:   { padding: '10px 20px', background: '#f0f0f0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  btnSave:     { padding: '10px 20px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
};
