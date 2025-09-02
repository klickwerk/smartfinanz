import { supabase } from '../lib/supabaseClient';

export interface CreateFamilyResult {
  success: boolean;
  familyId?: string;
  error?: string;
}

/**
 * Service class for managing family-related operations
 * Handles family creation, management, and member operations
 */
export class FamilyService {
  
  /**
   * Creates a new family and adds the creator as an admin member
   * @param familyName - The name of the new family
   * @param creatorUserId - The user ID of the family creator
   * @returns Promise with success status and family ID or error message
   */
  async createFamily(familyName: string, creatorUserId: string): Promise<CreateFamilyResult> {
    try {
      // Validate input
      if (!familyName.trim()) {
        return { success: false, error: 'Familienname ist erforderlich' };
      }

      if (!creatorUserId) {
        return { success: false, error: 'Benutzer-ID ist erforderlich' };
      }

      // Check if user is already in a family
      const { data: existingMembership, error: membershipCheckError } = await supabase
        .from('family_members')
        .select('id, family_id')
        .eq('user_id', creatorUserId)
        .limit(1);

      if (membershipCheckError) {
        console.error('Error checking existing membership:', membershipCheckError);
        return { success: false, error: 'Fehler beim Überprüfen der bestehenden Familienmitgliedschaft' };
      }

      if (existingMembership && existingMembership.length > 0) {
        return { success: false, error: 'Du bist bereits Mitglied einer Familie' };
      }

      // Create the family
      const { data: familyData, error: familyError } = await supabase
        .from('families')
        .insert([{
          name: familyName.trim(),
          created_by: creatorUserId
        }])
        .select('id')
        .single();

      if (familyError) {
        console.error('Error creating family:', familyError);
        return { success: false, error: 'Fehler beim Erstellen der Familie' };
      }

      const familyId = familyData.id;

      // Add the creator as an admin member of the family
      const { error: memberError } = await supabase
        .from('family_members')
        .insert([{
          family_id: familyId,
          user_id: creatorUserId,
          role: 'admin'
        }]);

      if (memberError) {
        console.error('Error adding creator as family member:', memberError);
        
        // Cleanup: Delete the family if member creation failed
        await supabase
          .from('families')
          .delete()
          .eq('id', familyId);

        return { success: false, error: 'Fehler beim Hinzufügen als Familienmitglied' };
      }

      return { success: true, familyId };

    } catch (error) {
      console.error('Error in createFamily:', error);
      return { success: false, error: 'Ein unerwarteter Fehler ist aufgetreten' };
    }
  }

  /**
   * Gets family details by ID
   * @param familyId - The family ID to fetch
   * @returns Promise with family data or null
   */
  async getFamilyById(familyId: string) {
    try {
      const { data, error } = await supabase
        .from('families')
        .select('id, name, created_by, created_at')
        .eq('id', familyId)
        .single();

      if (error) {
        console.error('Error fetching family:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getFamilyById:', error);
      return null;
    }
  }

  /**
   * Updates family name
   * @param familyId - The family ID to update
   * @param newName - The new family name
   * @param userId - The user ID making the request (must be admin)
   * @returns Promise with success status
   */
  async updateFamilyName(familyId: string, newName: string, userId: string): Promise<boolean> {
    try {
      // Check if user is admin of the family
      const { data: memberData, error: memberError } = await supabase
        .from('family_members')
        .select('role')
        .eq('family_id', familyId)
        .eq('user_id', userId)
        .single();

      if (memberError || !memberData || memberData.role !== 'admin') {
        console.error('User is not admin of this family');
        return false;
      }

      // Update family name
      const { error } = await supabase
        .from('families')
        .update({ name: newName.trim() })
        .eq('id', familyId);

      if (error) {
        console.error('Error updating family name:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateFamilyName:', error);
      return false;
    }
  }

  /**
   * Deletes a family (only if user is the creator)
   * @param familyId - The family ID to delete
   * @param userId - The user ID making the request (must be creator)
   * @returns Promise with success status
   */
  async deleteFamily(familyId: string, userId: string): Promise<boolean> {
    try {
      // Check if user is the creator of the family
      const { data: familyData, error: familyError } = await supabase
        .from('families')
        .select('created_by')
        .eq('id', familyId)
        .single();

      if (familyError || !familyData || familyData.created_by !== userId) {
        console.error('User is not the creator of this family');
        return false;
      }

      // Delete the family (cascade will handle family_members)
      const { error } = await supabase
        .from('families')
        .delete()
        .eq('id', familyId);

      if (error) {
        console.error('Error deleting family:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteFamily:', error);
      return false;
    }
  }
}

// Create and export a singleton instance
export const familyService = new FamilyService();