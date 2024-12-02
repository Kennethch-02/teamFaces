import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export const ProtectedRoute = ({
  children,
  requireAuth = true,
  allowedRoles = [],
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Manejar el estado de carga
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Redirigir a login si no está autenticado y la ruta requiere auth
  if (!user && requireAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirigir al dashboard si está autenticado y la ruta no requiere auth
  if (user && !requireAuth) {
    return <Navigate to="/dashboard" replace />;
  }

  // Verificar roles si se especifican
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};
