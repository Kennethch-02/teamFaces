import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useStorage } from '../hooks/useStorage';
import { db } from '../config/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const Setup = () => {
  const navigate = useNavigate();
  const { signup, user } = useAuth();
  const { uploadTeamLogo, loading: uploadLoading, error: uploadError } = useStorage();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Redirigir si ya hay un usuario autenticado
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);
  
  // Datos del equipo
  const [teamData, setTeamData] = useState({
    name: '',
    description: '',
    logo: null,
    logoPreview: null
  });

  // Datos del administrador
  const [adminData, setAdminData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'admin'
  });

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setError('Solo se permiten archivos de imagen');
        return;
      }
      
      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        setError('El archivo no debe superar los 5MB');
        return;
      }

      setTeamData({
        ...teamData,
        logo: file,
        logoPreview: URL.createObjectURL(file)
      });
      setError('');
    }
  };

  const validateTeamData = () => {
    if (!teamData.name.trim()) {
      setError('El nombre del equipo es requerido');
      return false;
    }
    if (teamData.name.length < 3) {
      setError('El nombre del equipo debe tener al menos 3 caracteres');
      return false;
    }
    return true;
  };

  const validateAdminData = () => {
    if (!adminData.name.trim() || !adminData.email.trim() || !adminData.password || !adminData.confirmPassword) {
      setError('Todos los campos son requeridos');
      return false;
    }
    if (adminData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (adminData.password !== adminData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    return true;
  };

  const handleTeamSubmit = (e) => {
    e.preventDefault();
    if (validateTeamData()) {
      setError('');
      setStep(2);
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    if (!validateAdminData()) return;

    setError('');
    setLoading(true);

    try {
      // 1. Crear cuenta de administrador
      const userCredential = await signup(adminData.email, adminData.password, adminData);
      
      // 2. Subir logo si existe
      let logoUrl = null;
      if (teamData.logo) {
        try {
          logoUrl = await uploadTeamLogo(teamData.logo);
        } catch (uploadError) {
          console.error('Error al subir logo:', uploadError);
          // Continuar sin logo si falla la subida
        }
      }

      // 3. Crear documento del equipo
      const teamRef = doc(db, 'teams', 'default');
      await setDoc(teamRef, {
        name: teamData.name,
        description: teamData.description || '',
        logoUrl,
        adminId: userCredential.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        settings: {
          allowSelfRegister: false,
          requireApproval: true,
          theme: 'light'
        }
      });

      // 4. Crear documento de miembro admin
      const memberRef = doc(db, 'teams/default/members', userCredential.uid);
      await setDoc(memberRef, {
        name: adminData.name,
        email: adminData.email,
        role: 'admin',
        status: 'available',
        statusMessage: '¡Equipo configurado!',
        photoUrl: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        settings: {
          notifications: true,
          theme: 'light'
        }
      });

      // Redireccionar al dashboard
      navigate('/admin');
    } catch (err) {
      console.error('Error en setup:', err);
      setError(err.message || 'Error al configurar el equipo');
      setLoading(false);
    }
  };

  // Renderizado condicional del error
  const renderError = () => {
    const errorMessage = error || uploadError;
    if (!errorMessage) return null;
    
    return (
      <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
        {errorMessage}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          {step === 1 ? 'Configura tu Equipo' : 'Cuenta de Administrador'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {step === 1 ? 'Información básica del equipo' : 'Datos del administrador principal'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {renderError()}

          {step === 1 ? (
            <form onSubmit={handleTeamSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre del Equipo *
                </label>
                <input
                  type="text"
                  value={teamData.name}
                  onChange={(e) => setTeamData({...teamData, name: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Nombre de tu equipo"
                  required
                  minLength={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <textarea
                  value={teamData.description}
                  onChange={(e) => setTeamData({...teamData, description: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500"
                  rows="3"
                  placeholder="Describe brevemente tu equipo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Logo del Equipo
                </label>
                <div className="mt-1 flex items-center space-x-4">
                  {teamData.logoPreview && (
                    <img
                      src={teamData.logoPreview}
                      alt="Preview"
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Formato: JPG, PNG. Tamaño máximo: 5MB
                </p>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Continuar
              </button>
            </form>
          ) : (
            <form onSubmit={handleAdminSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={adminData.name}
                  onChange={(e) => setAdminData({...adminData, name: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <input
                  type="email"
                  value={adminData.email}
                  onChange={(e) => setAdminData({...adminData, email: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Contraseña *
                </label>
                <input
                  type="password"
                  value={adminData.password}
                  onChange={(e) => setAdminData({...adminData, password: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                  minLength={6}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Mínimo 6 caracteres
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Confirmar Contraseña *
                </label>
                <input
                  type="password"
                  value={adminData.confirmPassword}
                  onChange={(e) => setAdminData({...adminData, confirmPassword: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-primary-600 hover:text-primary-700"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={loading || uploadLoading}
                  className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  {loading || uploadLoading ? 'Configurando...' : 'Finalizar Configuración'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Setup;