export const USER_ROLES = {
    ADMIN: 'admin',
    MEMBER: 'member',
    VIEWER: 'viewer'
  };
  
  export const USER_PERMISSIONS = {
    [USER_ROLES.ADMIN]: [
      'manage_team',
      'invite_members',
      'remove_members',
      'manage_cards',
      'view_analytics',
      'manage_settings',
      'manage_automation'
    ],
    [USER_ROLES.MEMBER]: [
      'update_status',
      'manage_own_card',
      'view_team',
      'view_analytics'
    ],
    [USER_ROLES.VIEWER]: [
      'view_team'
    ]
  };
  
  export const hasPermission = (userRole, permission) => {
    if (!userRole || !permission) return false;
    return USER_PERMISSIONS[userRole]?.includes(permission) || false;
  };
  
  export const validateTeamRole = (role) => {
    return Object.values(USER_ROLES).includes(role);
  };
  
  export const getDefaultTeamRole = () => USER_ROLES.MEMBER;
  
  // Helpers para verificar permisos específicos
  export const canManageTeam = (role) => hasPermission(role, 'manage_team');
  export const canInviteMembers = (role) => hasPermission(role, 'invite_members');
  export const canManageCards = (role) => hasPermission(role, 'manage_cards');
  export const canViewAnalytics = (role) => hasPermission(role, 'view_analytics');