import { useState, useEffect } from 'react';
import { productosApi } from '../../api/productos';
import { Producto } from '../../types';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productosApi.listar().then((data) => {
      setProductos(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const alertas = productos.filter((p) => p.stock_actual <= p.stock_minimo && p.stock_minimo > 0);

  return (
    <div className={styles.wrapper}>
      <h1>Dashboard</h1>
      <p className={styles.subtitle}>Panel de control</p>

      <section className={styles.cards}>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Productos activos</span>
          <span className={styles.cardValue}>{loading ? '...' : productos.length}</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Alertas de stock bajo</span>
          <span className={styles.cardValue} style={{ color: alertas.length ? 'var(--warning)' : undefined }}>
            {loading ? '...' : alertas.length}
          </span>
        </div>
      </section>

      {alertas.length > 0 && (
        <section className={styles.section}>
          <h2>Productos con stock bajo</h2>
          <ul className={styles.list}>
            {alertas.map((p) => (
              <li key={p.id}>
                <strong>{p.nombre}</strong> — Stock: {p.stock_actual} (mínimo: {p.stock_minimo})
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className={styles.section}>
        <h2>Accesos rápidos</h2>
        <p className={styles.muted}>
          Usá la navegación superior para ir al Punto de Venta, gestionar productos o ver el historial de ventas.
        </p>
      </section>
    </div>
  );
}
