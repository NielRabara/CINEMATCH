-- CineMatch Database Schema
-- Run this in your Supabase SQL Editor

-- Drop existing tables if they exist (for fresh setup)
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS watchlist CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Create user_profiles table with password support
CREATE TABLE user_profiles (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  bio TEXT,
  favorite_genres TEXT[],
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create watchlist table
CREATE TABLE watchlist (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL REFERENCES user_profiles(username) ON DELETE CASCADE,
  movie_id INTEGER NOT NULL,
  movie_title VARCHAR(255) NOT NULL,
  movie_poster TEXT,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(username, movie_id)
);

-- Create messages table for global chat
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL REFERENCES user_profiles(username) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_username ON user_profiles(username);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_watchlist_username ON watchlist(username);
CREATE INDEX idx_watchlist_movie_id ON watchlist(movie_id);
CREATE INDEX idx_messages_username ON messages(username);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view all profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON user_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (auth.uid()::text = username::text);

-- RLS Policies for watchlist
CREATE POLICY "Users can view all watchlist items" ON watchlist FOR SELECT USING (true);
CREATE POLICY "Users can manage their own watchlist" ON watchlist FOR ALL USING (auth.uid()::text = username::text);

-- RLS Policies for messages
CREATE POLICY "Users can view all messages" ON messages FOR SELECT USING (true);
CREATE POLICY "Users can insert messages" ON messages FOR INSERT WITH CHECK (auth.uid()::text = username::text);
CREATE POLICY "Users can update their own messages" ON messages FOR UPDATE USING (auth.uid()::text = username::text);
CREATE POLICY "Users can delete their own messages" ON messages FOR DELETE USING (auth.uid()::text = username::text);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON user_profiles TO anon;
GRANT ALL ON watchlist TO authenticated;
GRANT ALL ON watchlist TO anon;
GRANT ALL ON messages TO authenticated;
GRANT ALL ON messages TO anon;
GRANT ALL ON user_profiles_id_seq TO authenticated;
GRANT ALL ON user_profiles_id_seq TO anon;
GRANT ALL ON watchlist_id_seq TO authenticated;
GRANT ALL ON watchlist_id_seq TO anon;
GRANT ALL ON messages_id_seq TO authenticated;
GRANT ALL ON messages_id_seq TO anon;
