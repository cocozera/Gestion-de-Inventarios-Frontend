import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export interface Usuario {
  id: number;
  username: string;
  nombre: string | null;
  rol: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  usuario: Usuario;
}

export interface ProductoBusqueda {
  id: number;
  nombre: string;
  precio_venta: number;
}

export interface Producto {
  id: number;
  codigo_barras: string;
  nombre: string;
  categoria_id: number | null;
  precio_costo: number;
  precio_venta: number;
  stock_actual: number;
  stock_minimo: number;
  estado: boolean;
}

export interface VentaItemPayload {
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
}

export interface VentaPayload {
  usuario_id: number;
  medio_pago: string;
  total: number;
  items: VentaItemPayload[];
}

export const authApi = {
  login: (username: string, password: string) =>
    api.post<TokenResponse>('/auth/login', { username, password }),
  me: () => api.get<Usuario>('/auth/me'),
};

export const productosApi = {
  buscarPorCodigo: (codigoBarras: string) =>
    api.get<ProductoBusqueda>(`/productos/${encodeURIComponent(codigoBarras)}`),
  listar: (q?: string) =>
    api.get<Producto[]>('/productos/', { params: { q } }),
  crear: (data: Omit<Producto, 'id' | 'estado'> & { estado?: boolean }) =>
    api.post<Producto>('/productos/', data),
  actualizar: (id: number, data: Partial<Producto>) =>
    api.put<Producto>(`/productos/${id}`, data),
};

export const ventasApi = {
  listar: (params?: { desde?: string; hasta?: string; limit?: number }) =>
    api.get<Array<{ id: number; fecha_hora: string; total: number; medio_pago: string; estado: string }>>('/ventas/', { params }),
  crear: (data: VentaPayload) =>
    api.post<{ mensaje: string; ticket_id: number }>('/ventas/', data),
};

export default api;
