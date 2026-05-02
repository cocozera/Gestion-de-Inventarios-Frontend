import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { ventasApi, VentaListItem } from '../../api/ventas';
import { formatPrecio, formatFecha } from '../../utils/format';
import { dataCache } from '../../utils/cache';
import styles from './Ventas.module.css';

function hoy() {
  return new Date().toISOString().slice(0, 10);
}

function inicioSemana() {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1));
  return d.toISOString().slice(0, 10);
}

function inicioMes() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

type Preset = 'hoy' | 'semana' | 'mes' | 'todo' | 'custom';

export default function Ventas() {
  const [ventas, setVentas] = useState<VentaListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [preset, setPreset] = useState<Preset>('hoy');
  const [desde, setDesde] = useState(hoy());
  const [hasta, setHasta] = useState(hoy());

  function aplicarPreset(p: Preset) {
    setPreset(p);
    if (p === 'hoy')    { setDesde(hoy());         setHasta(hoy()); }
    if (p === 'semana') { setDesde(inicioSemana()); setHasta(hoy()); }
    if (p === 'mes')    { setDesde(inicioMes());    setHasta(hoy()); }
    if (p === 'todo')   { setDesde('');             setHasta('');    }
  }

  function handleManualChange(campo: 'desde' | 'hasta', val: string) {
    setPreset('custom');
    if (campo === 'desde') setDesde(val);
    else setHasta(val);
  }

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

  const [exportModal, setExportModal] = useState(false);
  const [exportDesde, setExportDesde] = useState(hoy());
  const [exportHasta, setExportHasta] = useState(hoy());
  const [exportando, setExportando] = useState(false);

  async function confirmarExport() {
    setExportando(true);
    try {
      const desdeISO = exportDesde ? `${exportDesde}T00:00:00` : undefined;
      const hastaISO = exportHasta ? `${exportHasta}T23:59:59` : undefined;
      const data = await ventasApi.listar(desdeISO, hastaISO);
      const filas = data.map((v) => ({
        'Nº': v.id,
        'Fecha y hora': formatFecha(v.fecha_hora),
        'Total': v.total,
        'Medio de pago': v.medio_pago,
        'Estado': v.estado,
      }));
      const ws = XLSX.utils.json_to_sheet(filas);
      ws['!cols'] = [{ wch: 8 }, { wch: 20 }, { wch: 14 }, { wch: 20 }, { wch: 12 }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Ventas');
      const nombre = exportDesde && exportHasta
        ? `ventas_${exportDesde}_${exportHasta}.xlsx`
        : exportDesde
          ? `ventas_desde_${exportDesde}.xlsx`
          : exportHasta
            ? `ventas_hasta_${exportHasta}.xlsx`
            : 'ventas.xlsx';
      XLSX.writeFile(wb, nombre);
      setExportModal(false);
    } catch {
      alert('Error al obtener los datos para exportar');
    } finally {
      setExportando(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <h1>Historial de ventas</h1>

      <div className={styles.filtros}>
        <div className={styles.presets}>
          {(['hoy', 'semana', 'mes', 'todo'] as Preset[]).map((p) => (
            <button
              key={p}
              type="button"
              className={`${styles.presetBtn} ${preset === p ? styles.presetActive : ''}`}
              onClick={() => aplicarPreset(p)}
            >
              {{ hoy: 'Hoy', semana: 'Esta semana', mes: 'Este mes', todo: 'Todo' }[p]}
            </button>
          ))}
        </div>

        <div className={styles.fechas}>
          <label className={preset === 'todo' ? styles.labelDisabled : ''}>
            <span>Desde</span>
            <input
              type="date"
              value={desde}
              disabled={preset === 'todo'}
              onChange={(e) => handleManualChange('desde', e.target.value)}
            />
          </label>
          <label className={preset === 'todo' ? styles.labelDisabled : ''}>
            <span>Hasta</span>
            <input
              type="date"
              value={hasta}
              disabled={preset === 'todo'}
              onChange={(e) => handleManualChange('hasta', e.target.value)}
            />
          </label>
        </div>

        <button
          type="button"
          className={styles.btnExcel}
          onClick={() => setExportModal(true)}
        >
          ↓ Exportar Excel
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
      {exportModal && (
        <div className={styles.overlay} onClick={() => !exportando && setExportModal(false)}>
          <div className={styles.exportModalBox} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.exportModalTitle}>Exportar a Excel</h2>
            <p className={styles.exportModalSub}>Seleccioná el rango de fechas</p>
            <div className={styles.exportFiltros}>
              <label>
                <span>Desde</span>
                <input
                  type="date"
                  value={exportDesde}
                  onChange={(e) => setExportDesde(e.target.value)}
                  disabled={exportando}
                />
              </label>
              <label>
                <span>Hasta</span>
                <input
                  type="date"
                  value={exportHasta}
                  onChange={(e) => setExportHasta(e.target.value)}
                  disabled={exportando}
                />
              </label>
            </div>
            <div className={styles.exportModalActions}>
              <button
                type="button"
                className={styles.btnCancel}
                onClick={() => setExportModal(false)}
                disabled={exportando}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.btnExcel}
                onClick={confirmarExport}
                disabled={exportando}
              >
                {exportando ? 'Descargando...' : '↓ Descargar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
