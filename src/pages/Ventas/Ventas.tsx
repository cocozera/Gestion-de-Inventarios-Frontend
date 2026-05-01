import { useState, useEffect } from 'react';
import { ventasApi, VentaListItem } from '../../api/ventas';
import { formatPrecio, formatFecha } from '../../utils/format';
import { dataCache } from '../../utils/cache';
import styles from './Ventas.module.css';

function hoy() {
  return new Date().toISOString().slice(0, 10);
}

export default function Ventas() {
  const [ventas, setVentas] = useState<VentaListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [desde, setDesde] = useState(hoy());
  const [hasta, setHasta] = useState(hoy());

  useEffect(() => {
    const subkey = `${desde}_${hasta}`;
    const cached = dataCache.get<VentaListItem[]>('ventas', subkey);
    if (cached) {
      setVentas(cached);
      setLoading(false);
      return;
    }
    setLoading(true);
    const desdeISO = desde ? `${desde}T00:00:00` : undefined;
    const hastaISO = hasta ? `${hasta}T23:59:59` : undefined;
    ventasApi.listar(desdeISO, hastaISO).then((data) => {
      dataCache.set('ventas', data, subkey);
      setVentas(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [desde, hasta]);

  const completadas = ventas.filter((v) => v.estado !== 'ANULADA');
  const totalDia = completadas.reduce((acc, v) => acc + v.total, 0);

  return (
    <div className={styles.wrapper}>
      <h1>Historial de ventas</h1>

      <div className={styles.filtros}>
        <label>
          <span>Desde</span>
          <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        </label>
        <label>
          <span>Hasta</span>
          <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </label>
        <button
          type="button"
          className={styles.btnSm}
          onClick={() => { setDesde(''); setHasta(''); }}
        >
          Ver todo
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Cargando...</p>
      ) : ventas.length === 0 ? (
        <p className={styles.subtitle}>No hay ventas en el período seleccionado.</p>
      ) : (
        <>
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
                    <td>{formatFecha(v.fecha_hora)}</td>
                    <td style={{ fontWeight: 600 }}>{formatPrecio(v.total)}</td>
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

          <div className={styles.totalBox}>
            <div className={styles.totalRow}>
              <span>{completadas.length} venta{completadas.length !== 1 ? 's' : ''} completada{completadas.length !== 1 ? 's' : ''}</span>
              <div>
                <span className={styles.totalLabel}>Total del período</span>
                <span className={styles.totalValor}>{formatPrecio(totalDia)}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
