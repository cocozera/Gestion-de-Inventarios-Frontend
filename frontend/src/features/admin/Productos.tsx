import { useState, useEffect, useCallback } from 'react';
import { productosApi } from '../../services/api';
import type { Producto } from '../../services/api';
import styles from './Productos.module.css';

export default function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [modal, setModal] = useState<'cerrado' | 'nuevo' | 'editar'>('cerrado');
  const [editing, setEditing] = useState<Producto | null>(null);
  const [form, setForm] = useState({
    codigo_barras: '',
    nombre: '',
    categoria_id: null as number | null,
    precio_costo: 0,
    precio_venta: 0,
    stock_actual: 0,
    stock_minimo: 0,
  });

  const load = useCallback(() => {
    setLoading(true);
    productosApi.listar(q || undefined)
      .then(({ data }) => {
        setProductos(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [q]);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    setEditing(null);
    setForm({
      codigo_barras: '',
      nombre: '',
      categoria_id: null,
      precio_costo: 0,
      precio_venta: 0,
      stock_actual: 0,
      stock_minimo: 0,
    });
    setModal('nuevo');
  };

  const openEdit = (p: Producto) => {
    setEditing(p);
    setForm({
      codigo_barras: p.codigo_barras,
      nombre: p.nombre,
      categoria_id: p.categoria_id,
      precio_costo: p.precio_costo,
      precio_venta: p.precio_venta,
      stock_actual: p.stock_actual,
      stock_minimo: p.stock_minimo,
    });
    setModal('editar');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await productosApi.actualizar(editing.id, form);
      } else {
        await productosApi.crear(form);
      }
      setModal('cerrado');
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Error';
      alert(msg);
    }
  };

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
          Nuevo producto
        </button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>P. venta</th>
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
                  <td>{p.stock_actual}</td>
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
                  onChange={(e) => setForm((f) => ({ ...f, codigo_barras: e.target.value }))}
                  required
                  disabled={!!editing}
                />
              </label>
              <label>
                Nombre
                <input
                  value={form.nombre}
                  onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
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
                  onChange={(e) => setForm((f) => ({ ...f, precio_venta: parseFloat(e.target.value) || 0 }))}
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
                  onChange={(e) => setForm((f) => ({ ...f, precio_costo: parseFloat(e.target.value) || 0 }))}
                />
              </label>
              <label>
                Stock actual
                <input
                  type="number"
                  min="0"
                  value={form.stock_actual}
                  onChange={(e) => setForm((f) => ({ ...f, stock_actual: parseInt(e.target.value, 10) || 0 }))}
                />
              </label>
              <label>
                Stock mínimo
                <input
                  type="number"
                  min="0"
                  value={form.stock_minimo}
                  onChange={(e) => setForm((f) => ({ ...f, stock_minimo: parseInt(e.target.value, 10) || 0 }))}
                />
              </label>
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setModal('cerrado')}>
                  Cancelar
                </button>
                <button type="submit" className={styles.btnPrimary}>
                  {editing ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
