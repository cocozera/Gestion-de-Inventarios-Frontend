import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { productosApi } from '../../api/productos';
import { ventasApi } from '../../api/ventas';
import { ItemCarrito, MedioPago } from '../../types';
import CartGrid from './CartGrid';
import PaymentModal from './PaymentModal';
import styles from './Caja.module.css';
import { formatPrecio } from '../../utils/format';

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export default function Caja() {
  const { usuario } = useAuth();
  const [carrito, setCarrito] = useState<ItemCarrito[]>(() => {
    try {
      const saved = sessionStorage.getItem('carrito');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [searchVal, setSearchVal] = useState('');
  const [searchError, setSearchError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [ticketId, setTicketId] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const buscandoRef = useRef(false);

  const total = round2(carrito.reduce((acc, it) => acc + it.precio_unitario * it.cantidad, 0));
  const cantItems = carrito.reduce((acc, it) => acc + it.cantidad, 0);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    sessionStorage.setItem('carrito', JSON.stringify(carrito));
  }, [carrito]);

  const agregar = useCallback((id: number, nombre: string, precio_venta: number) => {
    setCarrito((prev) => {
      const idx = prev.findIndex((p) => p.producto_id === id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], cantidad: next[idx].cantidad + 1 };
        return next;
      }
      return [...prev, { producto_id: id, nombre, precio_unitario: precio_venta, cantidad: 1 }];
    });
    setSearchError('');
    setSearchVal('');
    inputRef.current?.focus();
  }, []);

  const buscar = useCallback(async (valor: string) => {
    const v = valor.trim().replace(/\D/g, '');
    if (!v || buscandoRef.current) return;
    buscandoRef.current = true;
    setSearchError('');

    try {
      const producto = await productosApi.buscarPorCodigo(v);
      agregar(producto.id, producto.nombre, producto.precio_venta);
    } catch {
      setSearchError('Código no encontrado');
    } finally {
      buscandoRef.current = false;
    }
  }, [agregar]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    buscar(searchVal);
  }


  const mas = (i: number) =>
    setCarrito((prev) => prev.map((it, idx) => idx === i ? { ...it, cantidad: it.cantidad + 1 } : it));

  const menos = (i: number) =>
    setCarrito((prev) => {
      const next = [...prev];
      if (next[i].cantidad <= 1) { next.splice(i, 1); return next; }
      next[i] = { ...next[i], cantidad: next[i].cantidad - 1 };
      return next;
    });

  const eliminar = (i: number) =>
    setCarrito((prev) => prev.filter((_, idx) => idx !== i));

  const procesarVenta = async (medioPago: MedioPago) => {
    if (!usuario) return;
    setProcesando(true);
    try {
      const resp = await ventasApi.procesar({
        usuario_id: usuario.id,
        medio_pago: medioPago,
        total,
        items: carrito.map((it) => ({
          producto_id: it.producto_id,
          cantidad: it.cantidad,
          precio_unitario: it.precio_unitario,
        })),
      });
      setTicketId(resp.ticket_id);
      setCarrito([]);
      sessionStorage.removeItem('carrito');
      setModalOpen(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al procesar la venta');
    } finally {
      setProcesando(false);
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'F12') {
        e.preventDefault();
        if (carrito.length > 0 && !modalOpen) setModalOpen(true);
      }
      if (e.key === 'Escape') {
        setModalOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [carrito.length, modalOpen]);

  return (
    <div className={styles.wrapper}>

      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <h1>Punto de Venta</h1>
          <p className={styles.topBarMeta}>
            {usuario?.nombre || usuario?.username}
            {' · '}
            {new Date().toLocaleDateString('es-AR', { dateStyle: 'long' })}
          </p>
        </div>
      </div>

      {ticketId && (
        <div className={styles.ticketBanner} onClick={() => setTicketId(null)}>
          ✅ Venta registrada — Ticket #{ticketId} · Click para cerrar
        </div>
      )}

      <div className={styles.body}>

        {/* ── Panel izquierdo ── */}
        <div className={styles.leftPanel}>

          {/* Barra de búsqueda */}
          <form onSubmit={handleSearchSubmit} className={styles.searchBar}>
            <div className={styles.searchWrap}>
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                value={searchVal}
                onChange={(e) => {
                  setSearchVal(e.target.value.replace(/\D/g, ''));
                  setSearchError('');
                }}
                placeholder="Ingresá el código de barras..."
                disabled={procesando}
                autoComplete="off"
                className={`${styles.searchInput} ${searchError ? styles.hasError : ''}`}
              />
            </div>
            <button
              type="submit"
              className={styles.btnBuscar}
              disabled={procesando || !searchVal.trim()}
            >
              Buscar
            </button>
          </form>

          {searchError && <p className={styles.searchError}>{searchError}</p>}

          {/* Carrito */}
          <div className={styles.cartCard}>
            <div className={styles.cartHeader}>
              <span className={styles.cartHeaderLabel}>Artículos</span>
              {carrito.length > 0 && (
                <span className={styles.cartHeaderCount}>
                  {cantItems} unidad{cantItems !== 1 ? 'es' : ''}
                </span>
              )}
            </div>
            <div className={styles.cartBody}>
              <CartGrid items={carrito} onMas={mas} onMenos={menos} onEliminar={eliminar} />
            </div>
          </div>

        </div>

        {/* ── Panel derecho ── */}
        <div className={styles.rightPanel}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryTop}>
              <div className={styles.summaryLabel}>Total a cobrar</div>
              <div className={styles.summaryTotal}>{formatPrecio(total)}</div>
            </div>

            {carrito.length > 0 && (
              <div className={styles.summaryRows}>
                <div className={styles.summaryRow}>
                  <span>Ítems distintos</span>
                  <span>{carrito.length}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Unidades totales</span>
                  <span>{cantItems}</span>
                </div>
              </div>
            )}

            <div className={styles.summaryActions}>
              <button
                type="button"
                className={styles.btnCobrar}
                onClick={() => setModalOpen(true)}
                disabled={carrito.length === 0 || procesando}
              >
                Cobrar
              </button>
              <p className={styles.hint}>F12 para cobrar rápido</p>
              <button
                type="button"
                className={styles.btnVaciar}
                onClick={() => setCarrito([])}
                disabled={carrito.length === 0 || procesando}
              >
                Vaciar carrito
              </button>
            </div>
          </div>
        </div>

      </div>

      {modalOpen && (
        <PaymentModal
          total={total}
          onConfirm={procesarVenta}
          onCancel={() => setModalOpen(false)}
          procesando={procesando}
        />
      )}
    </div>
  );
}
