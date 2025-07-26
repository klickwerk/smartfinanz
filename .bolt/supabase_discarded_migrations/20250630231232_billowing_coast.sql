/*
  # Fix infinite recursion in family_members RLS policies

  1. Policy Updates
    - Remove circular references in family_members policies
    - Simplify policy logic to prevent recursion
    - Ensure proper access control without circular dependencies

  2. Security
    - Maintain proper RLS protection
    - Allow family creators to manage members
    - Allow users to view their own family memberships
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Family creators can manage family members" ON family_members;
DROP POLICY IF EXISTS "Users can view family members" ON family_members;

-- Create simplified policies without circular references
CREATE POLICY "Users can view their own family memberships"
  ON family_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert themselves as family members"
  ON family_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Family creators can manage all family members"
  ON family_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM families 
      WHERE families.id = family_members.family_id 
      AND families.created_by = auth.uid()
    )
  );

-- Create a separate policy for family creators to view all members
CREATE POLICY "Family creators can view all family members"
  ON family_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM families 
      WHERE families.id = family_members.family_id 
      AND families.created_by = auth.uid()
    )
  );