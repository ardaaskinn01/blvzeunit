import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    // Minimal loading - sadece küçük bir şey
    return <div style={{ padding: '20px' }}>Yükleniyor...</div>;
  }

  if (!user) {
    // Kullanıcı giriş yapmamış
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    // Admin değil
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}