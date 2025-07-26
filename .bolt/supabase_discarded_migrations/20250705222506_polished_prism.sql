/*
  # Fix Family Member Removal Functionality

  1. Changes
    - Drop existing policy if it exists to avoid errors
    - Create a policy to allow family admins to remove members
    - Fix the trigger function for cleaning up after member removal
    - Ensure the trigger exists for the family_members table

  2. Security
    - Only family admins can remove members
    - Members cannot remove themselves
    - Proper cleanup of related data when a member is removed
*/

-- Drop the policy if it already exists to ensure idempotency
DROP POLICY IF EXISTS "Family admins can remove members" ON family_members;

-- Add a policy to allow family admins to remove members
CREATE POLICY "Family admins can remove members"
  ON family_members
  FOR DELETE
  TO authenticated
  USING (
    (EXISTS (
      SELECT 1
      FROM family_members fm
      WHERE fm.family_id = family_members.family_id
      AND fm.user_id = auth.uid()
      AND fm.role = 'admin'
    ))
    AND (user_id <> auth.uid()) -- Cannot remove yourself
  );

-- Create or replace the function to handle member removal cleanup
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

-- Drop the trigger if it already exists before recreating it
DROP TRIGGER IF EXISTS trigger_family_member_removed ON family_members;

-- Create the trigger
CREATE TRIGGER trigger_family_member_removed
AFTER DELETE ON family_members
FOR EACH ROW
EXECUTE FUNCTION on_family_member_removed();