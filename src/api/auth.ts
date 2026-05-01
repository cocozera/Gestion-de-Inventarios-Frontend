import { api } from './client';
import { LoginResponse } from '../types';

export async function login(username: string, password: string): Promise<LoginResponse> {
  return api.post<LoginResponse>('/api/auth/login', { username, password });
}

export const authApi = {
  me: () => api.get<{ id: number; username: string; nombre: string; rol: string }>('/api/auth/me'),
};
