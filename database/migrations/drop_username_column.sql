-- Drop username column from profiles table
ALTER TABLE profiles DROP COLUMN IF EXISTS username;

-- Drop any unique constraints related to username
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_username_key;