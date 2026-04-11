import { useState, useEffect } from 'react';

const MEDIOS_PAGO = ['EFECTIVO', 'DÉBITO', 'CRÉDITO', 'BILLETERA_VIRTUAL', 'TRANSFERENCIA'] as const;

interface PaymentModalProps {
  total: number;
  onConfirm: (medioPago: string, montoRecibido?: number) => void;
  onCancel: () => void;
}

export default function PaymentModal({ total, onConfirm, onCancel }: PaymentModalProps) {
  const [medioPago, setMedioPago] = useState<string>('EFECTIVO');
  const [montoRecibido, setMontoRecibido] = useState('');
  const [vuelto, setVuelto] = useState(0);

  const isEfectivo = medioPago === 'EFECTIVO';

  useEffect(() => {
    if (!isEfectivo) return;
    const m = parseFloat(montoRecibido) || 0;
    setVuelto(m >= total ? m - total : 0);
  }, [montoRecibido, total, isEfectivo]);

  const handleConfirm = () => {
    if (isEfectivo) {
      const m = parseFloat(montoRecibido) || 0;
      if (m < total) return;
      onConfirm(medioPago, m);
    } else {
      onConfirm(medioPago);
    }
  };

  const canConfirm = !isEfectivo || (parseFloat(montoRecibido) || 0) >= total;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '1.5rem',
          minWidth: '320px',
          maxWidth: '90vw',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginBottom: '1rem' }}>Confirmar pago</h2>
        <p style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
          Total: ${total.toFixed(2)}
        </p>
        <label style={{ display: 'block', marginBottom: '0.75rem' }}>
          Medio de pago
          <select
            value={medioPago}
            onChange={(e) => setMedioPago(e.target.value)}
            style={{ display: 'block', width: '100%', marginTop: '0.25rem', padding: '0.5rem' }}
          >
            {MEDIOS_PAGO.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        {isEfectivo && (
          <>
            <label style={{ display: 'block', marginBottom: '0.75rem' }}>
              Monto recibido
              <input
                type="number"
                step="0.01"
                min="0"
                value={montoRecibido}
                onChange={(e) => setMontoRecibido(e.target.value)}
                placeholder="0.00"
                style={{ display: 'block', width: '100%', marginTop: '0.25rem', padding: '0.5rem' }}
              />
            </label>
            {vuelto > 0 && (
              <p style={{ color: 'var(--success)', fontWeight: 600, marginBottom: '1rem' }}>
                Vuelto: ${vuelto.toFixed(2)}
              </p>
            )}
          </>
        )}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '0.5rem 1rem',
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            style={{
              padding: '0.5rem 1rem',
              background: 'var(--success)',
              color: '#fff',
              fontWeight: 600,
            }}
          >
            Confirmar pago
          </button>
        </div>
      </div>
    </div>
  );
}
