import { useState } from 'react';
import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';

export const useInviteCodes = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Generar un nuevo código de invitación
  const generateCode = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Generar código aleatorio
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Crear documento en Firestore
      await addDoc(collection(db, 'inviteCodes'), {
        code,
        createdAt: serverTimestamp(),
        used: false,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
      });

      return code;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Obtener códigos activos
  const getActiveCodes = async () => {
    setLoading(true);
    setError(null);

    try {
      const q = query(
        collection(db, 'inviteCodes'),
        where('used', '==', false),
        where('expiresAt', '>', new Date())
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateCode,
    getActiveCodes,
    loading,
    error
  };
};