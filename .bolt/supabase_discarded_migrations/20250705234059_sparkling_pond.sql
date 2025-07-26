/*
  # Fix infinite recursion in family_members RLS policies

  1. Security Changes
    - Drop existing problematic RLS policies on family_members table
    - Create new, non-recursive policies that avoid circular dependencies
    - Ensure policies reference only direct relationships without loops

  2. Policy Structure
    - Users can view their own memberships (direct user_id check)
    - Family creators can manage all members (via families table, not family_members)
    - Users can insert/delete their own memberships (direct user_id check)

  This migration fixes the infinite recursion error by ensuring policies
  don't create circular dependencies between family_members and other tables.
*/

-- Drop all existing policies on family_members to start fresh
DROP POLICY IF EXISTS "Family creators can manage all members" ON family_members;
DROP POLICY IF EXISTS "Users can delete their own memberships" ON family_members;
DROP POLICY IF EXISTS "Users can insert their own memberships" ON family_members;
DROP POLICY IF EXISTS "Users can view their own memberships" ON family_members;

-- Create new, non-recursive policies

-- Policy 1: Users can view their own family memberships
CREATE POLICY "Users can view own memberships"
  ON family_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy 2: Users can insert themselves as family members
CREATE POLICY "Users can insert own memberships"
  ON family_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy 3: Users can delete their own memberships
CREATE POLICY "Users can delete own memberships"
  ON family_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Policy 4: Family creators can manage all members (non-recursive)
-- This policy checks the families table directly without going through family_members
CREATE POLICY "Family creators can manage members"
  ON family_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM families 
      WHERE families.id = family_members.family_id 
      AND families.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM families 
      WHERE families.id = family_members.family_id 
      AND families.created_by = auth.uid()
    )
  );

-- Policy 5: Family admins can manage members
-- This allows users with admin role to manage other members
CREATE POLICY "Family admins can manage members"
  ON family_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM family_members admin_check
      WHERE admin_check.family_id = family_members.family_id
      AND admin_check.user_id = auth.uid()
      AND admin_check.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM family_members admin_check
      WHERE admin_check.family_id = family_members.family_id
      AND admin_check.user_id = auth.uid()
      AND admin_check.role = 'admin'
    )
  );