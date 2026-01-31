/*
  # Add RLS Policies to user_tokens Table

  ## Purpose
  Enforce row-level security for the user_tokens table to ensure users can only:
  - SELECT their own token record (user_id = auth.uid())
  - UPDATE their own token record (user_id = auth.uid())

  ## Changes
  - CREATE policy "Users can view own tokens" (SELECT)
  - CREATE policy "Users can update own tokens" (UPDATE)

  ## Security
  - Authenticated users can only access their own token records
  - user_id must match the authenticated user ID (auth.uid())
  - No INSERT or DELETE policies - system-managed only
*/

DO $$
BEGIN
  -- Drop existing policies if they exist to avoid duplicates
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_tokens'
    AND policyname = 'Users can view own tokens'
  ) THEN
    DROP POLICY "Users can view own tokens" ON user_tokens;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_tokens'
    AND policyname = 'Users can update own tokens'
  ) THEN
    DROP POLICY "Users can update own tokens" ON user_tokens;
  END IF;
END $$;

CREATE POLICY "Users can view own tokens"
  ON user_tokens
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own tokens"
  ON user_tokens
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);