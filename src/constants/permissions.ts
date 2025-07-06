import { UserRole, Permission, RolePermissions } from '../types';

/**
 * Permission definitions for the application
 * Defines what actions each role can perform on different resources
 */

// Define all available permissions
export const PERMISSIONS = {
  // Transaction permissions
  TRANSACTIONS_CREATE: { resource: 'transactions', action: 'create' } as Permission,
  TRANSACTIONS_READ: { resource: 'transactions', action: 'read' } as Permission,
  TRANSACTIONS_UPDATE: { resource: 'transactions', action: 'update' } as Permission,
  TRANSACTIONS_DELETE: { resource: 'transactions', action: 'delete' } as Permission,
  
  // Budget permissions
  BUDGETS_CREATE: { resource: 'budgets', action: 'create' } as Permission,
  BUDGETS_READ: { resource: 'budgets', action: 'read' } as Permission,
  BUDGETS_UPDATE: { resource: 'budgets', action: 'update' } as Permission,
  BUDGETS_DELETE: { resource: 'budgets', action: 'delete' } as Permission,
  
  // Project permissions
  PROJECTS_CREATE: { resource: 'projects', action: 'create' } as Permission,
  PROJECTS_READ: { resource: 'projects', action: 'read' } as Permission,
  PROJECTS_UPDATE: { resource: 'projects', action: 'update' } as Permission,
  PROJECTS_DELETE: { resource: 'projects', action: 'delete' } as Permission,
  
  // Family management permissions
  FAMILY_MANAGE: { resource: 'family', action: 'manage' } as Permission,
  FAMILY_READ: { resource: 'family', action: 'read' } as Permission,
  
  // Settings permissions
  SETTINGS_MANAGE: { resource: 'settings', action: 'manage' } as Permission,
  SETTINGS_READ: { resource: 'settings', action: 'read' } as Permission,
} as const;

// Role-based permission mappings
export const ROLE_PERMISSIONS: RolePermissions[] = [
  {
    role: 'admin',
    permissions: [
      // Admins have full access to everything
      PERMISSIONS.TRANSACTIONS_CREATE,
      PERMISSIONS.TRANSACTIONS_READ,
      PERMISSIONS.TRANSACTIONS_UPDATE,
      PERMISSIONS.TRANSACTIONS_DELETE,
      PERMISSIONS.BUDGETS_CREATE,
      PERMISSIONS.BUDGETS_READ,
      PERMISSIONS.BUDGETS_UPDATE,
      PERMISSIONS.BUDGETS_DELETE,
      PERMISSIONS.PROJECTS_CREATE,
      PERMISSIONS.PROJECTS_READ,
      PERMISSIONS.PROJECTS_UPDATE,
      PERMISSIONS.PROJECTS_DELETE,
      PERMISSIONS.FAMILY_MANAGE,
      PERMISSIONS.FAMILY_READ,
      PERMISSIONS.SETTINGS_MANAGE,
      PERMISSIONS.SETTINGS_READ,
    ]
  },
  {
    role: 'member',
    permissions: [
      // Members can view everything but only modify their own items
      PERMISSIONS.TRANSACTIONS_CREATE,
      PERMISSIONS.TRANSACTIONS_READ,
      PERMISSIONS.TRANSACTIONS_UPDATE, // Limited to own transactions
      PERMISSIONS.BUDGETS_READ,
      PERMISSIONS.BUDGETS_UPDATE, // Limited to own budgets
      PERMISSIONS.PROJECTS_READ,
      PERMISSIONS.PROJECTS_UPDATE, // Limited to contributing to projects
      PERMISSIONS.FAMILY_READ,
      PERMISSIONS.SETTINGS_READ,
    ]
  },
  {
    role: 'viewer',
    permissions: [
      // Viewers can only read data
      PERMISSIONS.TRANSACTIONS_READ,
      PERMISSIONS.BUDGETS_READ,
      PERMISSIONS.PROJECTS_READ,
      PERMISSIONS.FAMILY_READ,
      PERMISSIONS.SETTINGS_READ,
    ]
  }
];

// Helper function to get permissions for a role
export const getPermissionsForRole = (role: UserRole): Permission[] => {
  const rolePermissions = ROLE_PERMISSIONS.find(rp => rp.role === role);
  return rolePermissions?.permissions || [];
};

// Helper function to check if a role has a specific permission
export const hasPermission = (role: UserRole, resource: Permission['resource'], action: Permission['action']): boolean => {
  const permissions = getPermissionsForRole(role);
  return permissions.some(p => p.resource === resource && p.action === action);
};

// Role display names and descriptions
export const ROLE_DISPLAY_INFO = {
  admin: {
    name: 'Administrator',
    description: 'Vollzugriff auf alle Funktionen und Einstellungen',
    color: 'text-red-400',
    badge: 'bg-red-500/20 text-red-400'
  },
  member: {
    name: 'Mitglied',
    description: 'Kann eigene Daten verwalten und Familienfinanzen einsehen',
    color: 'text-blue-400',
    badge: 'bg-blue-500/20 text-blue-400'
  },
  viewer: {
    name: 'Betrachter',
    description: 'Kann nur Daten einsehen, keine Änderungen vornehmen',
    color: 'text-gray-400',
    badge: 'bg-gray-500/20 text-gray-400'
  }
} as const;