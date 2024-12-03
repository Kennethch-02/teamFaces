import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc,
  onSnapshot
} from 'firebase/firestore';
import TeamMemberCard from '../components/team/TeamMemberCard';
import JoinTeamModal from '../components/team/JoinTeamModal';
import LoadingSpinner from '../components/common/LoadingSpinner';

const TeamView = () => {
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);

  useEffect(() => {
    const checkAndLoadTeam = async () => {
      try {
        // Intentar cargar el equipo principal
        const teamRef = doc(db, 'teams', 'default');
        const teamSnap = await getDoc(teamRef);

        if (!teamSnap.exists()) {
          // No hay equipo configurado, redirigir a setup
          navigate('/setup');
          return;
        }

        setTeam(teamSnap.data());

        // Cargar miembros
        const membersRef = collection(db, 'teams/default/members');
        const membersSnap = await getDocs(membersRef);
        const membersData = membersSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setMembers(membersData);
      } catch (error) {
        console.error('Error loading team data:', error);
        setError('No se pudo cargar la información del equipo');
      } finally {
        setLoading(false);
      }
    };

    checkAndLoadTeam();
  }, [navigate]);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {team?.logoUrl && (
                <img 
                  src={team.logoUrl} 
                  alt="Team Logo" 
                  className="h-12 w-12 rounded-full mr-4"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{team?.name}</h1>
                <p className="text-gray-500">{team?.description}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/projection')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Modo Proyección
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Grid de miembros */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map(member => (
            <TeamMemberCard 
              key={member.id}
              member={member}
            />
          ))}
        </div>
      </main>

      {/* Modal para unirse */}
      <JoinTeamModal 
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
      />
    </div>
  );
};

export default TeamView;