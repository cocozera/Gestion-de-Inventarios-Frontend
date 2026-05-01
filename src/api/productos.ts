import { api } from './client';
import { Producto, ProductoBusqueda } from '../types';

export const productosApi = {
  buscarPorCodigo: (codigo: string) =>
    api.get<ProductoBusqueda>(`/api/productos/${codigo}`),

  listar: (q = '', skip = 0, limit = 50) =>
    api.get<Producto[]>(`/api/productos/?q=${encodeURIComponent(q)}&skip=${skip}&limit=${limit}`),

  crear: (data: Omit<Producto, 'id'>) => api.post<Producto>('/api/productos/', data),

  actualizar: (id: number, data: Partial<Producto>) =>
    api.put<Producto>(`/api/productos/${id}`, data),

  eliminar: (id: number) => api.delete(`/api/productos/${id}`),
};
