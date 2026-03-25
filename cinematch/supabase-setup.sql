-- Create messages table for global chat
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Allow all users to read messages
CREATE POLICY "Allow all users to read messages" ON messages
  FOR SELECT USING (true);

-- Allow all users to insert messages
CREATE POLICY "Allow all users to insert messages" ON messages
  FOR INSERT WITH CHECK (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages (created_at DESC);

-- Create reviews table for movie reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  movie_id INTEGER NOT NULL,
  username TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  sentiment_label TEXT CHECK (sentiment_label IN ('Positive', 'Neutral', 'Negative')),
  sentiment_emoji TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Allow all users to read reviews
CREATE POLICY "Allow all users to read reviews" ON reviews
  FOR SELECT USING (true);

-- Allow all users to insert reviews
CREATE POLICY "Allow all users to insert reviews" ON reviews
  FOR INSERT WITH CHECK (true);

-- Allow users to update their own reviews
CREATE POLICY "Allow users to update own reviews" ON reviews
  FOR UPDATE USING (auth.uid()::text = username);

-- Allow users to delete their own reviews
CREATE POLICY "Allow users to delete own reviews" ON reviews
  FOR DELETE USING (auth.uid()::text = username);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_movie_id ON reviews (movie_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_username ON reviews (username);

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  favorite_genres TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for user profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read all profiles
CREATE POLICY "Allow all users to read profiles" ON user_profiles
  FOR SELECT USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Allow users to insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid()::text = username);

-- Allow users to update their own profile
CREATE POLICY "Allow users to update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid()::text = username);

-- Create indexes for user profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles (username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles (created_at DESC);

-- Create user watchlist table
CREATE TABLE IF NOT EXISTS watchlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  movie_id INTEGER NOT NULL,
  movie_title TEXT NOT NULL,
  movie_poster TEXT,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(username, movie_id)
);

-- Enable Row Level Security for watchlist
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own watchlist
CREATE POLICY "Allow users to read own watchlist" ON watchlist
  FOR SELECT USING (auth.uid()::text = username);

-- Allow users to insert into their watchlist
CREATE POLICY "Allow users to insert into watchlist" ON watchlist
  FOR INSERT WITH CHECK (auth.uid()::text = username);

-- Allow users to delete from their watchlist
CREATE POLICY "Allow users to delete from watchlist" ON watchlist
  FOR DELETE USING (auth.uid()::text = username);

-- Create indexes for watchlist
CREATE INDEX IF NOT EXISTS idx_watchlist_username ON watchlist (username);
CREATE INDEX IF NOT EXISTS idx_watchlist_movie_id ON watchlist (movie_id);
