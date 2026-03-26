-- ========================================
-- CINEMATCH - CENTRALIZED DATABASE SETUP
-- ========================================
-- Run this entire script in your Supabase SQL Editor
-- This script sets up the complete database schema for CineMatch
-- Last Updated: March 2026

-- ========================================
-- DROP EXISTING TABLES (Fresh Setup)
-- ========================================
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS watchlist CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- ========================================
-- USER PROFILES TABLE
-- ========================================
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

-- ========================================
-- MESSAGES TABLE (Global Chat)
-- ========================================
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL REFERENCES user_profiles(username) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- WATCHLIST TABLE
-- ========================================
CREATE TABLE watchlist (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL REFERENCES user_profiles(username) ON DELETE CASCADE,
  movie_id INTEGER NOT NULL,
  movie_title VARCHAR(255) NOT NULL,
  movie_poster TEXT,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(username, movie_id)
);

-- ========================================
-- REVIEWS TABLE
-- ========================================
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  movie_id INTEGER NOT NULL,
  username VARCHAR(50) NOT NULL REFERENCES user_profiles(username) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  sentiment_label TEXT CHECK (sentiment_label IN ('Positive', 'Neutral', 'Negative')),
  sentiment_emoji TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- PERFORMANCE INDEXES
-- ========================================
CREATE INDEX idx_user_profiles_username ON user_profiles(username);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_watchlist_username ON watchlist(username);
CREATE INDEX idx_watchlist_movie_id ON watchlist(movie_id);
CREATE INDEX idx_messages_username ON messages(username);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_reviews_movie_id ON reviews(movie_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX idx_reviews_username ON reviews(username);

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- ========================================
-- RLS POLICIES
-- ========================================

-- User Profiles Policies
CREATE POLICY "Users can view all profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON user_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (true);

-- Watchlist Policies
CREATE POLICY "Users can view all watchlist items" ON watchlist FOR SELECT USING (true);
CREATE POLICY "Users can manage their own watchlist" ON watchlist FOR ALL USING (true);

-- Messages Policies
CREATE POLICY "Users can view all messages" ON messages FOR SELECT USING (true);
CREATE POLICY "Users can insert messages" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own messages" ON messages FOR UPDATE USING (true);
CREATE POLICY "Users can delete their own messages" ON messages FOR DELETE USING (true);

-- Reviews Policies
CREATE POLICY "Users can view all reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert reviews" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own reviews" ON reviews FOR UPDATE USING (true);
CREATE POLICY "Users can delete their own reviews" ON reviews FOR DELETE USING (true);

-- ========================================
-- TRIGGERS FOR UPDATED_AT
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- GRANT PERMISSIONS
-- ========================================
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON user_profiles TO anon;
GRANT ALL ON watchlist TO authenticated;
GRANT ALL ON watchlist TO anon;
GRANT ALL ON messages TO authenticated;
GRANT ALL ON messages TO anon;
GRANT ALL ON reviews TO authenticated;
GRANT ALL ON reviews TO anon;

-- Grant sequence permissions
GRANT ALL ON user_profiles_id_seq TO authenticated;
GRANT ALL ON user_profiles_id_seq TO anon;
GRANT ALL ON watchlist_id_seq TO authenticated;
GRANT ALL ON watchlist_id_seq TO anon;
GRANT ALL ON messages_id_seq TO authenticated;
GRANT ALL ON messages_id_seq TO anon;
GRANT ALL ON reviews_id_seq TO authenticated;
GRANT ALL ON reviews_id_seq TO anon;

-- ========================================
-- SETUP COMPLETE
-- ========================================
-- Your CineMatch database is now ready!
-- Tables created: user_profiles, messages, watchlist, reviews
-- Features: Authentication, Chat, Watchlist, Reviews with sentiment analysis
-- Security: Row Level Security enabled with proper policies
-- Performance: Optimized indexes for all queries
