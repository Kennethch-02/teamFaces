import { useState, useEffect, useCallback } from 'react';
import { db } from '../config/firebase';
import { collection, doc, getDoc, onSnapshot, query } from 'firebase/firestore';

const Projection = () => {
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Actualizar reloj cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } catch (error) {
        console.error('Error al entrar en modo pantalla completa:', error);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (error) {
        console.error('Error al salir del modo pantalla completa:', error);
      }
    }
  }, []);

  // Cargar datos del equipo y suscribirse a actualizaciones
  useEffect(() => {
    const loadTeamData = async () => {
      try {
        // Cargar datos del equipo
        const teamDoc = await getDoc(doc(db, 'teams', 'default'));
        if (!teamDoc.exists()) {
          throw new Error('Equipo no encontrado');
        }
        setTeam(teamDoc.data());

        // Suscribirse a actualizaciones de miembros
        const membersQuery = query(collection(db, 'teams/default/members'));
        const unsubscribe = onSnapshot(membersQuery, (snapshot) => {
          const membersData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setMembers(membersData);
          setLoading(false);
        }, (error) => {
          console.error('Error en tiempo real:', error);
          setError('Error al cargar los miembros del equipo');
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError('Error al cargar la información del equipo');
        setLoading(false);
      }
    };

    loadTeamData();
  }, []);

  // Manejar teclas para fullscreen
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'f' || event.key === 'F') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [toggleFullscreen]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      available: 'bg-green-500',
      busy: 'bg-red-500',
      meeting: 'bg-yellow-500',
      break: 'bg-blue-500',
      away: 'bg-gray-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center bg-black/50 backdrop-blur-sm z-10">
        <div className="flex items-center">
          {team?.logoUrl && (
            <img 
              src={team.logoUrl} 
              alt="Team Logo" 
              className="h-12 w-12 rounded-full mr-4"
            />
          )}
          <h1 className="text-3xl font-bold">{team?.name}</h1>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-2xl font-mono">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <button
            onClick={toggleFullscreen}
            className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            {isFullscreen ? 'Salir de Pantalla Completa (F)' : 'Pantalla Completa (F)'}
          </button>
        </div>
      </div>

      {/* Grid de miembros */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {members.map(member => (
          <div
            key={member.id}
            className="bg-white/5 rounded-lg p-6 backdrop-blur-sm transition-transform duration-300 hover:transform hover:scale-105"
          >
            <div className="flex items-center mb-4">
              <div className="relative">
                <img
                  src={member.photoUrl || '/default-avatar.png'}
                  alt={member.name}
                  className="h-16 w-16 rounded-full object-cover"
                />
                <div 
                  className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full ${getStatusColor(member.status)} ring-2 ring-black`}
                />
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold">{member.name}</h3>
                <p className="text-sm text-gray-400">{member.role}</p>
              </div>
            </div>
            <p className="text-lg mb-2">
              {member.statusMessage || 'Sin mensaje de estado'}
            </p>
            {member.schedule && (
              <p className="text-sm text-gray-400">
                🕒 {member.schedule}
              </p>
            )}
            {member.lastActive && (
              <p className="text-xs text-gray-500 mt-2">
                Última actividad: {new Date(member.lastActive).toLocaleString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projection;