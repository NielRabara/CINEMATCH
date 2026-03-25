-- Migration: Add password_hash column to user_profiles table
-- Run this in your Supabase SQL Editor

-- Add password_hash column to user_profiles table
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Make email column required (if not already)
ALTER TABLE user_profiles ALTER COLUMN email SET NOT NULL;

-- Add unique constraint for email (if not already exists)
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_email_key UNIQUE (email);

-- Update existing policies to handle password authentication
DROP POLICY IF EXISTS "Allow users to insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON user_profiles;

-- Create new policies for better security
CREATE POLICY "Allow users to read all profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Allow users to insert own profile" ON user_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow users to update their own profile" ON user_profiles FOR UPDATE USING (auth.uid()::text = username::text);

-- Grant necessary permissions
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON user_profiles TO anon;

-- Create index for email for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
