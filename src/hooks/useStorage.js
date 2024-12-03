import { useState } from 'react';
import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const useStorage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (file, path) => {
    try {
      setLoading(true);
      setError(null);
      setProgress(0);

      // Crear una referencia al archivo
      const storageRef = ref(storage, path);

      // Subir el archivo
      const snapshot = await uploadBytes(storageRef, file);
      setProgress(100);

      // Obtener la URL de descarga
      const downloadURL = await getDownloadURL(snapshot.ref);

      setLoading(false);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading file:', error);
      setError(error.message);
      setLoading(false);
      throw error;
    }
  };

  const uploadTeamLogo = async (file, teamId) => {
    const extension = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${extension}`;
    const path = `teams/logos/${fileName}`;
    return uploadFile(file, path);
  };

  const uploadUserAvatar = async (file, userId) => {
    const extension = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${extension}`;
    const path = `users/${userId}/avatar/${fileName}`;
    return uploadFile(file, path);
  };

  return {
    uploadFile,
    uploadTeamLogo,
    uploadUserAvatar,
    loading,
    error,
    progress
  };
};