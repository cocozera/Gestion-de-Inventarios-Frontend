import { ItemCarrito } from '../../types';

interface Props {
  items: ItemCarrito[];
  onMas: (index: number) => void;
  onMenos: (index: number) => void;
  onEliminar: (index: number) => void;
}

const btn: React.CSSProperties = {
  padding: '0.25rem 0.5rem',
  marginRight: '0.25rem',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
};

export default function CartGrid({ items, onMas, onMenos, onEliminar }: Props) {
  if (items.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Carrito vacío. Escanee o busque un producto.
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
          <tr key={`${item.producto_id}-${index}`} style={{ borderBottom: '1px solid var(--border)' }}>
            <td style={{ padding: '0.5rem' }}>{item.cantidad}</td>
            <td style={{ padding: '0.5rem' }}>{item.nombre}</td>
            <td style={{ padding: '0.5rem', textAlign: 'right' }}>
              ${item.precio_unitario.toFixed(2)}
            </td>
            <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 600 }}>
              ${(item.precio_unitario * item.cantidad).toFixed(2)}
            </td>
            <td style={{ padding: '0.5rem' }}>
              <button type="button" onClick={() => onMenos(index)} style={btn}>−</button>
              <button type="button" onClick={() => onMas(index)} style={btn}>+</button>
              <button type="button" onClick={() => onEliminar(index)} style={{ ...btn, color: 'var(--danger)' }}>🗑</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
