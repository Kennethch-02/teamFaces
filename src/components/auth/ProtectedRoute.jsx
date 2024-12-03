import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useEffect, useState } from "react";

export const ProtectedRoute = ({
  children,
  requireAuth = true,
  allowedRoles = [],
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [redirectPath, setRedirectPath] = useState("");

  useEffect(() => {
    if (!loading) {
      // Caso 1: Requiere auth pero no hay usuario
      if (!user && requireAuth) {
        setRedirectPath("/login");
        setShouldRedirect(true);
        return;
      }

      // Caso 2: Usuario autenticado en ruta que no requiere auth
      if (user && !requireAuth) {
        setRedirectPath("/dashboard");
        setShouldRedirect(true);
        return;
      }

      // Caso 3: Verificación de roles
      if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        setRedirectPath("/unauthorized");
        setShouldRedirect(true);
        return;
      }

      setShouldRedirect(false);
    }
  }, [user, loading, requireAuth, allowedRoles]);

  // Mostrar loading spinner mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Renderizar children si todas las verificaciones pasan
  return children;
};