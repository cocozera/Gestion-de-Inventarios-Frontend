/**
 * Cache por versión en sessionStorage.
 * - Cada clave tiene un "version counter" independiente.
 * - Al invalidar una clave, se incrementa su versión → los datos guardados
 *   quedan marcados como obsoletos automáticamente.
 * - Los datos se limpian al cerrar el browser (sessionStorage).
 */

export type CacheKey = 'productos' | 'ventas' | 'dashboard';

function getVersion(key: CacheKey): number {
  return parseInt(sessionStorage.getItem(`cv:${key}`) ?? '0', 10);
}

export const dataCache = {
  /** Devuelve los datos cacheados si son frescos, o null si están obsoletos / no existen. */
  get<T>(key: CacheKey, subkey = ''): T | null {
    try {
      const raw = sessionStorage.getItem(`cd:${key}:${subkey}`);
      if (!raw) return null;
      const { v, d } = JSON.parse(raw) as { v: number; d: T };
      return v === getVersion(key) ? d : null;
    } catch { return null; }
  },

  /** Guarda datos en caché con la versión actual de esa clave. */
  set<T>(key: CacheKey, data: T, subkey = ''): void {
    try {
      sessionStorage.setItem(
        `cd:${key}:${subkey}`,
        JSON.stringify({ v: getVersion(key), d: data }),
      );
    } catch { /* sessionStorage lleno o bloqueado */ }
  },

  /**
   * Invalida una o más claves incrementando su versión.
   * Cualquier dato cacheado con la versión anterior queda obsoleto.
   */
  invalidate(...keys: CacheKey[]): void {
    keys.forEach(key => {
      sessionStorage.setItem(`cv:${key}`, String(getVersion(key) + 1));
    });
  },
};
