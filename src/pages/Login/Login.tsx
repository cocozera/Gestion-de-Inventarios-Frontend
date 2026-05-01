import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginApi } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import styles from './Login.module.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginApi(username, password);
      login(data.access_token, data.usuario);
      if (data.usuario.rol === 'CAJERO') navigate('/pos', { replace: true });
      else if (data.usuario.rol === 'REPOSITOR') navigate('/productos', { replace: true });
      else navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Usuario o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>🍗 StockAI</h1>
        <p className={styles.subtitle}>Sistema de inventario y punto de venta</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label>
            Usuario
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              autoFocus
            />
          </label>
          <label>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" disabled={loading} className={styles.submit}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
