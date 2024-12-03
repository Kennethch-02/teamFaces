import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { db } from '../config/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const Join = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [teamData, setTeamData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Verificar código y cargar datos del equipo
  useEffect(() => {
    const verifyInviteCode = async () => {
      try {
        const inviteRef = doc(db, 'inviteCodes', code);
        const inviteSnap = await getDoc(inviteRef);

        if (!inviteSnap.exists()) {
          throw new Error('Código de invitación inválido');
        }

        const teamRef = doc(db, 'teams', 'default');
        const teamSnap = await getDoc(teamRef);

        if (!teamSnap.exists()) {
          throw new Error('Equipo no encontrado');
        }

        setTeamData({
          id: teamSnap.id,
          ...teamSnap.data()
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    verifyInviteCode();
  }, [code]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      setLoading(true);

      // 1. Crear cuenta de usuario
      const userCredential = await signup(formData.email, formData.password, {
        displayName: formData.name,
        role: 'member'
      });

      // 2. Crear documento de miembro
      await setDoc(doc(db, 'teams/default/members', userCredential.user.uid), {
        name: formData.name,
        email: formData.email,
        role: 'member',
        status: 'available',
        statusMessage: '¡Me uní al equipo!',
        photoUrl: null,
        createdAt: serverTimestamp()
      });

      // 3. Invalidar código de invitación
      await setDoc(doc(db, 'inviteCodes', code), {
        used: true,
        usedBy: userCredential.user.uid,
        usedAt: serverTimestamp()
      }, { merge: true });

      // Redireccionar al perfil
      navigate('/profile');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 text-primary-600 hover:text-primary-700"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {teamData?.logoUrl && (
          <img
            src={teamData.logoUrl}
            alt="Team Logo"
            className="mx-auto h-16 w-16 rounded-full"
          />
        )}
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Únete a {teamData?.name}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Crea tu cuenta para formar parte del equipo
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nombre Completo
              </label>
              <input
                type="text"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                type="password"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirmar Contraseña
              </label>
              <input
                type="password"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {loading ? 'Procesando...' : 'Crear Cuenta'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Join;