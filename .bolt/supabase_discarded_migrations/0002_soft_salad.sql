/*
  # Add Stripe fields to credits_calculation_and_profiles table

  1. Changes
    - Add stripe_customer_id column
    - Add stripe_subscription_id column
    - Add subscription_status column
    - Add billing_cycle column
    - Add subscription_end_date column
*/

ALTER TABLE credits_calculation_and_profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
ADD COLUMN IF NOT EXISTS subscription_status text CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'incomplete', 'trialing')),
ADD COLUMN IF NOT EXISTS billing_cycle text CHECK (billing_cycle IN ('monthly', 'yearly')),
ADD COLUMN IF NOT EXISTS subscription_end_date timestamptz;