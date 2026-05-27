import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import GradesPage from './GradesPage';

export default function StudentDashboard() {
  return (
    <Layout>
      <Routes>
        <Route path="grades" element={<GradesPage />} />
        <Route path="*"      element={<Navigate to="/student/grades" />} />
      </Routes>
    </Layout>
  );
}
