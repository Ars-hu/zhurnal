import { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function GradesPage() {
  const [grades,  setGrades]  = useState([]);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.get('?route=grades').then(r => setGrades(r.data));
    api.get('?route=students/me').then(r => setProfile(r.data));
  }, []);

  const subjects = [...new Set(grades.map(g => g.subject_name))];

  // Только реальные оценки (не пропуски без оценки)
  const getGrades = (subjectName) =>
    grades.filter(g => g.subject_name === subjectName && g.grade !== null);

  const getAvg = (subjectName) => {
    const sg = getGrades(subjectName);
    return sg.length ? (sg.reduce((a, g) => a + parseInt(g.grade), 0) / sg.length).toFixed(1) : '—';
  };

  const gradeColor = (g) => {
    const n = parseInt(g);
    if (n === 5) return { background: '#dcfce7', color: '#16a34a' };
    if (n === 4) return { background: '#dbeafe', color: '#1d4ed8' };
    if (n === 3) return { background: '#fef9c3', color: '#854d0e' };
    return { background: '#fee2e2', color: '#dc2626' };
  };

  const allGrades = grades.filter(g => g.grade !== null);
  const overallAvg = allGrades.length
    ? (allGrades.reduce((a, g) => a + parseInt(g.grade), 0) / allGrades.length).toFixed(1)
    : '—';

  // Статистика посещаемости
  const total   = grades.length;
  const present = grades.filter(g => g.attendance_status === 'present').length;
  const absent  = grades.filter(g => g.attendance_status === 'absent').length;
  const excused = grades.filter(g => g.attendance_status === 'excused').length;
  const pct     = total ? Math.round((present / total) * 100) : 0;

  const statusChip = (status) => {
    if (status === 'absent')  return { label: 'Н',  bg: '#fee2e2', color: '#dc2626', title: 'Пропуск' };
    if (status === 'excused') return { label: 'У',  bg: '#fef9c3', color: '#854d0e', title: 'Уважительный пропуск' };
    return null;
  };

  return (
    <div>
      <h2 style={s.title}>📝 Мои оценки</h2>

      {/* Профиль студента */}
      {profile && (
        <div style={s.profileCard}>
          <div style={s.profileInfo}>
            <span style={s.profileIcon}>👨‍🎓</span>
            <div>
              <div style={s.profileName}>{profile.name}</div>
              <div style={s.profileDetail}>{profile.email}</div>
              <div style={s.profileGroup}>Группа: <strong>{profile.group_name}</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* Статы оценок */}
      <div style={s.statsRow}>
        <div style={s.statCard}>
          <div style={{ ...s.statValue, color: '#4f46e5' }}>{overallAvg}</div>
          <div style={s.statLabel}>Средний балл</div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statValue, color: '#333' }}>{allGrades.length}</div>
          <div style={s.statLabel}>Всего оценок</div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statValue, color: '#16a34a' }}>{pct}%</div>
          <div style={s.statLabel}>Посещаемость</div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statValue, color: '#dc2626' }}>{absent}</div>
          <div style={s.statLabel}>Пропусков</div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statValue, color: '#d97706' }}>{excused}</div>
          <div style={s.statLabel}>Уваж. пропусков</div>
        </div>
      </div>

      {/* Блоки по предметам */}
      {subjects.map(subj => {
        const subjGrades = grades.filter(g => g.subject_name === subj);
        return (
          <div key={subj} style={s.subjectBlock}>
            <div style={s.subjectHeader}>
              <span style={s.subjectName}>{subj}</span>
              <span style={s.subjectAvg}>Средний балл: <strong>{getAvg(subj)}</strong></span>
            </div>
            <div style={s.gradesRow}>
              {subjGrades.map(g => {
                const chip = statusChip(g.attendance_status);
                return (
                  <div key={g.id} style={{ ...s.gradeChip, ...(g.grade !== null ? gradeColor(g.grade) : { background: '#f0f0f0', color: '#888' }) }}
                    title={chip ? chip.title : ''}>
                    <div style={s.gradeNum}>
                      {g.grade !== null ? g.grade : (chip ? chip.label : '—')}
                    </div>
                    <div style={s.gradeDate}>{g.date?.slice(5)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {grades.length === 0 && <div style={s.empty}>Оценок пока нет</div>}
    </div>
  );
}

const s = {
  title:         { fontSize: '22px', fontWeight: 'bold', marginBottom: '20px' },
  profileCard:   { background: '#fff', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  profileInfo:   { display: 'flex', alignItems: 'center', gap: '16px' },
  profileIcon:   { fontSize: '40px' },
  profileName:   { fontWeight: '700', fontSize: '16px', marginBottom: '4px' },
  profileDetail: { fontSize: '14px', color: '#555', marginBottom: '2px' },
  profileGroup:  { fontSize: '14px', color: '#4f46e5' },
  statsRow:      { display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' },
  statCard:      { background: '#fff', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', textAlign: 'center', flex: 1, minWidth: '100px' },
  statValue:     { fontSize: '28px', fontWeight: 'bold' },
  statLabel:     { fontSize: '12px', color: '#888', marginTop: '4px' },
  subjectBlock:  { background: '#fff', borderRadius: '12px', padding: '20px', marginBottom: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  subjectHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' },
  subjectName:   { fontWeight: '600', fontSize: '15px' },
  subjectAvg:    { fontSize: '14px', color: '#555' },
  gradesRow:     { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  gradeChip:     { borderRadius: '10px', padding: '8px 12px', textAlign: 'center', minWidth: '44px' },
  gradeNum:      { fontSize: '18px', fontWeight: 'bold' },
  gradeDate:     { fontSize: '11px', marginTop: '2px' },
  empty:         { textAlign: 'center', padding: '60px', color: '#aaa', background: '#fff', borderRadius: '12px' },
};
