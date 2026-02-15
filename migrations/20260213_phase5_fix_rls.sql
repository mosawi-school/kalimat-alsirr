-- Enable RLS on the table
ALTER TABLE season_used_questions ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (SELECT, INSERT, UPDATE, DELETE) for all users (anon and authenticated)
-- This is the MVP fix to ensure the application can write to this table.
-- In a production environment with proper auth, this should be restricted.
CREATE POLICY "allow_all_season_used"
ON season_used_questions
FOR ALL
USING (true)
WITH CHECK (true);

-- Ensure the policy is applied
GRANT ALL ON season_used_questions TO anon;
GRANT ALL ON season_used_questions TO authenticated;
GRANT ALL ON season_used_questions TO service_role;
