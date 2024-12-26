/*
  # Fix Stripe integration schema

  1. Changes
    - Add Stripe-related columns in correct order
    - Create indexes after columns exist
    - Add proper constraints
*/

-- Wrap in a DO block for better error handling
DO $$ 
BEGIN
  -- First add the columns if they don't exist
  ALTER TABLE credits_calculation_and_profiles
    ADD COLUMN IF NOT EXISTS stripe_customer_id text,
    ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
    ADD COLUMN IF NOT EXISTS subscription_status text,
    ADD COLUMN IF NOT EXISTS billing_cycle text,
    ADD COLUMN IF NOT EXISTS subscription_end_date timestamptz;

  -- Add constraints after columns exist
  ALTER TABLE credits_calculation_and_profiles
    ADD CONSTRAINT check_subscription_status 
    CHECK (subscription_status IS NULL OR subscription_status IN ('active', 'canceled', 'past_due', 'incomplete', 'trialing'))
    NOT VALID;

  ALTER TABLE credits_calculation_and_profiles
    ADD CONSTRAINT check_billing_cycle 
    CHECK (billing_cycle IS NULL OR billing_cycle IN ('monthly', 'yearly'))
    NOT VALID;

  -- Create indexes after columns exist
  CREATE INDEX IF NOT EXISTS idx_credits_stripe_customer 
    ON credits_calculation_and_profiles(stripe_customer_id)
    WHERE stripe_customer_id IS NOT NULL;

  CREATE INDEX IF NOT EXISTS idx_credits_subscription 
    ON credits_calculation_and_profiles(stripe_subscription_id)
    WHERE stripe_subscription_id IS NOT NULL;

  CREATE INDEX IF NOT EXISTS idx_credits_status 
    ON credits_calculation_and_profiles(subscription_status)
    WHERE subscription_status IS NOT NULL;

EXCEPTION 
  WHEN others THEN
    RAISE NOTICE 'Error in migration: %', SQLERRM;
    RAISE;
END $$;