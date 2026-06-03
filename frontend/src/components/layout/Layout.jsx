import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const menuItems = {
  admin: [
    { path: '/admin',          icon: '🏠',   label: 'Главная',          end: true },
    { path: '/admin/students', icon: '👨‍🎓', label: 'Студенты' },
    { path: '/admin/teachers', icon: '👨‍🏫', label: 'Преподаватели' },
    { path: '/admin/groups',   icon: '👥',   label: 'Группы' },
    { path: '/admin/subjects', icon: '📚',   label: 'Предметы' },
  ],
  teacher: [
    { path: '/teacher/journal', icon: '📒', label: 'Журнал' },
  ],
  student: [
    { path: '/student/grades', icon: '📝', label: 'Мои оценки' },
  ],
};

function roleLabel(role) {
  return { admin: 'Администратор', teacher: 'Преподаватель', student: 'Студент' }[role] || '';
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };
  const items = menuItems[user?.role] || [];

  return (
    <div style={styles.wrapper}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <span style={{ fontSize: '24px' }}>🎓</span>
          <span style={styles.logoText}>Журнал</span>
        </div>

        <div style={styles.topUser}>
          <div style={styles.userInfo}>
            <div style={styles.userName}>{user?.name}</div>
            <div style={styles.userRole}>{roleLabel(user?.role)}</div>
          </div>
          <button style={styles.logoutBtnTop} onClick={handleLogout} title="Выйти">
            ⏻
          </button>
        </div>

        <nav style={styles.nav}>
          {items.map(item => (
            <NavLink key={item.path} to={item.path} end={item.end}
              style={({ isActive }) => ({ ...styles.navItem, ...(isActive ? styles.navActive : {}) })}>
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <main style={styles.main}>{children}</main>
    </div>
  );
}

const styles = {
  wrapper:      { display: 'flex', minHeight: '100vh', background: '#f0f2f5' },
  sidebar:      { width: '240px', background: '#1e1e2d', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  logo:         { display: 'flex', alignItems: 'center', gap: '10px', padding: '24px 20px', borderBottom: '1px solid #2d2d3f' },
  logoText:     { color: '#fff', fontSize: '18px', fontWeight: 'bold' },
  topUser: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', padding: '14px 16px 10px', borderBottom: '1px solid #2d2d3f' },  userInfo:     { overflow: 'hidden' },
  userName: { color: '#fff', fontSize: '13px', fontWeight: 'bold', wordBreak: 'break-word' },
  userRole:     { color: '#a0a0b8', fontSize: '11px', marginTop: '2px' },
  logoutBtnTop: { flexShrink: 0, width: '32px', height: '32px', background: '#e53e3e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  nav:          { flex: 1, padding: '12px 0' },
  navItem:      { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', color: '#a0a0b8', textDecoration: 'none', fontSize: '14px' },
  navActive:    { background: '#4f46e5', color: '#fff', borderRadius: '0 8px 8px 0' },
  main:         { flex: 1, padding: '32px', overflowY: 'auto' },
};
