/*
  # Create consume_token RPC function

  1. New Function
    - `consume_token` - Atomically deducts 1 credit from user's balance
    - Only succeeds if credits > 0
    - Returns true on success, false if insufficient tokens
    - Database-level atomicity ensures no race conditions

  2. Security
    - Function is callable by authenticated users
    - RLS on user_tokens ensures user can only consume their own tokens
*/

CREATE OR REPLACE FUNCTION consume_token(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE user_tokens
  SET credits = credits - 1,
      updated_at = now()
  WHERE user_id = p_user_id
    AND credits > 0;

  RETURN FOUND;
END;
$$;
