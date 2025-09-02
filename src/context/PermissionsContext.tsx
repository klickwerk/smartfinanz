import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole, Permission } from '../types';
import { initialFamilyMembers, FamilyMember } from '../constants/familyMembers';
import { getPermissionsForRole, hasPermission } from '../constants/permissions';
import { getColorForMember, getInitials, getNameFromEmail } from '../utils/memberUtils';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabaseClient';
import { familyService, CreateFamilyResult } from '../services/FamilyService';

interface PermissionsContextType {
  currentUser: {
    id: string;
    name: string;
    role: UserRole;
    email?: string;
    avatar?: string;
  };
  familyMembersData: FamilyMember[];
  userFamilyId: string | null;
  setCurrentUser: (userId: string) => void;
  updateMemberRole: (memberId: string, newRole: UserRole) => void;
  updateUserName: (userId: string, newName: string) => void;
  removeFamilyMember: (memberId: string, familyId: string) => Promise<boolean>;
  inviteFamilyMemberByEmail: (email: string, role: UserRole, name?: string) => Promise<{success: boolean; error?: string}>;
  createFamily: (familyName: string) => Promise<CreateFamilyResult>;
  getMemberById: (id: string) => FamilyMember | undefined;
  hasPermission: (resource: Permission['resource'], action: Permission['action']) => boolean;
  canEdit: (itemCreatedBy?: string, itemAssignedTo?: string) => boolean;
  canDelete: (itemCreatedBy?: string, itemAssignedTo?: string) => boolean;
  isAdmin: boolean;
  isMember: boolean;
  isViewer: boolean;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

interface PermissionsProviderProps {
  children: ReactNode;
}

export const PermissionsProvider: React.FC<PermissionsProviderProps> = ({ children }) => {
  const { user } = useAuth();
  
  // State for family members data
  const [familyMembersData, setFamilyMembersData] = useState<FamilyMember[]>(() => {
    try {
      const savedMembers = localStorage.getItem('finanzapp-family-members');
      if (savedMembers) {
        return JSON.parse(savedMembers);
      }
      return initialFamilyMembers;
    } catch (error) {
      console.warn('Failed to parse saved family members from localStorage:', error);
      return initialFamilyMembers;
    }
  });

  // State for user's family ID
  const [userFamilyId, setUserFamilyId] = useState<string | null>(null);

  // State for loading status
  const [isLoading, setIsLoading] = useState(true);

  // Function to re-fetch family data after changes
  const refetchFamilyData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Re-run the family data fetching logic
      await fetchFamilyDataInternal();
    } catch (error) {
      console.error('Error refetching family data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save family members data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('finanzapp-family-members', JSON.stringify(familyMembersData));
  }, [familyMembersData]);

