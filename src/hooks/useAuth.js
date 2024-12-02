import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  
  return {
    // Datos del usuario y estado
    user: context.user,
    loading: context.loading,
    error: context.error,
    
    // Métodos de autenticación
    signup: context.signup,
    login: context.login,
    logout: context.logout,
    resetPassword: context.resetPassword,
    updateUserProfile: context.updateUserProfile,
    
    // Helper para verificar si el usuario está autenticado
    isAuthenticated: Boolean(context.user),
    
    // Helper para verificar si el usuario es admin de un equipo
    isTeamAdmin: (teamId) => {
      return context.user?.teams?.[teamId]?.role === 'admin';
    },
    
    // Helper para obtener el rol del usuario en un equipo
    getUserTeamRole: (teamId) => {
      return context.user?.teams?.[teamId]?.role;
    }
  };
};