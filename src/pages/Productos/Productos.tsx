import { useState, useEffect, useCallback } from 'react';
import { productosApi } from '../../api/productos';
import { Producto } from '../../types';
import styles from './Productos.module.css';

interface FormData {
  codigo_barras: string;
  nombre: string;
  precio_costo: number;
  precio_venta: number;
  stock_actual: number;
  stock_minimo: number;
}

const emptyForm: FormData = {
  codigo_barras: '',
  nombre: '',
  precio_costo: 0,
  precio_venta: 0,
  stock_actual: 0,
  stock_minimo: 0,
};

export default function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [modal, setModal] = useState<'cerrado' | 'nuevo' | 'editar'>('cerrado');
  const [editing, setEditing] = useState<Producto | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [guardando, setGuardando] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    productosApi.listar(q).then((data) => {
      setProductos(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [q]);

  useEffect(() => { load(); }, [load]);

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
        await productosApi.crear({ ...form, categoria_id: 1, estado: true });
      }
      setModal('cerrado');
      load();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  }

  function set(field: keyof FormData, value: string | number) {
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
                <th></th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id}>
                  <td>{p.codigo_barras}</td>
                  <td>{p.nombre}</td>
                  <td>${p.precio_venta.toFixed(2)}</td>
                  <td>${p.precio_costo.toFixed(2)}</td>
                  <td style={{ color: p.stock_actual <= p.stock_minimo ? 'var(--warning)' : undefined }}>
                    {p.stock_actual}
                  </td>
                  <td>{p.stock_minimo}</td>
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
                  value={form.codigo_barras}
                  onChange={(e) => set('codigo_barras', e.target.value)}
                  required
                  disabled={!!editing}
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
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setModal('cerrado')}>Cancelar</button>
                <button type="submit" className={styles.btnPrimary} disabled={guardando}>
                  {guardando ? 'Guardando...' : editing ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
