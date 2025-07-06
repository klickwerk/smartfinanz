import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Family, FamilyMember, Profile } from '../types';
import { useAuth } from './useAuth';

export const useFamily = () => {
  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile, user } = useAuth();

  useEffect(() => {
    if (profile?.family_id) {
      fetchFamily();
      fetchMembers();
    } else {
      setLoading(false);
    }
  }, [profile?.family_id]);

  const fetchFamily = async () => {
    if (!profile?.family_id) return;

    try {
      const { data, error } = await supabase
        .from('families')
        .select('*')
        .eq('id', profile.family_id)
        .single();

      if (error) throw error;
      setFamily(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const fetchMembers = async () => {
    if (!profile?.family_id) return;

    try {
      const { data, error } = await supabase
        .from('family_members')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('family_id', profile.family_id);

      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createFamily = async (name: string, description?: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Create family
      const { data: familyData, error: familyError } = await supabase
        .from('families')
        .insert({
          name,
          description,
          created_by: user.id,
        })
        .select()
        .single();

      if (familyError) throw familyError;

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('family_members')
        .insert({
          family_id: familyData.id,
          user_id: user.id,
          role: 'admin',
        });

      if (memberError) throw memberError;

      // Update user profile with family_id
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ family_id: familyData.id })
        .eq('id', user.id);

      if (profileError) throw profileError;

      setFamily(familyData);
      return familyData;
    } catch (err) {
      throw err;
    }
  };

  const inviteMember = async (email: string, role: 'admin' | 'member' = 'member') => {
    if (!family || !user) throw new Error('No family or user');

    try {
      // Check if user is admin
      const currentMember = members.find(m => m.user_id === user.id);
      if (currentMember?.role !== 'admin') {
        throw new Error('Only admins can invite members');
      }

      // Invite user via Supabase Auth
      const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
        data: {
          family_id: family.id,
          role,
        },
      });

      if (error) throw error;
      return data;
    } catch (err) {
      throw err;
    }
  };

  const updateMemberRole = async (memberId: string, newRole: 'admin' | 'member') => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Check if current user is admin
      const currentMember = members.find(m => m.user_id === user.id);
      if (currentMember?.role !== 'admin') {
        throw new Error('Only admins can change member roles');
      }

      const { data, error } = await supabase
        .from('family_members')
        .update({ role: newRole })
        .eq('id', memberId)
        .select()
        .single();

      if (error) throw error;
      
      // Update local state
      setMembers(prev =>
        prev.map(m => m.id === memberId ? { ...m, role: newRole } : m)
      );

      return data;
    } catch (err) {
      throw err;
    }
  };

  const removeMember = async (memberId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Check if current user is admin
      const currentMember = members.find(m => m.user_id === user.id);
      if (currentMember?.role !== 'admin') {
        throw new Error('Only admins can remove members');
      }

      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      // Update local state
      setMembers(prev => prev.filter(m => m.id !== memberId));
    } catch (err) {
      throw err;
    }
  };

  const leaveFamily = async () => {
    if (!user || !profile?.family_id) throw new Error('No user or family');

    try {
      // Remove from family_members
      const { error: memberError } = await supabase
        .from('family_members')
        .delete()
        .eq('user_id', user.id)
        .eq('family_id', profile.family_id);

      if (memberError) throw memberError;

      // Update profile to remove family_id
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ family_id: null })
        .eq('id', user.id);

      if (profileError) throw profileError;

      setFamily(null);
      setMembers([]);
    } catch (err) {
      throw err;
    }
  };

  const getCurrentUserRole = (): 'admin' | 'member' | null => {
    if (!user) return null;
    const member = members.find(m => m.user_id === user.id);
    return member?.role || null;
  };

  const isAdmin = (): boolean => {
    return getCurrentUserRole() === 'admin';
  };

  return {
    family,
    members,
    loading,
    error,
    createFamily,
    inviteMember,
    updateMemberRole,
    removeMember,
    leaveFamily,
    getCurrentUserRole,
    isAdmin,
    refetch: () => {
      fetchFamily();
      fetchMembers();
    },
  };
};