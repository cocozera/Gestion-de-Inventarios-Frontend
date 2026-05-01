import { formatPrecio } from '../../utils/format';

interface Props {
  total: number;
  onCobrar: () => void;
  disabled?: boolean;
}

export default function OrderSummary({ total, onCobrar, disabled }: Props) {
  return (
    <div style={{
      padding: '1.25rem',
      background: 'var(--surface)',
      borderRadius: '12px',
      border: '1px solid var(--border)',
      minWidth: '240px',
    }}>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Total</div>
      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent)', marginBottom: '1rem' }}>
        {formatPrecio(total)}
      </div>
      <button
        type="button"
        onClick={onCobrar}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '0.85rem 1rem',
          fontSize: '1rem',
          fontWeight: 700,
          background: disabled ? 'var(--border)' : 'var(--success)',
          color: '#fff',
          cursor: disabled ? 'not-allowed' : 'pointer',
          borderRadius: '8px',
        }}
      >
        Cobrar (F12)
      </button>
    </div>
  );
}
