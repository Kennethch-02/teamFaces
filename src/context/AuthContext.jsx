import { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  db 
} from '../config/firebase';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc,
  updateDoc
} from 'firebase/firestore';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Limpiar error después de 5 segundos
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Observer para cambios en el estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Obtener datos adicionales del usuario desde Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        setUser({
          ...user,
          ...userDoc.data()
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Registro de usuario
  const signup = async (email, password, userData) => {
    try {
      setError(null);
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Actualizar perfil con name si se proporciona
      if (userData.name) {
        await updateProfile(user, {
          name: userData.name
        });
      }
      
      // Crear documento de usuario en Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        name: userData.name || '',
        photoURL: userData.photoURL || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Inicio de sesión
  const login = async (email, password) => {
    try {
      setError(null);
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Cerrar sesión
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Restablecer contraseña
  const resetPassword = async (email) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Actualizar perfil de usuario
  const updateUserProfile = async (data) => {
    try {
      setError(null);
      const user = auth.currentUser;

      // Actualizar Auth Profile
      if (data.name || data.photoURL) {
        await updateProfile(user, {
          name: data.name,
          photoURL: data.photoURL
        });
      }

      // Actualizar email si se proporciona
      if (data.email && data.email !== user.email) {
        await updateEmail(user, data.email);
      }

      // Actualizar contraseña si se proporciona
      if (data.password) {
        await updatePassword(user, data.password);
      }

      // Actualizar documento en Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });

      // Actualizar estado local
      const updatedDoc = await getDoc(userRef);
      setUser({
        ...user,
        ...updatedDoc.data()
      });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    signup,
    login,
    logout,
    resetPassword,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Export del contexto para el hook personalizado
export { AuthContext };