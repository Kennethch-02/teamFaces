import { useAuth } from '../hooks/useAuth';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Perfil</h1>
        <div className="space-y-4">
          <p><strong>Nombre:</strong> {user?.displayName}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Miembro desde:</strong> {new Date(user?.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;