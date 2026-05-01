import { ItemCarrito } from '../../types';
import { formatPrecio } from '../../utils/format';
import styles from './Caja.module.css';

interface Props {
  items: ItemCarrito[];
  onMas: (index: number) => void;
  onMenos: (index: number) => void;
  onEliminar: (index: number) => void;
}

const qtyBtn: React.CSSProperties = {
  width: '26px',
  height: '26px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: '6px',
  color: 'var(--text)',
  fontSize: '0.9rem',
  lineHeight: '1',
  cursor: 'pointer',
  flexShrink: 0,
};

export default function CartGrid({ items, onMas, onMenos, onEliminar }: Props) {
  if (items.length === 0) {
    return (
      <div className={styles.emptyCart}>
        <span className={styles.emptyCartIcon}>🛒</span>
        <span className={styles.emptyCartText}>El carrito está vacío</span>
        <span style={{ fontSize: '0.8rem' }}>Buscá o escaneá un producto</span>
      </div>
    );
  }

  return (
    <table className={styles.cartTable}>
      <thead>
        <tr>
          <th style={{ width: '42%' }}>Producto</th>
          <th style={{ width: '22%', textAlign: 'center' }}>Cant.</th>
          <th style={{ width: '18%', textAlign: 'right' }}>P. unit.</th>
          <th style={{ width: '18%', textAlign: 'right' }}>Subtotal</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr key={`${item.producto_id}-${index}`}>
            <td>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', lineHeight: 1.3 }}>{item.nombre}</div>
              <button
                type="button"
                onClick={() => onEliminar(index)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--danger)',
                  fontSize: '0.72rem',
                  padding: 0,
                  cursor: 'pointer',
                  marginTop: '0.15rem',
                }}
              >
                Quitar
              </button>
            </td>
            <td style={{ textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <button type="button" onClick={() => onMenos(index)} style={qtyBtn}>−</button>
                  <span style={{ fontWeight: 700, minWidth: '18px', textAlign: 'center', fontSize: '0.9rem' }}>
                    {item.cantidad}
                  </span>
                  <button
                    type="button"
                    onClick={() => onMas(index)}
                    style={{
                      ...qtyBtn,
                      ...(item.cantidad >= item.stock_actual
                        ? { opacity: 0.35, cursor: 'not-allowed' }
                        : {}),
                    }}
                    disabled={item.cantidad >= item.stock_actual}
                    title={item.cantidad >= item.stock_actual ? `Máx. stock: ${item.stock_actual}` : undefined}
                  >
                    +
                  </button>
                </div>
                {item.cantidad >= item.stock_actual && (
                  <span style={{ fontSize: '0.65rem', color: 'var(--warning)', fontWeight: 600, letterSpacing: '0.01em' }}>
                    máx. {item.stock_actual}
                  </span>
                )}
              </div>
            </td>
            <td style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {formatPrecio(item.precio_unitario)}
            </td>
            <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent)', fontSize: '0.9rem' }}>
              {formatPrecio(item.precio_unitario * item.cantidad)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
