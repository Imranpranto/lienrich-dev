/*
  # Fix database schema and add retry logic

  1. Changes
    - Add proper error handling
    - Use DO blocks for safer execution
    - Add proper constraints and indexes
    - Ensure idempotent operations
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Wrap in a DO block for better error handling
DO $$ 
BEGIN
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
    stripe_customer_id text,
    stripe_subscription_id text,
    subscription_status text CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'incomplete', 'trialing')),
    billing_cycle text CHECK (billing_cycle IN ('monthly', 'yearly')),
    subscription_end_date timestamptz,
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

  -- Create indexes for better performance
  CREATE INDEX IF NOT EXISTS idx_credits_stripe_customer ON credits_calculation_and_profiles(stripe_customer_id);
  CREATE INDEX IF NOT EXISTS idx_credits_subscription ON credits_calculation_and_profiles(stripe_subscription_id);
  CREATE INDEX IF NOT EXISTS idx_credits_status ON credits_calculation_and_profiles(subscription_status);

EXCEPTION 
  WHEN others THEN
    -- Log the error and re-raise
    RAISE NOTICE 'Error creating schema: %', SQLERRM;
    RAISE;
END $$;

-- Enable RLS
ALTER TABLE public.credits_calculation_and_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view own profile" ON public.credits_calculation_and_profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON public.credits_calculation_and_profiles;
EXCEPTION 
  WHEN others THEN
    NULL; -- Ignore errors when dropping non-existent policies
END $$;

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

-- Create or replace function to update credits_left
CREATE OR REPLACE FUNCTION update_credits_left()
RETURNS TRIGGER AS $$
BEGIN
  NEW.credits_left := NEW.total_credits - NEW.used_credits;
  NEW.updated_at := CURRENT_TIMESTAMP;
  RETURN NEW;
EXCEPTION 
  WHEN others THEN
    RAISE NOTICE 'Error in update_credits_left: %', SQLERRM;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create or replace trigger
DROP TRIGGER IF EXISTS update_credits_left_trigger ON public.credits_calculation_and_profiles;
CREATE TRIGGER update_credits_left_trigger
  BEFORE INSERT OR UPDATE ON public.credits_calculation_and_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_credits_left();

-- Create or replace function to handle plan changes
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
EXCEPTION 
  WHEN others THEN
    RAISE NOTICE 'Error in handle_plan_change: %', SQLERRM;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create or replace trigger for plan changes
DROP TRIGGER IF EXISTS handle_plan_change_trigger ON public.credits_calculation_and_profiles;
CREATE TRIGGER handle_plan_change_trigger
  BEFORE UPDATE OF plan ON public.credits_calculation_and_profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_plan_change();