  // Fetch real family members data when user changes
  useEffect(() => {
    const fetchFamilyDataInternal = async () => {
      if (!user || isLoading) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // First, get the user's profile to get their name
        const { data: profileData, error: profileError } = await supabase
          .from('profiles') 
          .select('id, user_id, full_name, avatar_url')
          .eq('user_id', user.id) 
          .single(); 

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching user profile:', profileError);
        }

        // Then, get the user's family memberships
        const { data: membershipData, error: membershipError } = await supabase
          .from('family_members') 
          .select('id, family_id, user_id, role')
          .eq('user_id', user.id); 

        if (membershipError) {
          console.error('Error fetching family memberships:', membershipError);
          setIsLoading(false);
          return;
        }

        // If user has family memberships, get all members of those families
        if (membershipData && membershipData.length > 0) {
          // Get the first family ID
          const familyId = membershipData[0].family_id;
          
          // Store the user's family ID
          setUserFamilyId(familyId);
          
          // Get family details separately
          const { data: familyData, error: familyError } = await supabase
            .from('families')
            .select('id, name, created_by')
            .eq('id', familyId)
            .single();
            
          if (familyError) {
            console.error('Error fetching family details:', familyError);
          }
          
          // Get all members of the family
          const { data: familyMembersData, error: familyMembersError } = await supabase
            .from('family_members') 
            .select('id, family_id, user_id, role')
            .eq('family_id', familyId); 

          if (familyMembersError) {
            console.error('Error fetching family members:', familyMembersError);
            setIsLoading(false);
            return;
          }

          // Get profiles for all family members separately
          let memberProfiles: any[] = [];
          if (familyMembersData && familyMembersData.length > 0) {
            const memberIds = familyMembersData.map(m => m.user_id);
            const { data: profilesData, error: profilesError } = await supabase
              .from('profiles')
              .select('id, user_id, full_name, avatar_url')
              .in('user_id', memberIds);
              
            if (profilesError) {
              console.error('Error fetching member profiles:', profilesError);
            } else {
              memberProfiles = profilesData || [];
            }
          }

          // Transform the data to match our FamilyMember type
          if (familyMembersData && familyMembersData.length > 0) {
            // Start with the default system entries (overall, house)
            const systemEntries = initialFamilyMembers.filter(
              member => member.id === 'overall' || member.id === 'house'
            );
            
            // Map the real family members
            const realFamilyMembers = familyMembersData.map((member, index) => {
              // Find the profile for this member
              const profile = memberProfiles.find(p => p.user_id === member.user_id);
              const name = profile?.full_name || `Mitglied ${index + 1}`;
              const initials = name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);

              // Determine if this is the current user
              const isCurrentUser = member.user_id === user.id;

              return {
                id: member.user_id,
                name: name,
                avatar: profile?.avatar_url || initials,
                color: getColorForMember(index), // Now using the imported utility function
                role: isCurrentUser ? 'Du' : 'Familienmitglied',
                userRole: (member.role || 'member') as UserRole
              } as FamilyMember;
            });
            
            // Combine system entries with real family members
            setFamilyMembersData([...systemEntries, ...realFamilyMembers]);
          }
        } else {
          // No family memberships found
          setUserFamilyId(null);
          
          // Just include the current user and system entries
          const systemEntries = initialFamilyMembers.filter(
            member => member.id === 'overall' || member.id === 'house'
          );
          
          const currentUserMember = {
            id: user.id,
            name: profileData?.full_name || user.email?.split('@')[0] || 'User',
            avatar: profileData?.avatar_url || getInitials(profileData?.full_name || user.email || 'User'),
            color: getColorForMember(0),
            role: 'Du',
            userRole: 'admin' as UserRole
          };
          
          setFamilyMembersData([...systemEntries, currentUserMember]);
        }
      } catch (error) {
        console.error('Error fetching family data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFamilyDataInternal();
  }, [user]);

  // Create family function
  const createFamily = async (familyName: string): Promise<CreateFamilyResult> => {
    if (!user) {
      return { success: false, error: 'Sie müssen angemeldet sein, um eine Familie zu erstellen.' };
    }

    try {
      const result = await familyService.createFamily(familyName, user.id);
      
      if (result.success) {
        // Refresh family data to reflect the new family
        await refetchFamilyData();
      }
      
      return result;
    } catch (error: any) {
      console.error('Error in createFamily:', error);
      return { success: false, error: error.message || 'Ein unbekannter Fehler ist aufgetreten.' };
    }
  };

  // Helper function to get member by ID from current data
  const getMemberById = (id: string): FamilyMember | undefined => {
    return familyMembersData.find(member => member.id === id);
  };

  // Get current user info based on authenticated Supabase user
  const currentUser = React.useMemo(() => {
    if (!user) {
      // Fallback when no user is authenticated (anonymous)
      return {
        id: 'anonymous',
        name: 'Anonymous',
        role: 'viewer' as UserRole,
        email: undefined,
        avatar: 'A'
      };
    }

    // Find the user in familyMembersData if they exist there
    const userMember = familyMembersData.find(member => member.id === user.id);
    if (userMember) {
      return {
        id: user.id,
        name: userMember.name,
        role: userMember.userRole,
        email: user.email,
        avatar: userMember.avatar
      };
    }

    // Otherwise use the authenticated user's data
    const userName = user.user_metadata?.full_name || user.email || 'User';
    return {
      id: user.id,
      name: userName,
      role: 'admin' as UserRole, // For now, all authenticated users are admins
      email: user.email,
      avatar: getInitials(userName)
    };
  }, [user, familyMembersData]);

  const setCurrentUser = (userId: string) => {
    // This function is kept for compatibility but doesn't change the authenticated user
    console.log('setCurrentUser called with:', userId);
  };

  // Function to update member role
  const updateMemberRole = (memberId: string, newRole: UserRole) => {
    setFamilyMembersData(prevMembers => 
      prevMembers.map(member => 
        member.id === memberId 
          ? { ...member, userRole: newRole }
          : member
      )
    );
  };

