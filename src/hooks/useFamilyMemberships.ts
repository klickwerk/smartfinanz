import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

// Types for database tables - updated to match actual database structure
export const useFamilyMemberships = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [families, setFamilies] = useState([]);
  const [familyMemberships, setFamilyMemberships] = useState([]);
  const [userFamilyId, setUserFamilyId] = useState(null);

  const { user } = useAuth();

  useEffect(() => {
    const fetchFamilyData = async () => {
      try {
        // Then get the user's family memberships
        const { data: membershipData, error: membershipError } = await supabase
          .from('family_members')
          .select('id, family_id, user_id, role')
          .eq('user_id', user.id);

        if (membershipError) {
          console.error('Error fetching family memberships:', membershipError);
          setLoading(false);
          return;
        }

        // Store the raw memberships
        const rawMemberships = membershipData || [];
        
        // If user has family memberships, get family details and other members
        if (rawMemberships.length > 0) {
          // Get the first family ID (assuming user is in one family for now)
          const familyId = rawMemberships[0].family_id;
          setUserFamilyId(familyId);
          
          // Get all families the user is a member of
          const { data: familiesData, error: familiesError } = await supabase
            .from('families')
            .select('id, name, created_by')
            .in('id', rawMemberships.map(m => m.family_id));
            
          if (familiesError) {
            console.error('Error fetching families:', familiesError);
          } else {
            setFamilies(familiesData || []);
          }
          
          // For each family, get all members
          const allFamilyMemberships = [];
          
          for (const membership of rawMemberships) {
            // Get all members of this family
            const { data: familyMembersData, error: familyMembersError } = await supabase
              .from('family_members')
              .select('id, family_id, user_id, role')
              .eq('family_id', membership.family_id);
              
            if (familyMembersError) {
              console.error(`Error fetching members for family ${membership.family_id}:`, familyMembersError);
              continue;
            }
            
            if (familyMembersData && familyMembersData.length > 0) {
              // Get profiles for all these members
              const memberIds = familyMembersData.map(m => m.user_id);
              const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('id, user_id, full_name, avatar_url, email')
                .in('user_id', memberIds);
                
              if (profilesError) {
                console.error('Error fetching member profiles:', profilesError);
              }
              
              // Add profiles to memberships
              const membershipsWithProfiles = familyMembersData.map(member => {
                const profile = profilesData?.find(p => p.user_id === member.user_id);
                return {
                  ...member,
                  profile
                };
              });
              
              allFamilyMemberships.push(...membershipsWithProfiles);
            }
          }
          
          setFamilyMemberships(allFamilyMemberships);
        } else {
          // User has no family memberships
          setUserFamilyId(null);
          setFamilies([]);
          setFamilyMemberships([]);
        }
      } catch (err) {
        console.error("Error in useFamilyMemberships:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFamilyData();
  }, [user]);

  return { familyMemberships, families, loading, error };
};