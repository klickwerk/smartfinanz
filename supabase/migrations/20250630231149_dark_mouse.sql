/*
  # Fix RLS Policy Infinite Recursion

  1. Problem
    - Infinite recursion detected in policy for relation "family_members"
    - This occurs when RLS policies create circular dependencies
    - The budgets table policy likely has a complex join that creates recursion

  2. Solution
    - Simplify the RLS policies to avoid circular references
    - Use more direct policy conditions
    - Ensure policies don't reference tables that reference back to the original table

  3. Changes
    - Update budgets table RLS policies to be more direct
    - Simplify family member access patterns
    - Remove complex nested EXISTS clauses that might cause recursion
*/

-- Drop existing problematic policies for budgets
DROP POLICY IF EXISTS "Users can view budgets they created or in their family" ON budgets;
DROP POLICY IF EXISTS "Users can create budgets" ON budgets;
DROP POLICY IF EXISTS "Users can update their own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can delete their own budgets" ON budgets;

-- Create simplified policies for budgets table
CREATE POLICY "Users can view their own budgets"
  ON budgets
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can view family budgets"
  ON budgets
  FOR SELECT
  TO authenticated
  USING (
    family_id IS NOT NULL 
    AND family_id IN (
      SELECT family_id 
      FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create budgets"
  ON budgets
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own budgets"
  ON budgets
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete their own budgets"
  ON budgets
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Also check and fix family_members policies if they have recursion issues
DROP POLICY IF EXISTS "Users can view family members of their families" ON family_members;

-- Create a simpler policy for viewing family members
CREATE POLICY "Users can view family members"
  ON family_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() 
    OR family_id IN (
      SELECT id 
      FROM families 
      WHERE created_by = auth.uid()
    )
  );

-- Ensure transactions policies are also simplified to avoid recursion
DROP POLICY IF EXISTS "Users can view transactions they created or in their family" ON transactions;

CREATE POLICY "Users can view their own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can view family transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (
    family_id IS NOT NULL 
    AND family_id IN (
      SELECT family_id 
      FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

-- Similarly for projects
DROP POLICY IF EXISTS "Users can view projects they created, participate in, or in the" ON projects;

CREATE POLICY "Users can view their own projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can view family projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    family_id IS NOT NULL 
    AND family_id IN (
      SELECT family_id 
      FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view projects they participate in"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT project_id 
      FROM project_participants 
      WHERE user_id = auth.uid()
    )
  );