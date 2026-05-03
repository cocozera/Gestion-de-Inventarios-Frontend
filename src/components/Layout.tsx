import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Layout.module.css';
import logo from '../assets/logo.png';

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
        <a className={styles.logoLink} href="#">
          <img src={logo} alt="Logo" className={styles.logoImg} />
        </a>
        <div className={styles.divider} />
        <nav className={styles.nav}>
          {(usuario?.rol === 'CAJERO' || usuario?.rol === 'ADMIN') && (
            <NavLink to="/pos" className={({ isActive }) => isActive ? styles.active : ''}>
              Caja
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
          <span className={styles.userName}>{usuario?.nombre || usuario?.username}</span>
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
