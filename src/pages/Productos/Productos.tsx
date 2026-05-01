import { useState, useEffect, useCallback } from 'react';
import { productosApi } from '../../api/productos';
import { Producto } from '../../types';
import { formatPrecio } from '../../utils/format';
import { dataCache } from '../../utils/cache';
import styles from './Productos.module.css';

interface FormData {
  codigo_barras: string;
  nombre: string;
  precio_costo: number;
  precio_venta: number;
  stock_actual: number;
  stock_minimo: number;
  estado: boolean;
}

const emptyForm: FormData = {
  codigo_barras: '',
  nombre: '',
  precio_costo: 0,
  precio_venta: 0,
  stock_actual: 0,
  stock_minimo: 0,
  estado: true,
};

export default function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [mostrarInactivos, setMostrarInactivos] = useState(false);
  const [modal, setModal] = useState<'cerrado' | 'nuevo' | 'editar'>('cerrado');
  const [editing, setEditing] = useState<Producto | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [guardando, setGuardando] = useState(false);

  const load = useCallback(() => {
    // Solo usamos caché para la lista sin filtro
    if (!q) {
      const cached = dataCache.get<Producto[]>('productos', 'all');
      if (cached) { setProductos(cached); setLoading(false); return; }
    }
    setLoading(true);
    productosApi.listar(q).then((data) => {
      if (!q) dataCache.set('productos', data, 'all');
      setProductos(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [q]);

  useEffect(() => { load(); }, [load]);

  const visibles = mostrarInactivos ? productos : productos.filter((p) => p.estado);

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setModal('nuevo');
  }

  function openEdit(p: Producto) {
    setEditing(p);
    setForm({
      codigo_barras: p.codigo_barras,
      nombre: p.nombre,
      precio_costo: p.precio_costo,
      precio_venta: p.precio_venta,
      stock_actual: p.stock_actual,
      stock_minimo: p.stock_minimo,
      estado: p.estado,
    });
    setModal('editar');
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    try {
      if (editing) {
        await productosApi.actualizar(editing.id, form);
      } else {
        await productosApi.crear({ ...form, categoria_id: 1 });
      }
      // Invalidar caché: productos cambió → dashboard también lo refleja
      dataCache.invalidate('productos', 'dashboard');
      setModal('cerrado');
      load();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  }

  function set(field: keyof FormData, value: string | number | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  return (
    <div className={styles.wrapper}>
      <h1>Gestión de productos</h1>
      <div className={styles.toolbar}>
        <input
          type="text"
          placeholder="Buscar por nombre o código..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className={styles.search}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={mostrarInactivos}
            onChange={(e) => setMostrarInactivos(e.target.checked)}
            style={{ width: 'auto' }}
          />
          Mostrar inactivos
        </label>
        <button type="button" onClick={openNew} className={styles.btnPrimary}>
          + Nuevo producto
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Cargando...</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>P. venta</th>
                <th>P. costo</th>
                <th>Stock</th>
                <th>Mín.</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((p) => (
                <tr key={p.id} style={{ opacity: p.estado ? 1 : 0.5 }}>
                  <td>{p.codigo_barras}</td>
                  <td>{p.nombre}</td>
                  <td>{formatPrecio(p.precio_venta)}</td>
                  <td>{formatPrecio(p.precio_costo)}</td>
                  <td style={{ color: p.stock_actual <= p.stock_minimo && p.stock_minimo > 0 ? 'var(--warning)' : undefined }}>
                    {p.stock_actual}
                  </td>
                  <td>{p.stock_minimo}</td>
                  <td>
                    <span style={{ color: p.estado ? 'var(--success)' : 'var(--danger)', fontSize: '0.8rem', fontWeight: 600 }}>
                      {p.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <button type="button" onClick={() => openEdit(p)} className={styles.btnSm}>
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal !== 'cerrado' && (
        <div className={styles.overlay} onClick={() => setModal('cerrado')}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Editar producto' : 'Nuevo producto'}</h2>
            <form onSubmit={submit}>
              <label>
                Código de barras
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={form.codigo_barras}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    set('codigo_barras', val);
                  }}
                  required
                  disabled={!!editing}
                  autoFocus
                />
              </label>
              <label>
                Nombre
                <input
                  value={form.nombre}
                  onChange={(e) => set('nombre', e.target.value)}
                  required
                />
              </label>
              <label>
                Precio de venta
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.precio_venta}
                  onChange={(e) => set('precio_venta', parseFloat(e.target.value) || 0)}
                  required
                />
              </label>
              <label>
                Precio de costo
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.precio_costo}
                  onChange={(e) => set('precio_costo', parseFloat(e.target.value) || 0)}
                />
              </label>
              <label>
                Stock actual
                <input
                  type="number"
                  min="0"
                  value={form.stock_actual}
                  onChange={(e) => set('stock_actual', parseInt(e.target.value, 10) || 0)}
                />
              </label>
              <label>
                Stock mínimo
                <input
                  type="number"
                  min="0"
                  value={form.stock_minimo}
                  onChange={(e) => set('stock_minimo', parseInt(e.target.value, 10) || 0)}
                />
              </label>
              {editing && (
                <label style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={form.estado}
                    onChange={(e) => set('estado', e.target.checked)}
                    style={{ width: 'auto' }}
                  />
                  Producto activo
                </label>
              )}
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setModal('cerrado')}>Cancelar</button>
                <button type="submit" className={styles.btnPrimary} disabled={guardando}>
                  {guardando ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
