export interface CarritoItem {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  subtotal: number;
}

interface CartItemRowProps {
  item: CarritoItem;
  onMas: () => void;
  onMenos: () => void;
  onEliminar: () => void;
}

export default function CartItemRow({ item, onMas, onMenos, onEliminar }: CartItemRowProps) {
  return (
    <tr>
      <td>{item.cantidad}</td>
      <td>{item.nombre}</td>
      <td style={{ textAlign: 'right' }}>${item.precio_unitario.toFixed(2)}</td>
      <td style={{ textAlign: 'right', fontWeight: 600 }}>${item.subtotal.toFixed(2)}</td>
      <td>
        <button type="button" onClick={onMenos} aria-label="Menos" style={btnStyle}>−</button>
        <button type="button" onClick={onMas} aria-label="Más" style={btnStyle}>+</button>
        <button type="button" onClick={onEliminar} aria-label="Quitar" style={{ ...btnStyle, color: 'var(--danger)' }}>
          🗑
        </button>
      </td>
    </tr>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '0.25rem 0.5rem',
  marginRight: '0.25rem',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
};
