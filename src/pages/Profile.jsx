import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db, storage } from '../config/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  User, 
  Camera, 
  Clock, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Edit2
} from 'lucide-react';

const STATUS_OPTIONS = [
  { id: 'available', label: 'Disponible', color: 'bg-green-500' },
  { id: 'busy', label: 'Ocupado', color: 'bg-red-500' },
  { id: 'meeting', label: 'En reunión', color: 'bg-yellow-500' },
  { id: 'break', label: 'En descanso', color: 'bg-blue-500' },
  { id: 'away', label: 'Ausente', color: 'bg-gray-500' }
];

const Profile = () => {
  const { user, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    status: 'available',
    statusMessage: '',
    schedule: '',
    photoUrl: '',
    newPhoto: null
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileDoc = await getDoc(doc(db, 'teams/default/members', user.uid));
        if (profileDoc.exists()) {
          const data = profileDoc.data();
          setProfileData({
            name: data.name || '',
            email: user.email,
            status: data.status || 'available',
            statusMessage: data.statusMessage || '',
            schedule: data.schedule || '',
            photoUrl: data.photoUrl || '',
            newPhoto: null
          });
        }
      } catch (err) {
        setError('Error al cargar el perfil');
      }
    };

    if (user) {
      loadProfile();
    }
  }, [user]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileData(prev => ({
        ...prev,
        newPhoto: file,
        photoUrl: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let photoUrl = profileData.photoUrl;
      
      // Subir nueva foto si existe
      if (profileData.newPhoto) {
        const photoRef = ref(storage, `users/${user.uid}/profile.jpg`);
        await uploadBytes(photoRef, profileData.newPhoto);
        photoUrl = await getDownloadURL(photoRef);
      }

      // Actualizar documento del miembro
      const memberRef = doc(db, 'teams/default/members', user.uid);
      await updateDoc(memberRef, {
        name: profileData.name,
        status: profileData.status,
        statusMessage: profileData.statusMessage,
        schedule: profileData.schedule,
        photoUrl,
        lastUpdated: new Date().toISOString()
      });

      // Actualizar perfil de autenticación
      await updateUserProfile({
        name: profileData.name,
        photoURL: photoUrl
      });

      setSuccess('Perfil actualizado correctamente');
      setEditMode(false);
    } catch (err) {
      setError('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="relative h-32 bg-primary-600">
            <div className="absolute -bottom-12 left-8">
              <div className="relative">
                <img
                  src={profileData.photoUrl || '/default-avatar.png'}
                  alt="Profile"
                  className="w-24 h-24 rounded-full border-4 border-white object-cover"
                />
                {editMode && (
                  <label className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow-lg cursor-pointer">
                    <Camera className="h-4 w-4 text-gray-500" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="pt-16 pb-8 px-8">
            {/* Mensajes de éxito/error */}
            {error && (
              <div className="mb-4 flex items-center bg-red-50 p-4 rounded-md">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <p className="ml-3 text-sm text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 flex items-center bg-green-50 p-4 rounded-md">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <p className="ml-3 text-sm text-green-700">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información básica */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Información Personal</h3>
                  {!editMode ? (
                    <button
                      type="button"
                      onClick={() => setEditMode(true)}
                      className="flex items-center text-sm text-primary-600 hover:text-primary-700"
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Editar
                    </button>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={e => setProfileData({...profileData, name: e.target.value})}
                      disabled={!editMode}
                      className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      disabled
                      className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              {/* Estado */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Estado</h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Estado Actual
                    </label>
                    <select
                      value={profileData.status}
                      onChange={e => setProfileData({...profileData, status: e.target.value})}
                      disabled={!editMode}
                      className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 disabled:bg-gray-50"
                    >
                      {STATUS_OPTIONS.map(option => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Mensaje de Estado
                    </label>
                    <input
                      type="text"
                      value={profileData.statusMessage}
                      onChange={e => setProfileData({...profileData, statusMessage: e.target.value})}
                      disabled={!editMode}
                      placeholder="¿En qué estás trabajando?"
                      className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Horario
                    </label>
                    <input
                      type="text"
                      value={profileData.schedule}
                      onChange={e => setProfileData({...profileData, schedule: e.target.value})}
                      disabled={!editMode}
                      placeholder="Ej: L-V 9:00-18:00"
                      className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 disabled:bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              {/* Botones */}
              {editMode && (
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    disabled={loading}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;