import { useState, useEffect } from 'react';
import { productosApi } from '../../services/api';
import type { Producto } from '../../services/api';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productosApi.listar().then(({ data }) => {
      setProductos(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const alertasStock = productos.filter((p) => p.stock_actual <= p.stock_minimo && p.stock_minimo > 0);

  return (
    <div className={styles.wrapper}>
      <h1>Dashboard</h1>
      <p className={styles.subtitle}>Panel de control para administrador</p>

      <section className={styles.cards}>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Productos activos</span>
          <span className={styles.cardValue}>{loading ? '...' : productos.length}</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Alertas de stock bajo</span>
          <span className={styles.cardValue} style={{ color: alertasStock.length ? 'var(--warning)' : undefined }}>
            {loading ? '...' : alertasStock.length}
          </span>
        </div>
      </section>

      {alertasStock.length > 0 && (
        <section className={styles.section}>
          <h2>Productos con stock bajo</h2>
          <ul className={styles.list}>
            {alertasStock.map((p) => (
              <li key={p.id}>
                <strong>{p.nombre}</strong> — Stock: {p.stock_actual} (mínimo: {p.stock_minimo})
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className={styles.section}>
        <h2>Resumen</h2>
        <p className={styles.muted}>
          Aquí podrás ver gráficos de ventas del día, productos más vendidos y cierre de caja cuando se implemente el historial de ventas.
        </p>
      </section>
    </div>
  );
}
