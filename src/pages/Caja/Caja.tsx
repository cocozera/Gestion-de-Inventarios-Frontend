import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { productosApi } from '../../api/productos';
import { ventasApi } from '../../api/ventas';
import { ItemCarrito, MedioPago, Producto } from '../../types';
import ProductSearch from './ProductSearch';
import CartGrid from './CartGrid';
import OrderSummary from './OrderSummary';
import PaymentModal from './PaymentModal';
import styles from './Caja.module.css';

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export default function Caja() {
  const { usuario } = useAuth();
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [searchError, setSearchError] = useState('');
  const [resultados, setResultados] = useState<Producto[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [ticketId, setTicketId] = useState<number | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const total = round2(carrito.reduce((acc, it) => acc + it.precio_unitario * it.cantidad, 0));

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
    setResultados([]);
  }, []);

  const buscarYAgregar = useCallback(async (valor: string) => {
    setSearchError('');
    setResultados([]);

    // 1. Intentar por código de barras exacto
    try {
      const producto = await productosApi.buscarPorCodigo(valor);
      agregar(producto.id, producto.nombre, producto.precio_venta);
      return;
    } catch {
      // no encontrado por código, buscar por nombre
    }

    // 2. Buscar por nombre
    try {
      const lista = await productosApi.listar(valor);
      const activos = lista.filter((p) => p.estado);
      if (activos.length === 0) {
        setSearchError('Producto no encontrado');
      } else if (activos.length === 1) {
        agregar(activos[0].id, activos[0].nombre, activos[0].precio_venta);
      } else {
        setResultados(activos);
      }
    } catch {
      setSearchError('Error al buscar producto');
    }
  }, [agregar]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setResultados([]);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

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
        setResultados([]);
        setModalOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [carrito.length, modalOpen]);

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <header className={styles.header}>
        <h1>Punto de Venta</h1>
        <p className={styles.meta}>
          Cajero: <strong>{usuario?.nombre || usuario?.username}</strong>
          {' · '}
          {new Date().toLocaleDateString('es-AR', { dateStyle: 'medium' })}
          {' — '}
          {new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </header>

      {ticketId && (
        <div className={styles.ticketBanner} onClick={() => setTicketId(null)}>
          ✅ Venta procesada — Ticket #{ticketId}. Click para cerrar.
        </div>
      )}

      <ProductSearch
        onSearch={buscarYAgregar}
        onSelectProducto={(p) => agregar(p.id, p.nombre, p.precio_venta)}
        resultados={resultados}
        disabled={procesando}
        error={searchError}
      />

      <div className={styles.cartSection}>
        <CartGrid items={carrito} onMas={mas} onMenos={menos} onEliminar={eliminar} />
        <OrderSummary total={total} onCobrar={() => setModalOpen(true)} disabled={carrito.length === 0 || procesando} />
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
