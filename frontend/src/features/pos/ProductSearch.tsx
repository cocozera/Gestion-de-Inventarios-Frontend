import { useRef, useEffect } from 'react';

interface ProductSearchProps {
  onSearch: (codigoBarras: string) => void;
  disabled?: boolean;
  error?: string;
}

export default function ProductSearch({ onSearch, disabled, error }: ProductSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = inputRef.current;
    if (!el || disabled) return;
    el.focus();
  }, [disabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = inputRef.current?.value?.trim();
    if (!value || disabled) return;
    onSearch(value);
    inputRef.current!.value = '';
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '0.5rem' }}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Código de barras o búsqueda..."
        disabled={disabled}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        aria-label="Buscar producto"
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '0.75rem 1rem',
          fontSize: '1rem',
        }}
      />
      {error && (
        <p style={{ color: 'var(--danger)', fontSize: '0.9rem', marginTop: '0.35rem' }}>{error}</p>
      )}
    </form>
  );
}
