-- Fix RLS for questions table
-- Questions should be publicly readable, so we'll disable RLS on this table

-- Disable RLS on questions table
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;

-- Drop the existing policy (if it exists)
DROP POLICY IF EXISTS "Questions are viewable by authenticated users" ON questions;

-- Verify the change
SELECT 
    schemaname, 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE tablename = 'questions'; 