// Rename FAMILY_MEMBERS to initialFamilyMembers for clarity
export interface FamilyMember {
  id: string;
  name: string;
  avatar: string;
  color: string;
  role: string;
  userRole: 'admin' | 'member' | 'viewer'; // Permission role
}

export const initialFamilyMembers: FamilyMember[] = [
  {
    id: 'overall',
    name: 'Gesamt',
    avatar: '👨‍👩‍👧‍👦',
    color: 'from-turquoise-500 to-turquoise-400',
    role: 'Gesamtansicht',
    userRole: 'admin'
  },
  {
    id: 'house',
    name: 'Haushalt',
    avatar: '🏠',
    color: 'from-orange-500 to-orange-400',
    role: 'Unser Haushalt',
    userRole: 'admin'
  },
];

// Export as FAMILY_MEMBERS for backward compatibility
export const FAMILY_MEMBERS = initialFamilyMembers;

// Helper function to get member by ID
export const getMemberById = (id: string): FamilyMember | undefined => {
  return FAMILY_MEMBERS.find(member => member.id === id);
};

// Helper function to get member name by ID
export const getMemberNameById = (id: string): string => {
  const member = getMemberById(id);
  return member?.name || '';
};

// Helper function to get all member names for dropdowns
export const getMemberNames = (): string[] => {
  return FAMILY_MEMBERS.filter(member => member.id !== 'overall').map(member => member.name);
};

// Helper function to get member role by ID
export const getMemberRoleById = (id: string): 'admin' | 'member' | 'viewer' => {
  const member = getMemberById(id);
  return member?.userRole || 'viewer';
};