/*
  # Fix user_tokens table RLS

  1. Security
    - Enable RLS on `user_tokens` table
    - Drop any existing policies
    - Create restrictive policies for authenticated users only
    - SELECT policy: users can only read their own tokens
    - INSERT policy: users can only create their own tokens
    - UPDATE policy: users can only update their own tokens
    - Note: DELETE policy omitted to prevent token deletion
*/

-- Enable RLS on user_tokens
ALTER TABLE user_tokens ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies on user_tokens if any exist
DROP POLICY IF EXISTS "anon can insert own token" ON user_tokens;
DROP POLICY IF EXISTS "anon can read own token" ON user_tokens;
DROP POLICY IF EXISTS "anon can update own token" ON user_tokens;
DROP POLICY IF EXISTS "Users can read own tokens" ON user_tokens;
DROP POLICY IF EXISTS "Users can insert own tokens" ON user_tokens;
DROP POLICY IF EXISTS "Users can update own tokens" ON user_tokens;
DROP POLICY IF EXISTS "Allow all" ON user_tokens;
DROP POLICY IF EXISTS "Enable read access for own tokens" ON user_tokens;
DROP POLICY IF EXISTS "Enable insert for own tokens" ON user_tokens;
DROP POLICY IF EXISTS "Enable update for own tokens" ON user_tokens;

-- SELECT policy: authenticated users can only read their own tokens
CREATE POLICY "Users can read own tokens"
  ON user_tokens FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- INSERT policy: authenticated users can only insert their own tokens
CREATE POLICY "Users can insert own tokens"
  ON user_tokens FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- UPDATE policy: authenticated users can only update their own tokens
CREATE POLICY "Users can update own tokens"
  ON user_tokens FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
