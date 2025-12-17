// Role-based access control configuration
// These roles should match the custom roles defined in Contentstack

export const ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer',
  GUEST: 'guest',
};

// Permission matrix: what each role can access
export const PERMISSIONS = {
  [ROLES.ADMIN]: {
    documentation: ['read', 'write', 'delete'],
    faq: ['read', 'write', 'delete'],
    feedback: ['read', 'write', 'delete'],
    analytics: true,
  },
  [ROLES.EDITOR]: {
    documentation: ['read', 'write'],
    faq: ['read', 'write'],
    feedback: ['read', 'write'],
    analytics: true,
  },
  [ROLES.VIEWER]: {
    documentation: ['read'],
    faq: ['read'],
    feedback: ['read', 'write'],
    analytics: false,
  },
  [ROLES.GUEST]: {
    documentation: ['read'],
    faq: ['read'],
    feedback: ['write'],
    analytics: false,
  },
};

// Check if user has permission for a specific action
export const hasPermission = (userRole, resource, action) => {
  const rolePermissions = PERMISSIONS[userRole] || PERMISSIONS[ROLES.GUEST];
  const resourcePermissions = rolePermissions[resource] || [];
  
  if (Array.isArray(resourcePermissions)) {
    return resourcePermissions.includes(action);
  }
  return resourcePermissions === true;
};

// Get user role from localStorage or context (to be implemented with auth)
export const getUserRole = () => {
  return localStorage.getItem('userRole') || ROLES.GUEST;
};

// Set user role (for testing/demo purposes)
export const setUserRole = (role) => {
  localStorage.setItem('userRole', role);
};

