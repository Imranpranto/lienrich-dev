/*
  # User Authentication Triggers and Functions
  
  1. New Tables
    - None (using existing auth.users and profiles tables)
  
  2. Functions
    - handle_new_user(): Creates profile and credits records for new users
  
  3. Triggers
    - on_auth_user_created: Executes after new user signup
*/

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (
    id,
    email,
    plan,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    'Trial',
    NOW(),
    NOW()
  );
  
  -- Create credits calculation record
  INSERT INTO public.credits_calculation (
    id,
    total_credits,
    used_credits,
    credits_left,
    trial_ends_at,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    250, -- Initial trial credits
    0,   -- No credits used initially
    250, -- All credits available
    NOW() + INTERVAL '7 days',
    NOW(),
    NOW()
  );
  
  -- Log initial credit transaction
  INSERT INTO public.credit_transactions (
    user_id,
    amount,
    operation_type,
    operation_details,
    created_at
  ) VALUES (
    NEW.id,
    250,
    'initial_credit',
    jsonb_build_object('type', 'trial_signup'),
    NOW()
  );
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();