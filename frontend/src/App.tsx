import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './store/AuthContext';
import Login from './features/auth/Login';
import POSScreen from './features/pos/POSScreen';
import Dashboard from './features/admin/Dashboard';
import Productos from './features/admin/Productos';
import Ventas from './features/admin/Ventas';
import Layout from './components/Layout';

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { usuario, isLoading } = useAuth();
  if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando...</div>;
  if (!usuario) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(usuario.rol)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/pos" replace />} />
        <Route path="pos" element={<ProtectedRoute roles={['CAJERO', 'ADMIN']}><POSScreen /></ProtectedRoute>} />
        <Route path="dashboard" element={<ProtectedRoute roles={['ADMIN']}><Dashboard /></ProtectedRoute>} />
        <Route path="productos" element={<ProtectedRoute roles={['ADMIN', 'REPOSITOR']}><Productos /></ProtectedRoute>} />
        <Route path="ventas" element={<ProtectedRoute roles={['ADMIN']}><Ventas /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