  // Function to update user name
  const updateUserName = (userId: string, newName: string) => {
    // Update the name in the local state
    setFamilyMembersData(prevMembers => {
      const updatedMembers = prevMembers.map(member => 
        member.id === userId 
          ? { ...member, name: newName }
          : member
      );
      return updatedMembers;
    });
    
    // Also update the name in the database
    if (user && userId === user.id) {
      supabase
        .from('profiles')
        .update({ full_name: newName })
        .eq('user_id', userId)
        .then(({ error }) => {
          if (error) {
            console.error('Error updating profile name:', error);
          }
        });
    }
  };

  const checkPermission = (resource: Permission['resource'], action: Permission['action']): boolean => {
    return hasPermission(currentUser.role, resource, action);
  };

  // Check if user can edit an item (based on ownership and role)
  const canEdit = (itemCreatedBy?: string, itemAssignedTo?: string): boolean => {
    // Admins can edit everything
    if (currentUser.role === 'admin') {
      return true;
    }
    
    // Members can edit their own items
    if (currentUser.role === 'member') {
      return itemCreatedBy === currentUser.id || itemAssignedTo === currentUser.name;
    }
    
    // Viewers cannot edit anything
    return false;
  };

  // Check if user can delete an item (stricter than edit)
  const canDelete = (itemCreatedBy?: string, itemAssignedTo?: string): boolean => {
    // Only admins can delete items, or members can delete their own items
    if (currentUser.role === 'admin') {
      return true;
    }
    
    if (currentUser.role === 'member') {
      return itemCreatedBy === currentUser.id;
    }
    
    return false;
  };

  // Function to remove a family member
  const removeFamilyMember = async (memberId: string, familyId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Check if current user is admin of the family
      const currentUserMember = familyMembersData.find(m => m.id === user.id);
      if (!currentUserMember || currentUserMember.userRole !== 'admin') {
        console.error('Only admins can remove family members');
        return false;
      }
      
      // Prevent removing yourself
      if (memberId === user.id) {
        console.error('You cannot remove yourself from the family');
        return false;
      }

      // Delete the family member from the database
      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('user_id', memberId)
        .eq('family_id', familyId);

      if (error) {
        console.error('Error removing family member:', error);
        return false;
      }

      // Update local state
      setFamilyMembersData(prevMembers => 
        prevMembers.filter(member => member.id !== memberId)
      );
      
      return true;
    } catch (error) {
      console.error('Error in removeFamilyMember:', error);
      return false;
    }
  };

  // Function to invite a family member by email

  const inviteFamilyMemberByEmail = async (
    email: string, 
    role: UserRole, 
    name?: string
  ): Promise<{success: boolean; error?: string}> => {
    if (!user) {
      return { success: false, error: 'Sie müssen angemeldet sein, um Mitglieder einzuladen.' };
    }
    
    if (!userFamilyId) {
      return { success: false, error: 'Sie müssen zuerst eine Familie erstellen.' };
    }
    
    // Check if current user is admin of the family
    const currentUserMember = familyMembersData.find(m => m.id === user.id);
    if (!currentUserMember || currentUserMember.userRole !== 'admin') {
      return { success: false, error: 'Nur Administratoren können Mitglieder einladen.' };
    }
    
    try {
      // Call the RPC function to invite a family member
      const { data, error } = await supabase.rpc('invite_family_member', {
        p_email: email,
        p_family_id: userFamilyId,
        p_role: role,
        p_name: name || null
      });
      
      if (error) {
        console.error('Error inviting family member:', error);
        return { success: false, error: error.message || 'Fehler beim Einladen des Familienmitglieds.' };
      }
      
      if (!data.success) {
        return { success: false, error: data.error || 'Fehler beim Einladen des Familienmitglieds.' };
      }
      
      // If successful, fetch the updated family members
      // Note: fetchFamilyData is not available in this scope, would need to be refactored
      
      return { success: true };
    } catch (error: any) {
      console.error('Error in inviteFamilyMemberByEmail:', error);
      return { success: false, error: error.message || 'Ein unbekannter Fehler ist aufgetreten.' };
    }
  };

  const value: PermissionsContextType = {
    currentUser,
    familyMembersData,
    userFamilyId,
    setCurrentUser,
    updateMemberRole,
    updateUserName,
    removeFamilyMember,
    inviteFamilyMemberByEmail,
    createFamily,
    getMemberById,
    hasPermission: checkPermission,
    canEdit,
    canDelete,
    isAdmin: currentUser.role === 'admin',
    isMember: currentUser.role === 'member',
    isViewer: currentUser.role === 'viewer'
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = (): PermissionsContextType => {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};