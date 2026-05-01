import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Rol } from '../types';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  roles?: Rol[];
}

export default function ProtectedRoute({ children, roles }: Props) {
  const { usuario, loading } = useAuth();

  if (loading) return null;

  if (!usuario) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(usuario.rol)) {
    if (usuario.rol === 'CAJERO') return <Navigate to="/pos" replace />;
    if (usuario.rol === 'REPOSITOR') return <Navigate to="/productos" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
