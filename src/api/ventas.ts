import { api } from './client';
import { VentaRequest, VentaResponse } from '../types';

export interface VentaListItem {
  id: number;
  fecha_hora: string;
  total: number;
  medio_pago: string;
  estado: string;
}

export const ventasApi = {
  procesar: (venta: VentaRequest) => api.post<VentaResponse>('/api/ventas/', venta),
  listar: (desde?: string, hasta?: string) => {
    const params = new URLSearchParams();
    if (desde) params.append('desde', desde);
    if (hasta) params.append('hasta', hasta);
    return api.get<VentaListItem[]>(`/api/ventas/?${params.toString()}`);
  },
};
