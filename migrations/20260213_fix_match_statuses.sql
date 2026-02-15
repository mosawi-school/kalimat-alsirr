-- Update status to 'finished' for all matches that have a committed_at date
-- This fixes the issue where old matches remained in 'Draft' status
UPDATE matches
SET status = 'finished'
WHERE committed_at IS NOT NULL 
  AND (status IS NULL OR status != 'finished');

-- Optional: Verify the update
-- SELECT id, team1_name, team2_name, status, committed_at FROM matches WHERE committed_at IS NOT NULL;
