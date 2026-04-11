import { useState, useEffect } from 'react';
import { ventasApi } from '../../services/api';
import styles from './Ventas.module.css';

interface VentaRow {
  id: number;
  fecha_hora: string;
  total: number;
  medio_pago: string;
  estado: string;
}

export default function Ventas() {
  const [ventas, setVentas] = useState<VentaRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    ventasApi.listar({ limit: 100 })
      .then(({ data }) => {
        setVentas(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className={styles.wrapper}>
      <h1>Historial de ventas</h1>
      <p className={styles.subtitle}>Tickets emitidos y cierres de caja</p>
      {loading ? (
        <p>Cargando...</p>
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
                    <span className={v.estado === 'ANULADA' ? styles.anulada : ''}>
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
