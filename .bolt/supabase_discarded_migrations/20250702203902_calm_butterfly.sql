/*
  # Fix RLS Policy Infinite Recursion

  This migration fixes the infinite recursion issue in RLS policies by:
  1. Dropping problematic policies that create circular references
  2. Recreating simplified policies that avoid recursion
  3. Ensuring proper access control without circular dependencies

  ## Changes Made
  - Simplified family member policies to avoid self-referencing
  - Updated project policies to use direct relationships
  - Removed complex nested queries that cause recursion
*/

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Users can view families where they are members" ON families;
DROP POLICY IF EXISTS "Users can view family budgets" ON budgets;
DROP POLICY IF EXISTS "Users can view family transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view family projects" ON projects;
DROP POLICY IF EXISTS "Users can view project participants of their projects" ON project_participants;
DROP POLICY IF EXISTS "Users can view project history of their projects" ON project_history;

-- Recreate simplified policies for families
CREATE POLICY "Users can view families where they are members"
  ON families
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT family_id 
      FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

-- Recreate simplified policies for budgets
CREATE POLICY "Users can view family budgets"
  ON budgets
  FOR SELECT
  TO authenticated
  USING (
    family_id IS NOT NULL 
    AND EXISTS (
      SELECT 1 
      FROM family_members 
      WHERE family_id = budgets.family_id 
      AND user_id = auth.uid()
    )
  );

-- Recreate simplified policies for transactions
CREATE POLICY "Users can view family transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (
    family_id IS NOT NULL 
    AND EXISTS (
      SELECT 1 
      FROM family_members 
      WHERE family_id = transactions.family_id 
      AND user_id = auth.uid()
    )
  );

-- Recreate simplified policies for projects
CREATE POLICY "Users can view family projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    family_id IS NOT NULL 
    AND EXISTS (
      SELECT 1 
      FROM family_members 
      WHERE family_id = projects.family_id 
      AND user_id = auth.uid()
    )
  );

-- Recreate simplified policies for project participants
CREATE POLICY "Users can view project participants of their projects"
  ON project_participants
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() 
    OR EXISTS (
      SELECT 1 
      FROM projects 
      WHERE projects.id = project_participants.project_id 
      AND projects.created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 
      FROM projects 
      WHERE projects.id = project_participants.project_id 
      AND projects.family_id IS NOT NULL
      AND EXISTS (
        SELECT 1 
        FROM family_members 
        WHERE family_id = projects.family_id 
        AND user_id = auth.uid()
      )
    )
  );

-- Recreate simplified policies for project history
CREATE POLICY "Users can view project history of their projects"
  ON project_history
  FOR SELECT
  TO authenticated
  USING (
    contributor_id = auth.uid() 
    OR EXISTS (
      SELECT 1 
      FROM projects 
      WHERE projects.id = project_history.project_id 
      AND projects.created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 
      FROM project_participants 
      WHERE project_participants.project_id = project_history.project_id 
      AND project_participants.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 
      FROM projects 
      WHERE projects.id = project_history.project_id 
      AND projects.family_id IS NOT NULL
      AND EXISTS (
        SELECT 1 
        FROM family_members 
        WHERE family_id = projects.family_id 
        AND user_id = auth.uid()
      )
    )
  );