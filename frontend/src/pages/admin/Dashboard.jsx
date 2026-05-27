import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import StudentsPage    from './StudentsPage';
import TeachersPage    from './TeachersPage';
import GroupsPage      from './GroupsPage';
import SubjectsPage    from './SubjectsPage';
import AssignmentsPage from './AssignmentsPage';
import api from '../../api/axios';

function Home() {
  const [stats, setStats] = useState({ students: 0, teachers: 0, groups: 0, subjects: 0 });
  const navigate = useNavigate();

  useEffect(() => { api.get('?route=stats').then(r => setStats(r.data)); }, []);

  const cards = [
    { icon: '👨‍🎓', label: 'Студентов',      value: stats.students, path: '/admin/students', color: '#eef2ff', accent: '#4f46e5' },
    { icon: '👨‍🏫', label: 'Преподавателей', value: stats.teachers, path: '/admin/teachers', color: '#f0fdf4', accent: '#16a34a' },
    { icon: '👥',   label: 'Групп',           value: stats.groups,   path: '/admin/groups',   color: '#fef9c3', accent: '#854d0e' },
    { icon: '📚',   label: 'Предметов',       value: stats.subjects, path: '/admin/subjects', color: '#fdf2f8', accent: '#9333ea' },
  ];

  return (
    <div>
      <h1 style={s.title}>Панель управления</h1>
      <div style={s.cards}>
        {cards.map(c => (
          <div key={c.label} style={{ ...s.card, background: c.color }} onClick={() => navigate(c.path)}>
            <div style={s.cardIcon}>{c.icon}</div>
            <div style={{ ...s.cardValue, color: c.accent }}>{c.value}</div>
            <div style={s.cardLabel}>{c.label}</div>
          </div>
        ))}
      </div>
      <div style={s.quickCard} onClick={() => navigate('/admin/assignments')}>
        <span style={{ fontSize: '20px' }}>🔗</span>
        <div>
          <div style={{ fontWeight: '600' }}>Назначения преподавателей</div>
          <div style={{ fontSize: '13px', color: '#888', marginTop: '2px' }}>Кто какой предмет в какой группе ведёт</div>
        </div>
        <span style={{ marginLeft: 'auto', color: '#aaa', fontSize: '20px' }}>→</span>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Layout>
      <Routes>
        <Route path="/"           element={<Home />} />
        <Route path="students"    element={<StudentsPage />} />
        <Route path="teachers"    element={<TeachersPage />} />
        <Route path="groups"      element={<GroupsPage />} />
        <Route path="subjects"    element={<SubjectsPage />} />
        <Route path="assignments" element={<AssignmentsPage />} />
        <Route path="*"           element={<Navigate to="/admin" />} />
      </Routes>
    </Layout>
  );
}

const s = {
  title:     { fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#1e1b4b' },
  cards:     { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' },
  card:      { borderRadius: '16px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', textAlign: 'center', cursor: 'pointer' },
  cardIcon:  { fontSize: '32px', marginBottom: '8px' },
  cardValue: { fontSize: '36px', fontWeight: 'bold', marginBottom: '4px' },
  cardLabel: { fontSize: '13px', color: '#666' },
  quickCard: { background: '#fff', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' },
};
