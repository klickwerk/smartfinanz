/*
  # Fix infinite recursion in family_members policies

  1. Security Changes
    - Remove recursive policies that cause infinite loops
    - Simplify RLS policies to prevent circular references
    - Ensure policies don't reference family_members table within themselves

  2. Policy Updates
    - Replace complex nested queries with simpler direct checks
    - Remove policies that join family_members with itself
    - Add clear, non-recursive policies for CRUD operations
*/

-- Drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Family creators can manage members" ON family_members;
DROP POLICY IF EXISTS "Family creators can view all members" ON family_members;
DROP POLICY IF EXISTS "User can see their own family memberships" ON family_members;
DROP POLICY IF EXISTS "Users can add themselves to families" ON family_members;
DROP POLICY IF EXISTS "Users can remove themselves from families" ON family_members;
DROP POLICY IF EXISTS "Users can view their own memberships" ON family_members;

-- Create new, simplified policies without recursion
CREATE POLICY "Users can view their own memberships"
  ON family_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own memberships"
  ON family_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own memberships"
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

-- Also fix any recursive policies in other tables that reference family_members
DROP POLICY IF EXISTS "Users can view family transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view family budgets" ON budgets;
DROP POLICY IF EXISTS "Users can view family projects" ON projects;

-- Recreate these policies without complex subqueries
CREATE POLICY "Users can view family transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    family_id IN (
      SELECT fm.family_id FROM family_members fm WHERE fm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view family budgets"
  ON budgets
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    family_id IN (
      SELECT fm.family_id FROM family_members fm WHERE fm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view family projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    family_id IN (
      SELECT fm.family_id FROM family_members fm WHERE fm.user_id = auth.uid()
    )
  );