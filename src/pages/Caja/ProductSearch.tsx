import { useRef, useEffect, useState } from 'react';
import { Producto } from '../../types';
import { formatPrecio } from '../../utils/format';

interface Props {
  onSearch: (valor: string) => void;
  onSelectProducto: (p: Producto) => void;
  resultados: Producto[];
  disabled?: boolean;
  error?: string;
}

export default function ProductSearch({ onSearch, onSelectProducto, resultados, disabled, error }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [valor, setValor] = useState('');

  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = valor.trim();
    if (!v || disabled) return;
    onSearch(v);
  }

  function seleccionar(p: Producto) {
    onSelectProducto(p);
    setValor('');
    inputRef.current?.focus();
  }

  return (
    <div style={{ marginBottom: '0.75rem', position: 'relative' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          ref={inputRef}
          type="text"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="Código de barras o nombre del producto..."
          disabled={disabled}
          autoComplete="off"
          aria-label="Buscar producto"
          style={{ flex: 1, maxWidth: '420px', padding: '0.75rem 1rem', fontSize: '1rem' }}
        />
        <button
          type="submit"
          disabled={disabled || !valor.trim()}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'var(--accent)',
            color: '#fff',
            fontWeight: 600,
            opacity: disabled || !valor.trim() ? 0.5 : 1,
          }}
        >
          Buscar
        </button>
      </form>

      {error && (
        <p style={{ color: 'var(--danger)', fontSize: '0.9rem', marginTop: '0.4rem' }}>{error}</p>
      )}

      {resultados.length > 1 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          zIndex: 100,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          width: '420px',
          maxHeight: '260px',
          overflowY: 'auto',
          marginTop: '0.25rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        }}>
          {resultados.map((p) => (
            <div
              key={p.id}
              onClick={() => seleccionar(p)}
              style={{
                padding: '0.65rem 1rem',
                cursor: 'pointer',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(192,57,43,0.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{p.nombre}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {p.codigo_barras} · Stock: {p.stock_actual}
                </div>
              </div>
              <div style={{ color: 'var(--accent)', fontWeight: 700 }}>
                {formatPrecio(p.precio_venta)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
