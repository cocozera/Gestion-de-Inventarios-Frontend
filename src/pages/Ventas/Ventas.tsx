import { useState, useEffect } from 'react';
import { ventasApi, VentaListItem } from '../../api/ventas';
import styles from './Ventas.module.css';

export default function Ventas() {
  const [ventas, setVentas] = useState<VentaListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ventasApi.listar().then((data) => {
      setVentas(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className={styles.wrapper}>
      <h1>Historial de ventas</h1>
      <p className={styles.subtitle}>Tickets emitidos y estado de cada venta</p>
      {loading ? (
        <p>Cargando...</p>
      ) : ventas.length === 0 ? (
        <p className={styles.subtitle}>No hay ventas registradas aún.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nº</th>
                <th>Fecha y hora</th>
                <th>Total</th>
                <th>Medio de pago</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((v) => (
                <tr key={v.id}>
                  <td>{v.id}</td>
                  <td>{new Date(v.fecha_hora).toLocaleString('es-AR')}</td>
                  <td>${v.total.toFixed(2)}</td>
                  <td>{v.medio_pago}</td>
                  <td>
                    <span className={v.estado === 'ANULADA' ? styles.anulada : styles.ok}>
                      {v.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
