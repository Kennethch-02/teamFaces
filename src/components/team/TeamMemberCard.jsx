import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const TeamMemberCard = ({ member }) => {
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);

  const isCurrentUser = user?.uid === member.id;
  const statusColor = {
    available: 'bg-green-500',
    busy: 'bg-red-500',
    meeting: 'bg-yellow-500',
    away: 'bg-gray-500'
  }[member.status] || 'bg-gray-500';

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-200 hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center mb-4">
          <div className="relative">
            <img
              src={member.photoUrl || '/default-avatar.png'}
              alt={member.name}
              className="h-12 w-12 rounded-full"
            />
            <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ${statusColor} ring-2 ring-white`} />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold">{member.name}</h3>
            <p className="text-sm text-gray-500">{member.role}</p>
          </div>
        </div>

        {/* Estado */}
        <div className="space-y-2">
          <p className="text-gray-700">{member.statusMessage || 'Sin mensaje de estado'}</p>
          {member.schedule && (
            <p className="text-sm text-gray-500">
              {member.schedule}
            </p>
          )}
        </div>

        {/* Acciones */}
        {isCurrentUser && isHovered && (
          <div className="mt-4 flex justify-end">
            <button
              className="text-sm text-primary-600 hover:text-primary-700"
              onClick={() => {/* Lógica para editar */}}
            >
              Editar Estado
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamMemberCard;