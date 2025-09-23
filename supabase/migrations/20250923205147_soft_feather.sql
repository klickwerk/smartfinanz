/*
  # Allow personal transactions without family requirement

  1. Security Changes
    - Update RLS policies on transactions table to allow personal transactions
    - Remove family_id requirement for transaction creation
    - Allow users to create transactions for themselves without being part of a family

  2. Policy Updates
    - Modify INSERT policy to allow transactions with or without family_id
    - Modify SELECT, UPDATE, DELETE policies to handle both family and personal transactions
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create family transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view family transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update family transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete family transactions" ON transactions;

-- Create new policies that allow both personal and family transactions
CREATE POLICY "Users can create transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND
    (
      family_id IS NULL OR
      (family_id IS NOT NULL AND auth.uid() IN (
        SELECT user_id FROM family_members WHERE family_id = transactions.family_id
      ))
    )
  );

CREATE POLICY "Users can view transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    (family_id IS NOT NULL AND auth.uid() IN (
      SELECT user_id FROM family_members WHERE family_id = transactions.family_id
    ))
  );

CREATE POLICY "Users can update transactions"
  ON transactions
  FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    (family_id IS NOT NULL AND auth.uid() IN (
      SELECT user_id FROM family_members WHERE family_id = transactions.family_id
    ))
  );

CREATE POLICY "Users can delete transactions"
  ON transactions
  FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    (family_id IS NOT NULL AND auth.uid() IN (
      SELECT user_id FROM family_members WHERE family_id = transactions.family_id
    ))
  );