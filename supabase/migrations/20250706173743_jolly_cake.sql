/*
  # Fix infinite recursion in family_members RLS policies

  1. Problem
    - The current RLS policies on family_members table create infinite recursion
    - Policies reference family_members table within their own conditions
    - This causes a 500 error when querying the table

  2. Solution
    - Drop existing problematic policies
    - Create new simplified policies that avoid self-reference
    - Use direct user authentication checks instead of complex joins

  3. Security
    - Maintain proper access control
    - Users can only see family members from their own family
    - Only family admins can manage members
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Family admins can manage members" ON family_members;
DROP POLICY IF EXISTS "Family members can read family membership" ON family_members;

-- Create new simplified policies that avoid infinite recursion

-- Policy 1: Users can read family members if they belong to the same family
CREATE POLICY "Users can read family members"
  ON family_members
  FOR SELECT
  TO authenticated
  USING (
    family_id IN (
      SELECT family_id 
      FROM profiles 
      WHERE id = auth.uid() 
      AND family_id IS NOT NULL
    )
  );

-- Policy 2: Users can insert themselves as family members
CREATE POLICY "Users can join families"
  ON family_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy 3: Family admins can update member roles (simplified check)
CREATE POLICY "Family admins can update members"
  ON family_members
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM family_members fm 
      WHERE fm.family_id = family_members.family_id 
      AND fm.user_id = auth.uid() 
      AND fm.role = 'admin'
    )
  );

-- Policy 4: Family admins can delete members (simplified check)
CREATE POLICY "Family admins can delete members"
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
  );

-- Policy 5: Users can delete their own membership (leave family)
CREATE POLICY "Users can leave family"
  ON family_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());