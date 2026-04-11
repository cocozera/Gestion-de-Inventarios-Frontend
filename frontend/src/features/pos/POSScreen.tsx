import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../store/AuthContext';
import { productosApi, ventasApi } from '../../services/api';
import type { CarritoItem } from './CartItemRow';
import ProductSearch from './ProductSearch';
import CartGrid from './CartGrid';
import OrderSummary from './OrderSummary';
import PaymentModal from './PaymentModal';
import styles from './POSScreen.module.css';

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export default function POSScreen() {
  const { usuario } = useAuth();
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const [searchError, setSearchError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [procesando, setProcesando] = useState(false);

  const total = carrito.reduce((acc, it) => acc + it.subtotal, 0);

  const agregarAlCarrito = useCallback((id: number, nombre: string, precio_venta: number, cantidad = 1) => {
    setCarrito((prev) => {
      const idx = prev.findIndex((p) => p.producto_id === id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx].cantidad += cantidad;
        next[idx].subtotal = round2(next[idx].cantidad * next[idx].precio_unitario);
        return next;
      }
      return [
        ...prev,
        {
          producto_id: id,
          nombre,
          precio_unitario: precio_venta,
          cantidad,
          subtotal: round2(precio_venta * cantidad),
        },
      ];
    });
    setSearchError('');
  }, []);

  const buscarYAgregar = useCallback(
    async (codigoBarras: string) => {
      setSearchError('');
      try {
        const { data } = await productosApi.buscarPorCodigo(codigoBarras);
        agregarAlCarrito(data.id, data.nombre, data.precio_venta);
      } catch {
        setSearchError('Producto no encontrado o inactivo');
      }
    },
    [agregarAlCarrito]
  );

  const mas = (index: number) => {
    setCarrito((prev) => {
      const next = [...prev];
      next[index].cantidad += 1;
      next[index].subtotal = round2(next[index].cantidad * next[index].precio_unitario);
      return next;
    });
  };

  const menos = (index: number) => {
    setCarrito((prev) => {
      const next = [...prev];
      if (next[index].cantidad <= 1) {
        next.splice(index, 1);
        return next;
      }
      next[index].cantidad -= 1;
      next[index].subtotal = round2(next[index].cantidad * next[index].precio_unitario);
      return next;
    });
  };

  const eliminar = (index: number) => {
    setCarrito((prev) => prev.filter((_, i) => i !== index));
  };

  const abrirModal = () => {
    if (carrito.length === 0) return;
    setModalOpen(true);
  };

  const procesarVenta = async (medioPago: string) => {
    if (!usuario) return;
    setProcesando(true);
    try {
      await ventasApi.crear({
        usuario_id: usuario.id,
        medio_pago: medioPago,
        total: round2(total),
        items: carrito.map((it) => ({
          producto_id: it.producto_id,
          cantidad: it.cantidad,
          precio_unitario: it.precio_unitario,
        })),
      });
      setCarrito([]);
      setModalOpen(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Error al procesar la venta';
      alert(msg);
    } finally {
      setProcesando(false);
    }
  };

  const handleConfirmPago = (medioPago: string, montoRecibido?: number) => {
    procesarVenta(medioPago);
  };

  useEffect(() => {
    const handleF12 = (e: KeyboardEvent) => {
      if (e.key === 'F12') {
        e.preventDefault();
        if (carrito.length > 0 && !modalOpen) abrirModal();
      }
    };
    window.addEventListener('keydown', handleF12);
    return () => window.removeEventListener('keydown', handleF12);
  }, [carrito.length, modalOpen]);

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <h1>Punto de Venta</h1>
        <p className={styles.cajero}>
          Cajero: <strong>{usuario?.nombre || usuario?.username}</strong>
        </p>
        <p className={styles.fecha}>
          {new Date().toLocaleDateString('es-AR', { dateStyle: 'medium' })} —{' '}
          {new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </header>

      <ProductSearch
        onSearch={buscarYAgregar}
        disabled={procesando}
        error={searchError}
      />

      <div className={styles.cartSection}>
        <CartGrid items={carrito} onMas={mas} onMenos={menos} onEliminar={eliminar} />
        <OrderSummary total={total} onCobrar={abrirModal} disabled={carrito.length === 0 || procesando} />
      </div>

      {modalOpen && (
        <PaymentModal
          total={total}
          onConfirm={handleConfirmPago}
          onCancel={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
