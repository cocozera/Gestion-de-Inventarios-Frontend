import type { CarritoItem } from './CartItemRow';
import CartItemRow from './CartItemRow';

interface CartGridProps {
  items: CarritoItem[];
  onMas: (index: number) => void;
  onMenos: (index: number) => void;
  onEliminar: (index: number) => void;
}

export default function CartGrid({ items, onMas, onMenos, onEliminar }: CartGridProps) {
  if (items.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Carrito vacío. Escanee o busque productos.
      </div>
    );
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
          <th style={{ padding: '0.5rem' }}>Cant.</th>
          <th style={{ padding: '0.5rem' }}>Producto</th>
          <th style={{ padding: '0.5rem', textAlign: 'right' }}>P. unit.</th>
          <th style={{ padding: '0.5rem', textAlign: 'right' }}>Subtotal</th>
          <th style={{ padding: '0.5rem' }}></th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <CartItemRow
            key={`${item.producto_id}-${index}`}
            item={item}
            onMas={() => onMas(index)}
            onMenos={() => onMenos(index)}
            onEliminar={() => onEliminar(index)}
          />
        ))}
      </tbody>
    </table>
  );
}
