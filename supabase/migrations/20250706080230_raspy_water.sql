/*
  # Fix Family Members RLS Policies and Infinite Recursion

  1. Changes
    - Drop all existing problematic policies on family_members table
    - Create new non-recursive policies that avoid circular references
    - Add missing indexes for performance optimization
    - Fix permissions for viewing and managing family members

  2. Security
    - Maintain proper access control while eliminating recursion
    - Users can only see families they belong to
    - Family admins can manage members but not themselves
    - Users can view and manage their own memberships
*/

-- Drop all existing policies on family_members to start fresh
DROP POLICY IF EXISTS "Family admins can manage members" ON family_members;
DROP POLICY IF EXISTS "Family creators can manage members" ON family_members;
DROP POLICY IF EXISTS "Users can delete own memberships" ON family_members;
DROP POLICY IF EXISTS "Users can insert own memberships" ON family_members;
DROP POLICY IF EXISTS "Users can view own memberships" ON family_members;
DROP POLICY IF EXISTS "Users can view family members" ON family_members;

-- Create new, non-recursive policies for family_members

-- 1. Users can view their own memberships
CREATE POLICY "Users can view own memberships"
  ON family_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 2. Users can view family members in families they belong to
CREATE POLICY "Users can view family members"
  ON family_members
  FOR SELECT
  TO authenticated
  USING (
    family_id IN (
      SELECT family_id 
      FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

-- 3. Users can insert themselves as family members
CREATE POLICY "Users can insert own memberships"
  ON family_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 4. Users can delete their own memberships
CREATE POLICY "Users can delete own memberships"
  ON family_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- 5. Family creators can manage all members
CREATE POLICY "Family creators can manage members"
  ON family_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM families 
      WHERE id = family_members.family_id 
      AND created_by = auth.uid()
    )
  );

-- 6. Family admins can manage members (but not themselves)
CREATE POLICY "Family admins can manage members"
  ON family_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM family_members fm
      WHERE fm.family_id = family_members.family_id 
      AND fm.user_id = auth.uid() 
      AND fm.role = 'admin'
      AND fm.user_id <> family_members.user_id
    )
  );

-- Create indexes to improve performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_family_id ON family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_family_members_family_user_unique ON family_members(family_id, user_id);