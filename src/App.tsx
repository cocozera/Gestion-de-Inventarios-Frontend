import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Caja from './pages/Caja/Caja';
import Ventas from './pages/Ventas/Ventas';
import Productos from './pages/Productos/Productos';
import './App.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<AuthGuard />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pos" element={<Caja />} />
            <Route path="/ventas" element={<Ventas />} />
            <Route path="/productos" element={<Productos />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function AuthGuard() {
  return (
    <ProtectedRoute>
      <Layout />
    </ProtectedRoute>
  );
}
