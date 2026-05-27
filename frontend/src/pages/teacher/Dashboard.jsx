import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import JournalPage from './JournalPage';

export default function TeacherDashboard() {
  return (
    <Layout>
      <Routes>
        <Route path="journal" element={<JournalPage />} />
        <Route path="*"       element={<Navigate to="/teacher/journal" />} />
      </Routes>
    </Layout>
  );
}
