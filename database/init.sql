-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create execute_ddl function
CREATE OR REPLACE FUNCTION execute_ddl(ddl text)
RETURNS void AS $$
BEGIN
  EXECUTE ddl;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  plan TEXT DEFAULT 'Trial' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create credits table
CREATE TABLE IF NOT EXISTS credits (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 250,
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT positive_balance CHECK (balance >= 0)
);

-- Create credit transactions table
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  operation_type TEXT NOT NULL,
  operation_details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO profiles (id, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  
  -- Create credits record with trial period
  INSERT INTO credits (id, balance, trial_ends_at)
  VALUES (
    NEW.id,
    250, -- Initial trial credits
    TIMEZONE('utc'::text, NOW()) + INTERVAL '7 days' -- Trial ends in 7 days
  );
  
  -- Log initial credit transaction
  INSERT INTO credit_transactions (user_id, amount, operation_type, operation_details)
  VALUES (
    NEW.id,
    250,
    'trial_credit',
    jsonb_build_object('type', 'initial_trial')
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to deduct credits
CREATE OR REPLACE FUNCTION deduct_credits(
  user_id UUID,
  amount INTEGER,
  operation TEXT,
  details JSONB DEFAULT '{}'
)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance INTEGER;
  trial_end TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get current balance and trial end date
  SELECT balance, trial_ends_at 
  INTO current_balance, trial_end
  FROM credits 
  WHERE id = user_id;
  
  -- Check if trial has ended
  IF trial_end IS NOT NULL AND trial_end < NOW() THEN
    RAISE EXCEPTION 'Trial period has ended';
  END IF;
  
  -- Check if user has enough credits
  IF current_balance < amount THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;
  
  -- Deduct credits
  UPDATE credits 
  SET 
    balance = balance - amount,
    updated_at = NOW()
  WHERE id = user_id;
  
  -- Log transaction
  INSERT INTO credit_transactions (
    user_id,
    amount,
    operation_type,
    operation_details
  ) VALUES (
    user_id,
    -amount,
    operation,
    details
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audiences table
CREATE TABLE IF NOT EXISTS audiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT unique_audience_name_per_user UNIQUE(user_id, name)
);

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  audience_id UUID NOT NULL REFERENCES audiences(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  profile_url TEXT NOT NULL,
  headline TEXT,
  source_operation TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create function to check lead limits
CREATE OR REPLACE FUNCTION check_lead_limit()
RETURNS TRIGGER AS $$
DECLARE
  user_plan TEXT;
  lead_count INTEGER;
  max_leads INTEGER;
BEGIN
  -- Get user's plan
  SELECT plan INTO user_plan
  FROM profiles
  WHERE id = NEW.user_id;
  
  IF user_plan IS NULL THEN
    user_plan := 'Trial';
  END IF;

  -- Get current lead count
  SELECT COUNT(*) INTO lead_count
  FROM leads
  WHERE user_id = NEW.user_id;

  -- Set max leads based on plan
  max_leads := CASE user_plan
    WHEN 'Trial' THEN 10000
    WHEN 'Starter' THEN 10000
    WHEN 'Explorer' THEN 10000
    WHEN 'Pro' THEN 10000
    ELSE 0
  END;

  -- Check if adding this lead would exceed the limit
  IF lead_count >= max_leads THEN
    RAISE EXCEPTION 'Lead limit reached for % plan (% leads). Please upgrade to add more leads.', user_plan, max_leads;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for lead limit check
CREATE TRIGGER check_lead_limit_before_insert
  BEFORE INSERT ON leads
  FOR EACH ROW
  EXECUTE FUNCTION check_lead_limit();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_audience_id ON leads(audience_id);
CREATE INDEX IF NOT EXISTS idx_audiences_user_id ON audiences(user_id);

-- Create webhooks table
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  auth_type TEXT NOT NULL DEFAULT 'none',
  auth_value TEXT,
  method TEXT NOT NULL DEFAULT 'POST',
  headers JSONB DEFAULT '{"Content-Type": "application/json"}',
  retry_attempts INTEGER NOT NULL DEFAULT 3,
  retry_delay INTEGER NOT NULL DEFAULT 1000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT unique_webhook_name_per_user UNIQUE(user_id, name)
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_webhook_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating timestamp
CREATE TRIGGER update_webhooks_updated_at
  BEFORE UPDATE ON webhooks
  FOR EACH ROW
  EXECUTE FUNCTION update_webhook_updated_at();