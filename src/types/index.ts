export type Rol = 'ADMIN' | 'CAJERO' | 'REPOSITOR';

export interface Usuario {
  id: number;
  username: string;
  nombre: string;
  rol: Rol;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  usuario: Usuario;
}

export interface Producto {
  id: number;
  codigo_barras: string;
  nombre: string;
  categoria_id: number;
  precio_costo: number;
  precio_venta: number;
  stock_actual: number;
  stock_minimo: number;
  estado: boolean;
}

export interface ProductoBusqueda {
  id: number;
  nombre: string;
  precio_venta: number;
}

export interface ItemCarrito {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
}

export type MedioPago = 'EFECTIVO' | 'DEBITO' | 'BILLETERA_VIRTUAL';

export interface VentaRequest {
  usuario_id: number;
  medio_pago: MedioPago;
  total: number;
  items: { producto_id: number; cantidad: number; precio_unitario: number }[];
}

export interface VentaResponse {
  mensaje: string;
  ticket_id: number;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
}
