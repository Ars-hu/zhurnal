import GradeChip from './GradeChip';

export default function GradeTable({ students, dates, grades, onCellClick }) {
  const getGrade = (studentId, date) =>
    grades.find(g => g.student_id === studentId && g.date === date);

  const getAvg = (studentId) => {
    const sg = grades.filter(g => g.student_id === studentId && g.grade !== 'н' && g.grade !== null);
    return sg.length
      ? (sg.reduce((a, g) => a + parseInt(g.grade), 0) / sg.length).toFixed(1)
      : '—';
  };

  return (
    <div style={s.wrap}>
      <table style={s.table}>
        <thead>
          <tr>
            <th style={{ ...s.th, ...s.stickyCol }}>Студент</th>
            {dates.map(d => <th key={d} style={s.th}>{d.slice(5)}</th>)}
            <th style={{ ...s.th, color: '#4f46e5' }}>Ср. балл</th>
          </tr>
        </thead>
        <tbody>
          {students.map(st => (
            <tr key={st.id} style={s.tr}>
              <td style={{ ...s.td, ...s.stickyCol, fontWeight: '600' }}>{st.name}</td>
              {dates.map(d => {
                const g = getGrade(st.id, d);
                return (
                  <td key={d} style={{ ...s.td, cursor: 'pointer' }}
                    onClick={() => onCellClick(st.id, d, g)}>
                    {g
                      ? <GradeChip grade={g.grade} />
                      : <span style={s.plus}>+</span>
                    }
                  </td>
                );
              })}
              <td style={{ ...s.td, fontWeight: 'bold', color: '#4f46e5' }}>
                {getAvg(st.id)}
              </td>
            </tr>
          ))}
          {students.length === 0 && (
            <tr><td colSpan={dates.length + 2} style={s.empty}>В группе нет студентов</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const s = {
  wrap:      { background: '#fff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'auto' },
  table:     { borderCollapse: 'collapse', minWidth: '100%' },
  th:        { padding: '12px 14px', background: '#f8f9fa', fontSize: '13px', fontWeight: '600', color: '#555', borderBottom: '1px solid #eee', whiteSpace: 'nowrap', textAlign: 'center' },
  tr:        { borderBottom: '1px solid #f0f0f0' },
  td:        { padding: '10px 14px', fontSize: '14px', textAlign: 'center' },
  stickyCol: { textAlign: 'left', position: 'sticky', left: 0, background: '#fff', zIndex: 1, minWidth: '160px' },
  plus:      { color: '#d1d5db', fontSize: '20px' },
  empty:     { padding: '32px', textAlign: 'center', color: '#aaa' },
};
