interface OrderSummaryProps {
  total: number;
  onCobrar: () => void;
  disabled?: boolean;
}

export default function OrderSummary({ total, onCobrar, disabled }: OrderSummaryProps) {
  return (
    <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--surface)', borderRadius: '12px', maxWidth: '320px' }}>
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
          background: 'var(--success)',
          color: '#fff',
        }}
      >
        Cobrar (F12)
      </button>
    </div>
  );
}
