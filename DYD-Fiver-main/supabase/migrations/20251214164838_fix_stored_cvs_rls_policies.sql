/*
  # Fix stored_cvs RLS policies to allow NULL user_id

  1. Problem
    - CVs with user_id = NULL are blocked by RLS
    - Dashboard cannot display CVs during creation
  
  2. Solution
    - SELECT: Allow if user_id = auth.uid() OR user_id IS NULL
    - INSERT: Allow if user_id = auth.uid() OR user_id IS NULL
    - UPDATE: Keep restricted - only user_id = auth.uid()
  
  3. Policies Modified
    - "Users can view own CVs" - now includes NULL user_id
    - "Users can insert own CVs" - now allows NULL user_id
    - "Users can update own CVs" - unchanged (restrictive)
*/

-- Drop old policies
DROP POLICY IF EXISTS "Users can view own CVs" ON stored_cvs;
DROP POLICY IF EXISTS "Users can insert own CVs" ON stored_cvs;
DROP POLICY IF EXISTS "Users can update own CVs" ON stored_cvs;

-- Create new SELECT policy - allow own CVs or NULL user_id
CREATE POLICY "Users can view own CVs"
  ON stored_cvs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Create new INSERT policy - allow own CVs or NULL user_id
CREATE POLICY "Users can insert own CVs"
  ON stored_cvs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Create new UPDATE policy - only own CVs
CREATE POLICY "Users can update own CVs"
  ON stored_cvs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
