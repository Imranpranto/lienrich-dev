/*
  # Add Credits and Profiles Schema

  1. New Tables
    - `credits_calculation_and_profiles`
      - Stores user profile and credit information
      - Tracks subscription status and trial periods
      - Maintains credit balances and usage

  2. Security
    - Enables RLS on the table
    - Adds policies for user access
    - Ensures users can only view/update their own data

  3. Automation
    - Adds triggers for credit calculations
    - Handles plan changes automatically
    - Updates timestamps on changes
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
  -- Create the main table if it doesn't exist
  CREATE TABLE IF NOT EXISTS public.credits_calculation_and_profiles (
    id uuid PRIMARY KEY,
    email text UNIQUE NOT NULL,
    display_name text,
    plan text DEFAULT 'Trial' NOT NULL,
    total_credits integer DEFAULT 250 NOT NULL,
    used_credits integer DEFAULT 0 NOT NULL,
    credits_left integer DEFAULT 250 NOT NULL,
    subscription_start_at timestamptz,
    subscription_end_at timestamptz,
    trial_ends_at timestamptz DEFAULT (now() + interval '7 days'),
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT positive_credits CHECK (credits_left >= 0)
  );

  -- Add foreign key if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'credits_calculation_and_profiles_id_fkey'
  ) THEN
    ALTER TABLE public.credits_calculation_and_profiles
    ADD CONSTRAINT credits_calculation_and_profiles_id_fkey
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

EXCEPTION
  WHEN duplicate_table THEN
    NULL;
END $$;

-- Enable RLS
ALTER TABLE public.credits_calculation_and_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.credits_calculation_and_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.credits_calculation_and_profiles;

-- Create policies
CREATE POLICY "Users can view own profile"
  ON public.credits_calculation_and_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.credits_calculation_and_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS update_credits_left() CASCADE;

-- Create function to update credits_left
CREATE OR REPLACE FUNCTION update_credits_left()
RETURNS TRIGGER AS $$
BEGIN
  NEW.credits_left := NEW.total_credits - NEW.used_credits;
  NEW.updated_at := CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating credits_left
DROP TRIGGER IF EXISTS update_credits_left_trigger ON public.credits_calculation_and_profiles;
CREATE TRIGGER update_credits_left_trigger
  BEFORE INSERT OR UPDATE ON public.credits_calculation_and_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_credits_left();

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS handle_plan_change() CASCADE;

-- Create function to handle plan changes
CREATE OR REPLACE FUNCTION handle_plan_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.plan != OLD.plan THEN
    IF NEW.plan != 'Trial' THEN
      NEW.subscription_start_at := CURRENT_TIMESTAMP;
      NEW.subscription_end_at := CURRENT_TIMESTAMP + INTERVAL '30 days';
      NEW.trial_ends_at := NULL;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for plan changes
DROP TRIGGER IF EXISTS handle_plan_change_trigger ON public.credits_calculation_and_profiles;
CREATE TRIGGER handle_plan_change_trigger
  BEFORE UPDATE OF plan ON public.credits_calculation_and_profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_plan_change();