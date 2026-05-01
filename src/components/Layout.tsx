import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Layout.module.css';

export default function Layout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <span className={styles.logo}>🍗 StockAI</span>
        <nav className={styles.nav}>
          {(usuario?.rol === 'CAJERO' || usuario?.rol === 'ADMIN') && (
            <NavLink to="/pos" className={({ isActive }) => isActive ? styles.active : ''}>
              Punto de Venta
            </NavLink>
          )}
          {usuario?.rol === 'ADMIN' && (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => isActive ? styles.active : ''}>
                Dashboard
              </NavLink>
              <NavLink to="/productos" className={({ isActive }) => isActive ? styles.active : ''}>
                Productos
              </NavLink>
              <NavLink to="/ventas" className={({ isActive }) => isActive ? styles.active : ''}>
                Ventas
              </NavLink>
            </>
          )}
          {usuario?.rol === 'REPOSITOR' && (
            <NavLink to="/productos" className={({ isActive }) => isActive ? styles.active : ''}>
              Productos
            </NavLink>
          )}
        </nav>
        <div className={styles.user}>
          <span>{usuario?.nombre || usuario?.username}</span>
          <span className={styles.rol}>{usuario?.rol}</span>
          <button type="button" onClick={handleLogout} className={styles.logout}>
            Salir
          </button>
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
