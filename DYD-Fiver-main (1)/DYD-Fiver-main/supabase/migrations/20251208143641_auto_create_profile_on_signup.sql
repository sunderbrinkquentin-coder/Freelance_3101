/*
  # Auto-Create Profile on User Signup

  1. New Functions
    - `handle_new_user()` - Creates a profile entry when a new user signs up

  2. Triggers
    - Automatically creates a profile in the `profiles` table when a user registers

  3. Security
    - Function runs with security definer to bypass RLS
    - Profile is created with correct user_id and email from auth.users
*/

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id,
    session_id,
    email,
    status,
    is_anonymous,
    registered_at
  ) VALUES (
    NEW.id,
    NEW.id::text, -- Use user_id as session_id for registered users
    NEW.email,
    'registered',
    false,
    now()
  );

  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, do nothing
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;