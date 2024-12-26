/*
  # Separate Profiles and Credits Tables

  1. New Tables
    - `profiles`
      - Basic user profile information
      - Display name and email
      - Plan information
    - `credits_calculation`
      - Credit balance and calculations
      - Trial period tracking
      - Subscription details

  2. Security
    - Enable RLS on both tables
    - Add policies for user access
    - Secure credit operations

  3. Changes
    - Split functionality into separate tables
    - Maintain relationships via user ID
    - Add appropriate indexes
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  display_name text,
  plan text DEFAULT 'Trial' NOT NULL,
  stripe_customer_id text,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create credits calculation table
CREATE TABLE IF NOT EXISTS credits_calculation (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  total_credits integer DEFAULT 250 NOT NULL,
  used_credits integer DEFAULT 0 NOT NULL,
  credits_left integer DEFAULT 250 NOT NULL,
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

-- Create credit transactions table
CREATE TABLE IF NOT EXISTS credit_transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  amount integer NOT NULL,
  operation_type text NOT NULL,
  operation_details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits_calculation ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create RLS policies for credits_calculation
CREATE POLICY "Users can view own credits"
  ON credits_calculation
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own credits"
  ON credits_calculation
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
  BEFORE INSERT OR UPDATE ON credits_calculation
  FOR EACH ROW
  EXECUTE FUNCTION update_credits_left();

-- Create function to handle plan changes
CREATE OR REPLACE FUNCTION handle_plan_change()
RETURNS TRIGGER AS $$
DECLARE
  credits_record credits_calculation%ROWTYPE;
  additional_credits INTEGER;
BEGIN
  -- Get current credits record
  SELECT * INTO credits_record
  FROM credits_calculation
  WHERE id = NEW.id;

  -- Calculate additional credits based on new plan
  additional_credits := CASE NEW.plan
    WHEN 'Trial' THEN 250
    WHEN 'Starter' THEN 1000
    WHEN 'Explorer' THEN 2800
    WHEN 'Pro' THEN 6000
    ELSE credits_record.total_credits
  END;

  -- Update credits calculation
  UPDATE credits_calculation
  SET
    total_credits = additional_credits,
    subscription_start_at = CASE 
      WHEN NEW.plan != 'Trial' THEN CURRENT_TIMESTAMP
      ELSE NULL
    END,
    subscription_end_at = CASE 
      WHEN NEW.plan != 'Trial' THEN CURRENT_TIMESTAMP + INTERVAL '30 days'
      ELSE NULL
    END,
    trial_ends_at = CASE 
      WHEN NEW.plan = 'Trial' THEN CURRENT_TIMESTAMP + INTERVAL '7 days'
      ELSE NULL
    END,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
  
  -- Log the plan change
  INSERT INTO credit_transactions (
    user_id,
    amount,
    operation_type,
    operation_details
  ) VALUES (
    NEW.id,
    additional_credits - credits_record.total_credits,
    'plan_change',
    jsonb_build_object(
      'from_plan', OLD.plan,
      'to_plan', NEW.plan,
      'previous_credits', credits_record.total_credits,
      'new_credits', additional_credits
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for plan changes
CREATE TRIGGER handle_plan_change_trigger
  AFTER UPDATE OF plan ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_plan_change();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO profiles (
    id,
    email,
    plan
  ) VALUES (
    NEW.id,
    NEW.email,
    'Trial'
  );
  
  -- Create credits record
  INSERT INTO credits_calculation (
    id,
    total_credits,
    used_credits,
    credits_left,
    trial_ends_at
  ) VALUES (
    NEW.id,
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
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_credits_subscription ON credits_calculation(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_credits_status ON credits_calculation(subscription_status);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created ON credit_transactions(created_at);