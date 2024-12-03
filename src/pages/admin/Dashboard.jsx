import { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import AdminLayout from '../../components/layout/AdminLayout';
import { 
  Users, 
  UserPlus, 
  AlertCircle,
  Activity 
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </div>
    </div>
  </div>
);

const RecentActivityItem = ({ activity }) => (
  <div className="flex items-center py-3">
    <div className={`p-2 rounded-full ${
      activity.type === 'join' ? 'bg-green-100' : 
      activity.type === 'status' ? 'bg-blue-100' : 
      'bg-gray-100'
    }`}>
      <Activity className={`w-4 h-4 ${
        activity.type === 'join' ? 'text-green-600' : 
        activity.type === 'status' ? 'text-blue-600' : 
        'text-gray-600'
      }`} />
    </div>
    <div className="ml-3">
      <p className="text-sm font-medium">{activity.description}</p>
      <p className="text-xs text-gray-500">
        {new Date(activity.timestamp).toLocaleString()}
      </p>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeToday: 0,
    pendingInvites: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Obtener estadísticas
        const membersRef = collection(db, 'teams/default/members');
        const membersSnap = await getDocs(membersRef);
        const totalMembers = membersSnap.size;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const activeQuery = query(
          membersRef,
          where('lastActive', '>=', today)
        );
        const activeSnap = await getDocs(activeQuery);
        const activeToday = activeSnap.size;

        const invitesQuery = query(
          collection(db, 'inviteCodes'),
          where('used', '==', false),
          where('expiresAt', '>', new Date())
        );
        const invitesSnap = await getDocs(invitesQuery);
        const pendingInvites = invitesSnap.size;

        setStats({
          totalMembers,
          activeToday,
          pendingInvites
        });

        // Obtener actividad reciente
        const activityQuery = query(
          collection(db, 'activityLogs'),
          orderBy('timestamp', 'desc'),
          limit(5)
        );
        const activitySnap = await getDocs(activityQuery);
        const activities = activitySnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setRecentActivity(activities);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Panel de Control</h1>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Miembros"
            value={stats.totalMembers}
            icon={Users}
            color="bg-blue-500"
          />
          <StatCard
            title="Activos Hoy"
            value={stats.activeToday}
            icon={Activity}
            color="bg-green-500"
          />
          <StatCard
            title="Invitaciones Pendientes"
            value={stats.pendingInvites}
            icon={UserPlus}
            color="bg-purple-500"
          />
        </div>

        {/* Actividad Reciente */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium">Actividad Reciente</h2>
          </div>
          <div className="p-6">
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <RecentActivityItem 
                    key={activity.id} 
                    activity={activity} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                <p>No hay actividad reciente</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;