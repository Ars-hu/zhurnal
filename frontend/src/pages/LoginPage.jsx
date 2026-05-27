import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function LoginPage() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('?route=auth/login', { email, password });
      login(res.data.user, res.data.token);
      navigate(`/${res.data.user.role}`);
    } catch {
      setError('Неверный email или пароль');
    }
  };

  return (
    <div style={s.container}>
      <div style={s.card}>
        <h2 style={s.title}>🎓 Электронный журнал</h2>
        <p style={s.subtitle}>Колледж</p>
        {error && <p style={s.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input style={s.input} type="email" placeholder="Email"
            value={email} onChange={e => setEmail(e.target.value)} required />
          <input style={s.input} type="password" placeholder="Пароль"
            value={password} onChange={e => setPassword(e.target.value)} required />
          <button style={s.button} type="submit">Войти</button>
        </form>
      </div>
    </div>
  );
}

const s = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' },
  card:      { background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 2px 16px rgba(0,0,0,0.1)', width: '360px' },
  title:     { textAlign: 'center', marginBottom: '4px', fontSize: '24px' },
  subtitle:  { textAlign: 'center', color: '#888', marginBottom: '24px' },
  input:     { width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
  button:    { width: '100%', padding: '12px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' },
  error:     { color: 'red', marginBottom: '12px', textAlign: 'center' },
};
