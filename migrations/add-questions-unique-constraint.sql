-- ============================================================
-- Add Unique Constraint for Upsert Support
-- ============================================================
-- This adds a unique constraint on (letter, question) for upsert operations
-- Run this in Supabase SQL Editor
-- ============================================================

-- Create unique index on letter + question
-- This allows upsert to work properly
CREATE UNIQUE INDEX IF NOT EXISTS idx_questions_letter_question 
ON questions(letter, question);

-- Note: If you want to include season_id in the future when questions 
-- are scoped per season, you would need to:
-- 1. Add season_id column to questions table
-- 2. Drop this index
-- 3. Create new index: CREATE UNIQUE INDEX idx_questions_season_letter_question 
--    ON questions(season_id, letter, question);
--
-- For now, questions are global across all seasons.
