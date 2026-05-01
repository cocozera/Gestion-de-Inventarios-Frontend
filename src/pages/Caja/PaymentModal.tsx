import { useState, useEffect } from 'react';
import { MedioPago } from '../../types';

const MEDIOS: MedioPago[] = ['EFECTIVO', 'DEBITO', 'BILLETERA_VIRTUAL'];
const LABELS: Record<MedioPago, string> = {
  EFECTIVO: 'Efectivo',
  DEBITO: 'Débito',
  BILLETERA_VIRTUAL: 'Billetera virtual',
};

interface Props {
  total: number;
  onConfirm: (medioPago: MedioPago) => void;
  onCancel: () => void;
  procesando: boolean;
}

export default function PaymentModal({ total, onConfirm, onCancel, procesando }: Props) {
  const [medio, setMedio] = useState<MedioPago>('EFECTIVO');
  const [montoRecibido, setMontoRecibido] = useState('');
  const [vuelto, setVuelto] = useState(0);

  const isEfectivo = medio === 'EFECTIVO';

  useEffect(() => {
    if (!isEfectivo) return;
    const m = parseFloat(montoRecibido) || 0;
    setVuelto(m >= total ? m - total : 0);
  }, [montoRecibido, total, isEfectivo]);

  const canConfirm = !procesando && (!isEfectivo || (parseFloat(montoRecibido) || 0) >= total);

  const overlay: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.65)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  };

  const card: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '1.75rem',
    minWidth: '340px',
    maxWidth: '90vw',
  };

  return (
    <div style={overlay} onClick={onCancel}>
      <div style={card} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginBottom: '1rem' }}>Confirmar pago</h2>
        <p style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--accent)' }}>
          Total: ${total.toFixed(2)}
        </p>

        <label style={{ display: 'block', marginBottom: '1rem' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Medio de pago</span>
          <select
            value={medio}
            onChange={(e) => setMedio(e.target.value as MedioPago)}
            style={{ display: 'block', width: '100%', marginTop: '0.35rem' }}
          >
            {MEDIOS.map((m) => (
              <option key={m} value={m}>{LABELS[m]}</option>
            ))}
          </select>
        </label>

        {isEfectivo && (
          <>
            <label style={{ display: 'block', marginBottom: '0.75rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Monto recibido</span>
              <input
                type="number"
                step="0.01"
                min={total}
                value={montoRecibido}
                onChange={(e) => setMontoRecibido(e.target.value)}
                placeholder="0.00"
                autoFocus
                style={{ display: 'block', width: '100%', marginTop: '0.35rem' }}
              />
            </label>
            {vuelto > 0 && (
              <p style={{ color: 'var(--success)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.75rem' }}>
                Vuelto: ${vuelto.toFixed(2)}
              </p>
            )}
          </>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={procesando}
            style={{ padding: '0.6rem 1rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)' }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm(medio)}
            disabled={!canConfirm}
            style={{
              flex: 1,
              padding: '0.6rem 1rem',
              background: canConfirm ? 'var(--success)' : 'var(--border)',
              color: '#fff',
              fontWeight: 700,
              cursor: canConfirm ? 'pointer' : 'not-allowed',
            }}
          >
            {procesando ? 'Procesando...' : 'Confirmar pago'}
          </button>
        </div>
      </div>
    </div>
  );
}
