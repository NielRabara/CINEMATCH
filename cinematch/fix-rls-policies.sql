-- Fix RLS Policies for password-based authentication
-- Run this in your Supabase SQL Editor

-- Drop existing policies that are causing issues
DROP POLICY IF EXISTS "Allow users to read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow users to insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON user_profiles;

-- Create new policies that allow password-based authentication
-- Since we're not using Supabase Auth, we need more permissive policies
CREATE POLICY "Allow all operations on user_profiles" ON user_profiles FOR ALL USING (true);

-- Fix watchlist policies too
DROP POLICY IF EXISTS "Allow users to read own watchlist" ON watchlist;
DROP POLICY IF EXISTS "Allow users to insert into watchlist" ON watchlist;
DROP POLICY IF EXISTS "Allow users to delete from watchlist" ON watchlist;

CREATE POLICY "Allow all operations on watchlist" ON watchlist FOR ALL USING (true);

-- Fix messages policies
DROP POLICY IF EXISTS "Allow all users to read messages" ON messages;
DROP POLICY IF EXISTS "Allow all users to insert messages" ON messages;

CREATE POLICY "Allow all operations on messages" ON messages FOR ALL USING (true);

-- Fix reviews policies
DROP POLICY IF EXISTS "Allow all users to read reviews" ON reviews;
DROP POLICY IF EXISTS "Allow all users to insert reviews" ON reviews;
DROP POLICY IF EXISTS "Allow users to update own reviews" ON reviews;
DROP POLICY IF EXISTS "Allow users to delete own reviews" ON reviews;

CREATE POLICY "Allow all operations on reviews" ON reviews FOR ALL USING (true);

-- Grant permissions to anon and authenticated users
GRANT ALL ON user_profiles TO anon;
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON watchlist TO anon;
GRANT ALL ON watchlist TO authenticated;
GRANT ALL ON messages TO anon;
GRANT ALL ON messages TO authenticated;
GRANT ALL ON reviews TO anon;
GRANT ALL ON reviews TO authenticated;
