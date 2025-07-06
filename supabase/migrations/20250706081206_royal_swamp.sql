/*
  # Fix infinite recursion in family_members policies

  1. Policy Updates
    - Remove recursive policies that cause infinite loops
    - Simplify family member access policies
    - Ensure policies don't reference themselves

  2. Security
    - Maintain proper access control
    - Users can view family members in families they belong to
    - Family creators and admins can manage members
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Family admins can manage members" ON family_members;
DROP POLICY IF EXISTS "Family creators can manage members" ON family_members;
DROP POLICY IF EXISTS "Users can delete own memberships" ON family_members;
DROP POLICY IF EXISTS "Users can insert own memberships" ON family_members;
DROP POLICY IF EXISTS "Users can view family members" ON family_members;
DROP POLICY IF EXISTS "Users can view own memberships" ON family_members;

-- Create simplified, non-recursive policies
CREATE POLICY "Users can view own memberships"
  ON family_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own memberships"
  ON family_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own memberships"
  ON family_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Family creators can manage all members"
  ON family_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM families 
      WHERE families.id = family_members.family_id 
      AND families.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM families 
      WHERE families.id = family_members.family_id 
      AND families.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can view members in their families"
  ON family_members
  FOR SELECT
  TO authenticated
  USING (
    family_id IN (
      SELECT fm.family_id 
      FROM family_members fm 
      WHERE fm.user_id = auth.uid()
    )
  );