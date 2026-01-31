/*
  # Fix Profile Trigger to Include Full Name
  
  1. Changes
    - Update `handle_new_user()` function to extract and store `full_name` from user metadata
    - The trigger now reads the `full_name` from `raw_user_meta_data` and stores it in the profiles table
  
  2. How it works
    - When a user signs up with a full name, it's stored in Supabase Auth's `raw_user_meta_data`
    - The trigger extracts it using JSON operators and stores it in the `full_name` column
    - If no name is provided, the column remains NULL
*/

-- Drop the existing function and trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function that extracts full_name from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id,
    session_id,
    email,
    full_name,
    status,
    is_anonymous,
    registered_at
  ) VALUES (
    NEW.id,
    NEW.id::text,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL),
    'registered',
    false,
    now()
  );

  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- If profile already exists, update the full_name if provided
    UPDATE public.profiles 
    SET full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', full_name)
    WHERE user_id = NEW.id;
    RETURN NEW;
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;