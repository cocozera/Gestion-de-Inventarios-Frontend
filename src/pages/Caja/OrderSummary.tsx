interface Props {
  total: number;
  onCobrar: () => void;
  disabled?: boolean;
}

export default function OrderSummary({ total, onCobrar, disabled }: Props) {
  return (
    <div style={{
      marginTop: '1.5rem',
      padding: '1rem',
      background: 'var(--surface)',
      borderRadius: '12px',
      border: '1px solid var(--border)',
      minWidth: '220px',
    }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
        Total: <span style={{ color: 'var(--accent)' }}>${total.toFixed(2)}</span>
      </div>
      <button
        type="button"
        onClick={onCobrar}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          fontSize: '1.1rem',
          fontWeight: 600,
          background: disabled ? 'var(--border)' : 'var(--success)',
          color: '#fff',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        Cobrar (F12)
      </button>
    </div>
  );
}
