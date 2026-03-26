-- Create watch_parties table for real-time sync
CREATE TABLE IF NOT EXISTS watch_parties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id VARCHAR(10) UNIQUE NOT NULL,
  video_id VARCHAR(50) NOT NULL,
  host_id TEXT NOT NULL,
  playback_time FLOAT DEFAULT 0,
  is_playing BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime for watch_parties table
ALTER PUBLICATION supabase_realtime ADD TABLE watch_parties;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_watch_parties_room_id ON watch_parties(room_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_watch_parties_updated_at 
    BEFORE UPDATE ON watch_parties 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Ensure messages table has Realtime enabled (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'messages') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;
END $$;
