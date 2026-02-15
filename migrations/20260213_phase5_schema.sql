-- Create season_used_questions table if it doesn't exist
CREATE TABLE IF NOT EXISTS season_used_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add unique constraint to prevent duplicate entries for the same question in the SAME SEASON
-- Using DO block for idempotency (safe to run multiple times)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'season_used_questions_season_question_unique'
    ) THEN
        ALTER TABLE season_used_questions 
        ADD CONSTRAINT season_used_questions_season_question_unique UNIQUE (season_id, question_id);
    END IF;
END $$;

-- Add committed_at column to matches table if it doesn't exist
-- Using DO block for idempotency
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'committed_at') THEN
        ALTER TABLE matches ADD COLUMN committed_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;
