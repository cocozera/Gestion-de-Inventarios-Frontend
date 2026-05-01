import { useRef, useEffect } from 'react';

interface Props {
  onSearch: (valor: string) => void;
  disabled?: boolean;
  error?: string;
}

export default function ProductSearch({ onSearch, disabled, error }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = inputRef.current?.value?.trim();
    if (!value || disabled) return;
    onSearch(value);
    inputRef.current!.value = '';
    inputRef.current?.focus();
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '0.5rem' }}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Código de barras o nombre del producto..."
        disabled={disabled}
        autoComplete="off"
        aria-label="Buscar producto"
        style={{ width: '100%', maxWidth: '420px', padding: '0.75rem 1rem', fontSize: '1rem' }}
      />
      {error && (
        <p style={{ color: 'var(--danger)', fontSize: '0.9rem', marginTop: '0.35rem' }}>{error}</p>
      )}
    </form>
  );
}
