-- Fix user_profiles table schema to match application expectations
-- This migration updates column names and adds missing columns

-- Step 1: Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add full_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'user_profiles' 
                   AND column_name = 'full_name') THEN
        ALTER TABLE public.user_profiles ADD COLUMN full_name TEXT;
        -- Copy data from name to full_name if name exists
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'user_profiles' 
                   AND column_name = 'name') THEN
            UPDATE public.user_profiles SET full_name = name WHERE full_name IS NULL;
        END IF;
    END IF;

    -- Add phone_number column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'user_profiles' 
                   AND column_name = 'phone_number') THEN
        ALTER TABLE public.user_profiles ADD COLUMN phone_number TEXT;
        -- Copy data from phone to phone_number if phone exists
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'user_profiles' 
                   AND column_name = 'phone') THEN
            UPDATE public.user_profiles SET phone_number = phone WHERE phone_number IS NULL;
        END IF;
    END IF;

    -- Add password_hash column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'user_profiles' 
                   AND column_name = 'password_hash') THEN
        ALTER TABLE public.user_profiles ADD COLUMN password_hash TEXT;
    END IF;

    -- Add avatar_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'user_profiles' 
                   AND column_name = 'avatar_url') THEN
        ALTER TABLE public.user_profiles ADD COLUMN avatar_url TEXT;
    END IF;

    -- Add cnic_front_image column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'user_profiles' 
                   AND column_name = 'cnic_front_image') THEN
        ALTER TABLE public.user_profiles ADD COLUMN cnic_front_image TEXT;
    END IF;

    -- Add cnic_back_image column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'user_profiles' 
                   AND column_name = 'cnic_back_image') THEN
        ALTER TABLE public.user_profiles ADD COLUMN cnic_back_image TEXT;
    END IF;
END $$;

-- Step 2: Make full_name NOT NULL (after ensuring data is copied)
ALTER TABLE public.user_profiles ALTER COLUMN full_name SET NOT NULL;

-- Step 3: Update the email constraint to allow NULL (for phone-only accounts)
ALTER TABLE public.user_profiles ALTER COLUMN email DROP NOT NULL;

-- Step 4: Drop old columns if they exist (optional - uncomment if you want to remove old columns)
-- DO $$ 
-- BEGIN
--     IF EXISTS (SELECT 1 FROM information_schema.columns 
--                WHERE table_schema = 'public' 
--                AND table_name = 'user_profiles' 
--                AND column_name = 'name') THEN
--         ALTER TABLE public.user_profiles DROP COLUMN name;
--     END IF;
--     
--     IF EXISTS (SELECT 1 FROM information_schema.columns 
--                WHERE table_schema = 'public' 
--                AND table_name = 'user_profiles' 
--                AND column_name = 'phone') THEN
--         ALTER TABLE public.user_profiles DROP COLUMN phone;
--     END IF;
-- END $$;

-- Step 5: Update the unique constraint to work with the new schema
-- Drop the old constraint
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_email_role_unique;

-- Add new constraint that allows NULL emails (for phone-only accounts)
ALTER TABLE public.user_profiles 
ADD CONSTRAINT user_profiles_email_role_unique 
UNIQUE NULLS NOT DISTINCT (email, role);

-- Step 6: Update existing indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_phone_number ON public.user_profiles(phone_number);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);

-- Verify the schema
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_profiles'
ORDER BY ordinal_position;
