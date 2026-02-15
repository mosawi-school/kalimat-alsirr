-- 1. Force Schema Cache Reload (Crucial for PostgREST to see new columns)
NOTIFY pgrst, 'reload config';

-- 2. Ensure season_used_questions has the correct structure (idempotent)
DO $$
BEGIN
    -- Enable RLS if not enabled
    ALTER TABLE season_used_questions ENABLE ROW LEVEL SECURITY;

    -- Add used_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'season_used_questions' AND column_name = 'used_at') THEN
        ALTER TABLE season_used_questions ADD COLUMN used_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
    END IF;

    -- Add created_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'season_used_questions' AND column_name = 'created_at') THEN
        ALTER TABLE season_used_questions ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
    END IF;
END $$;

-- 3. Re-apply permissions just in case
GRANT ALL ON season_used_questions TO anon;
GRANT ALL ON season_used_questions TO authenticated;
GRANT ALL ON season_used_questions TO service_role;

-- 4. Check if policy exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'season_used_questions' 
        AND policyname = 'allow_all_season_used'
    ) THEN
        CREATE POLICY "allow_all_season_used"
        ON season_used_questions
        FOR ALL
        USING (true)
        WITH CHECK (true);
    END IF;
END $$;
