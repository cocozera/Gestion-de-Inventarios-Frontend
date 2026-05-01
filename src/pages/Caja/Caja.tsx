import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { productosApi } from '../../api/productos';
import { ventasApi } from '../../api/ventas';
import { ItemCarrito, MedioPago } from '../../types';
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
  const [modalOpen, setModalOpen] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [ticketId, setTicketId] = useState<number | null>(null);

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
  }, []);

  const buscarYAgregar = useCallback(async (valor: string) => {
    setSearchError('');
    try {
      const producto = await productosApi.buscarPorCodigo(valor);
      agregar(producto.id, producto.nombre, producto.precio_venta);
    } catch {
      setSearchError('Producto no encontrado');
    }
  }, [agregar]);

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
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [carrito.length, modalOpen]);

  return (
    <div className={styles.wrapper}>
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

      <ProductSearch onSearch={buscarYAgregar} disabled={procesando} error={searchError} />

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
