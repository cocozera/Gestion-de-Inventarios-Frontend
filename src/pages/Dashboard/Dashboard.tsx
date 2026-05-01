import { useState, useEffect } from 'react';
import { productosApi } from '../../api/productos';
import { ventasApi, VentaListItem } from '../../api/ventas';
import { Producto } from '../../types';
import { formatPrecio } from '../../utils/format';
import { dataCache } from '../../utils/cache';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [ventas, setVentas] = useState<VentaListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hoy = new Date().toISOString().slice(0, 10);

    const cachedProds = dataCache.get<Producto[]>('productos', 'all');
    const cachedVents = dataCache.get<VentaListItem[]>('ventas', hoy);

    if (cachedProds && cachedVents) {
      setProductos(cachedProds);
      setVentas(cachedVents);
      setLoading(false);
      return;
    }

    Promise.all([
      cachedProds ? Promise.resolve(cachedProds) : productosApi.listar(),
      cachedVents ? Promise.resolve(cachedVents) : ventasApi.listar(`${hoy}T00:00:00`, `${hoy}T23:59:59`),
    ]).then(([prods, vents]) => {
      dataCache.set('productos', prods, 'all');
      dataCache.set('ventas', vents, hoy);
      setProductos(prods);
      setVentas(vents);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const activos = productos.filter((p) => p.estado);
  const sinStock = activos.filter((p) => p.stock_actual === 0);
  const alertas = activos.filter((p) => p.stock_actual > 0 && p.stock_actual <= p.stock_minimo && p.stock_minimo > 0);
  const ventasCompletadas = ventas.filter((v) => v.estado !== 'ANULADA');
  const totalDia = ventasCompletadas.reduce((acc, v) => acc + v.total, 0);

  return (
    <div className={styles.wrapper}>
      <h1>Dashboard</h1>
      <p className={styles.subtitle}>
        {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
      </p>

      <section className={styles.cards}>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Ventas hoy</span>
          <span className={styles.cardValue}>{loading ? '...' : ventasCompletadas.length}</span>
        </div>
        <div className={`${styles.card} ${styles.cardDestacado}`}>
          <span className={styles.cardLabel}>Recaudación del día</span>
          <span className={styles.cardValue} style={{ fontSize: '1.5rem' }}>
            {loading ? '...' : formatPrecio(totalDia)}
          </span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Productos activos</span>
          <span className={styles.cardValue}>{loading ? '...' : activos.length}</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Alertas stock bajo</span>
          <span className={styles.cardValue} style={{ color: alertas.length ? 'var(--warning)' : undefined }}>
            {loading ? '...' : alertas.length}
          </span>
        </div>
        <div className={`${styles.card} ${sinStock.length ? styles.cardSinStock : ''}`}>
          <span className={styles.cardLabel}>Sin stock</span>
          <span className={styles.cardValue}>
            {loading ? '...' : sinStock.length}
          </span>
        </div>
      </section>

      {sinStock.length > 0 && (
        <section className={styles.section}>
          <div className={styles.alertaSinStock}>
            <h2>🚨 Productos sin stock</h2>
            <ul style={{ margin: 0, padding: 0 }}>
              {sinStock.map((p) => (
                <li key={p.id}>
                  <span style={{ fontWeight: 700 }}>{p.nombre}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--danger)', fontWeight: 600, marginLeft: 'auto' }}>
                    SIN STOCK
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {alertas.length > 0 && (
        <section className={styles.section}>
          <h2>⚠️ Productos con stock bajo</h2>
          <ul className={styles.list}>
            {alertas.map((p) => (
              <li key={p.id}>
                <strong>{p.nombre}</strong>
                <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                  Stock: <span style={{ color: 'var(--warning)', fontWeight: 700 }}>{p.stock_actual}</span> (mínimo: {p.stock_minimo})
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {ventasCompletadas.length > 0 && (
        <section className={styles.section}>
          <h2>Últimas ventas de hoy</h2>
          <table className={styles.miniTabla}>
            <tbody>
              {ventasCompletadas.slice(0, 5).map((v) => (
                <tr key={v.id}>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>#{v.id}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {new Date(v.fecha_hora).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td>{v.medio_pago}</td>
                  <td style={{ fontWeight: 700, textAlign: 'right', color: 'var(--success)' }}>
                    {formatPrecio(v.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
