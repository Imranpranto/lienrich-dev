/*
  # Credits and Subscription System

  1. New Tables
    - `credits_calculation_and_profiles`
      - Stores user profiles, credits, and subscription info
      - Includes trial period tracking
      - Handles credit calculations
    - `credit_transactions`
      - Records all credit usage
      - Tracks transaction history
      - Provides audit trail

  2. Security
    - Enable RLS on all tables
    - Add policies for user access
    - Secure credit operations

  3. Changes
    - Add triggers for credit calculations
    - Add functions for subscription management
    - Add constraints for data integrity
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create credits_calculation_and_profiles table
CREATE TABLE IF NOT EXISTS credits_calculation_and_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  display_name text,
  plan text DEFAULT 'Trial' NOT NULL,
  total_credits integer DEFAULT 250 NOT NULL,
  used_credits integer DEFAULT 0 NOT NULL,
  credits_left integer DEFAULT 250 NOT NULL,
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'incomplete', 'trialing')),
  billing_cycle text CHECK (billing_cycle IN ('monthly', 'yearly')),
  subscription_start_at timestamptz,
  subscription_end_at timestamptz,
  trial_ends_at timestamptz DEFAULT (now() + interval '7 days'),
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT positive_credits CHECK (credits_left >= 0)
);

-- Create credit_transactions table
CREATE TABLE IF NOT EXISTS credit_transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  amount integer NOT NULL,
  operation_type text NOT NULL,
  operation_details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE credits_calculation_and_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for credits_calculation_and_profiles
CREATE POLICY "Users can view own profile"
  ON credits_calculation_and_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON credits_calculation_and_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create RLS policies for credit_transactions
CREATE POLICY "Users can view own transactions"
  ON credit_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

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
CREATE TRIGGER update_credits_left_trigger
  BEFORE INSERT OR UPDATE ON credits_calculation_and_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_credits_left();

-- Create function to handle plan changes
CREATE OR REPLACE FUNCTION handle_plan_change()
RETURNS TRIGGER AS $$
DECLARE
  additional_credits INTEGER;
BEGIN
  -- Keep track of used credits
  NEW.used_credits := OLD.used_credits;
  
  -- Calculate additional credits based on new plan
  additional_credits := CASE NEW.plan
    WHEN 'Trial' THEN 250
    WHEN 'Starter' THEN 1000
    WHEN 'Explorer' THEN 2800
    WHEN 'Pro' THEN 6000
    ELSE NEW.total_credits
  END;

  -- Set new total credits
  NEW.total_credits := additional_credits;
  
  -- Handle subscription dates
  IF NEW.plan != 'Trial' THEN
    NEW.subscription_start_at := CURRENT_TIMESTAMP;
    NEW.subscription_end_at := CURRENT_TIMESTAMP + INTERVAL '30 days';
    NEW.trial_ends_at := NULL;
  END IF;
  
  -- Update remaining credits
  NEW.credits_left := NEW.total_credits - NEW.used_credits;
  NEW.updated_at := CURRENT_TIMESTAMP;
  
  -- Log the plan change
  INSERT INTO credit_transactions (
    user_id,
    amount,
    operation_type,
    operation_details
  ) VALUES (
    NEW.id,
    NEW.total_credits - OLD.total_credits,
    'plan_change',
    jsonb_build_object(
      'from_plan', OLD.plan,
      'to_plan', NEW.plan,
      'previous_credits', OLD.total_credits,
      'new_credits', NEW.total_credits
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for plan changes
CREATE TRIGGER handle_plan_change_trigger
  BEFORE UPDATE OF plan ON credits_calculation_and_profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_plan_change();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile with trial credits
  INSERT INTO credits_calculation_and_profiles (
    id,
    email,
    plan,
    total_credits,
    used_credits,
    credits_left,
    trial_ends_at
  ) VALUES (
    NEW.id,
    NEW.email,
    'Trial',
    250,
    0,
    250,
    CURRENT_TIMESTAMP + INTERVAL '7 days'
  );
  
  -- Log initial credit transaction
  INSERT INTO credit_transactions (
    user_id,
    amount,
    operation_type,
    operation_details
  ) VALUES (
    NEW.id,
    250,
    'trial_credit',
    jsonb_build_object('type', 'initial_trial')
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_credits_stripe_customer ON credits_calculation_and_profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_credits_subscription ON credits_calculation_and_profiles(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_credits_status ON credits_calculation_and_profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created ON credit_transactions(created_at);