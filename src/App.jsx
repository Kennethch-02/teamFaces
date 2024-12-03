import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

// Páginas públicas
const TeamView = lazy(() => import('./pages/TeamView'));
const Projection = lazy(() => import('./pages/Projection'));
const Setup = lazy(() => import('./pages/Setup'));
const Join = lazy(() => import('./pages/Join'));
const Login = lazy(() => import('./pages/Login'));

// Páginas protegidas
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const Profile = lazy(() => import('./pages/Profile'));

// Configuración de rutas
const publicRoutes = [
  { path: '/', element: TeamView },
  { path: '/projection', element: Projection },
  { path: '/login', element: Login },
  { path: '/join/:code', element: Join }
];

const protectedRoutes = [
  { path: '/setup', element: Setup },
  { path: '/profile', element: Profile },
];

const adminRoutes = [
  { path: '/admin', element: AdminDashboard },
  { path: '/admin/settings', element: AdminSettings },
];

const specialRoutes = [
];

function App() {
  return (
    <Router>
      <AuthProvider>
        <Suspense 
          fallback={
            <div className="flex items-center justify-center min-h-screen">
              <LoadingSpinner />
            </div>
          }
        >
          <Routes>
            {/* Rutas públicas */}
            {publicRoutes.map(({ path, element: Element }) => (
              <Route
                key={path}
                path={path}
                element={
                  <ProtectedRoute requireAuth={false}>
                    <Element />
                  </ProtectedRoute>
                }
              />
            ))}

            {/* Rutas protegidas básicas */}
            {protectedRoutes.map(({ path, element: Element }) => (
              <Route
                key={path}
                path={path}
                element={
                  <ProtectedRoute requireAuth={true}>
                    <Element />
                  </ProtectedRoute>
                }
              />
            ))}

            {/* Rutas admin */}
            {adminRoutes.map(({ path, element: Element }) => (
              <Route
                key={path}
                path={path}
                element={
                  <ProtectedRoute requireAuth={true} allowedRoles={['admin']}>
                    <Element />
                  </ProtectedRoute>
                }
              />
            ))}

            {/* Rutas especiales */}
            {specialRoutes.map(({ path, element: Element }) => (
              <Route
                key={path}
                path={path}
                element={<Element />}
              />
            ))}

            {/* Ruta por defecto */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;