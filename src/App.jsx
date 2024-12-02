import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

// Lazy loaded pages
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));

// Route configurations
const publicRoutes = [
  { path: '/login', element: Login },
  { path: '/register', element: Register },
  { path: '/unauthorized', element: Unauthorized }
];

const privateRoutes = [
  { path: '/dashboard', element: Dashboard },
  { path: '/profile', element: Profile }
];

function App() {
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public Routes */}
            {publicRoutes.map(({ path, element: Element }) => (
              <Route
                key={path}
                path={path}
                element={
                  path === '/unauthorized' ? (
                    <Element />
                  ) : (
                    <ProtectedRoute requireAuth={false}>
                      <Element />
                    </ProtectedRoute>
                  )
                }
              />
            ))}

            {/* Protected Routes */}
            {privateRoutes.map(({ path, element: Element }) => (
              <Route
                key={path}
                path={path}
                element={
                  <ProtectedRoute>
                    <Element />
                  </ProtectedRoute>
                }
              />
            ))}

            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;