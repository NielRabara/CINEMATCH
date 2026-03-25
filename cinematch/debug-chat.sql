-- Debug Chat Issues
-- Run these queries in your Supabase SQL Editor to test

-- 1. Check if messages table exists and has data
SELECT COUNT(*) as message_count FROM messages;

-- 2. Check recent messages
SELECT * FROM messages ORDER BY created_at DESC LIMIT 5;

-- 3. Check if RLS policies exist
SELECT schemaname, tablename, policyname, permissive, roles 
FROM pg_policies 
WHERE tablename = 'messages';

-- 4. Test inserting a message (replace 'tester1' with your username)
INSERT INTO messages (username, content, created_at) 
VALUES ('tester1', 'Test message from SQL', NOW());

-- 5. Check if message was inserted
SELECT * FROM messages WHERE username = 'tester1' ORDER BY created_at DESC LIMIT 1;
