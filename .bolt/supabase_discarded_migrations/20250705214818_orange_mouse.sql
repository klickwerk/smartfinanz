/*
  # Add Remove Family Member Functionality

  1. New Features
    - Add a function to remove family members
    - Ensure proper cascading of permissions when a member is removed
    - Add triggers to clean up related data

  2. Security
    - Only family admins can remove members
    - Members cannot remove themselves
    - Ensure RLS policies are properly enforced
*/

-- Create a function to remove a family member
CREATE OR REPLACE FUNCTION remove_family_member(
  p_user_id UUID,
  p_family_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_is_self BOOLEAN;
BEGIN
  -- Check if the current user is an admin of the family
  SELECT EXISTS (
    SELECT 1 
    FROM family_members 
    WHERE family_id = p_family_id 
    AND user_id = auth.uid() 
    AND role = 'admin'
  ) INTO v_is_admin;
  
  -- Check if the user is trying to remove themselves
  v_is_self := (p_user_id = auth.uid());
  
  -- Only admins can remove members, and they cannot remove themselves
  IF NOT v_is_admin OR v_is_self THEN
    RETURN FALSE;
  END IF;
  
  -- Remove the family member
  DELETE FROM family_members
  WHERE family_id = p_family_id
  AND user_id = p_user_id;
  
  RETURN FOUND;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION remove_family_member TO authenticated;

-- Create a trigger to clean up related data when a family member is removed
CREATE OR REPLACE FUNCTION on_family_member_removed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update any transactions assigned to this user to be unassigned
  UPDATE transactions
  SET assigned_to = NULL
  WHERE family_id = OLD.family_id
  AND assigned_to = (
    SELECT full_name 
    FROM profiles 
    WHERE user_id = OLD.user_id
  );
  
  -- Update any budgets assigned to this user to be unassigned
  UPDATE budgets
  SET assigned_to = NULL
  WHERE family_id = OLD.family_id
  AND assigned_to = (
    SELECT full_name 
    FROM profiles 
    WHERE user_id = OLD.user_id
  );
  
  -- Remove user from project participants
  DELETE FROM project_participants
  WHERE user_id = OLD.user_id
  AND project_id IN (
    SELECT id 
    FROM projects 
    WHERE family_id = OLD.family_id
  );
  
  RETURN OLD;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_family_member_removed ON family_members;
CREATE TRIGGER trigger_family_member_removed
AFTER DELETE ON family_members
FOR EACH ROW
EXECUTE FUNCTION on_family_member_removed();

-- Add a policy to ensure only family admins can delete family members
DROP POLICY IF EXISTS "Family admins can remove members" ON family_members;
CREATE POLICY "Family admins can remove members"
  ON family_members
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM family_members fm
      WHERE fm.family_id = family_members.family_id
      AND fm.user_id = auth.uid()
      AND fm.role = 'admin'
    )
    AND family_members.user_id != auth.uid() -- Cannot remove yourself
  );