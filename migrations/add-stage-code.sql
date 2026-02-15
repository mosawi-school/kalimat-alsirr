-- ============================================================
-- Add stage_code column to matches table
-- ============================================================
-- This adds a 4-digit stage code for easy manual entry on smart screens
-- instead of long UUIDs
-- ============================================================

-- Add stage_code column
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS stage_code TEXT;

-- Create unique index on stage_code
CREATE UNIQUE INDEX IF NOT EXISTS idx_matches_stage_code 
ON matches(stage_code);

-- Note: Existing matches will have NULL stage_code
-- New matches will auto-generate a 4-digit code in the application
