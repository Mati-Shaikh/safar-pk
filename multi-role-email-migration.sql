-- Migration to allow same email for different roles
-- This removes the UNIQUE constraint on email alone and adds a composite unique constraint on (email, role)

-- Step 1: Drop the existing UNIQUE constraint on email
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_email_key;

-- Step 2: Add a composite UNIQUE constraint on (email, role)
-- This allows the same email to be used for different roles
ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_email_role_unique UNIQUE (email, role);

-- Step 3: Add index for better query performance on email lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- Step 4: Add index for role-based queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Step 5: Add index for email+role lookups (if not automatically created by the unique constraint)
CREATE INDEX IF NOT EXISTS idx_user_profiles_email_role ON user_profiles(email, role);
