-- Drop credits table and related objects
DROP TABLE IF EXISTS credits CASCADE;

-- Drop any related triggers
DROP TRIGGER IF EXISTS on_auth_user_created_credits ON auth.users;

-- Drop any related functions
DROP FUNCTION IF EXISTS handle_new_user_credits();