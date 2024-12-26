-- Drop unused tables and columns
DROP TABLE IF EXISTS credits CASCADE;
DROP TABLE IF EXISTS credits_calculation CASCADE;

-- Clean up profiles table
ALTER TABLE profiles 
  DROP COLUMN IF EXISTS username,
  DROP COLUMN IF EXISTS plan;