/*
  # Fix Function Search Paths

  1. Security Enhancement
    - Set immutable search_path for functions to prevent SQL injection
    - Recreate functions with proper security settings

  2. Functions Affected
    - set_current_timestamp_updated_at
    - add_tokens

  3. Security
    - Functions now use explicit schema references
    - Search path is immutable and secure
*/

-- ============================================================================
-- set_current_timestamp_updated_at
-- ============================================================================
DROP FUNCTION IF EXISTS public.set_current_timestamp_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================================
-- add_tokens
-- ============================================================================
DROP FUNCTION IF EXISTS public.add_tokens(uuid, integer) CASCADE;

CREATE OR REPLACE FUNCTION public.add_tokens(
  p_user_id uuid,
  p_amount integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  INSERT INTO public.user_tokens (user_id, tokens_remaining, last_refill_at)
  VALUES (p_user_id, p_amount, now())
  ON CONFLICT (user_id)
  DO UPDATE SET
    tokens_remaining = public.user_tokens.tokens_remaining + p_amount,
    last_refill_at = now();
END;
$$;
