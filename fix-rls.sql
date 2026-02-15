-- ============================================================
-- Reset Database Schema (Fix Incorrect Tables)
-- ============================================================
-- Run this in Supabase SQL Editor to fix schema issues
-- ============================================================

-- Step 1: DROP all existing tables (in correct order due to foreign keys)
-- ============================================================
DROP TABLE IF EXISTS season_used_questions CASCADE;
DROP TABLE IF EXISTS match_questions CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS seasons CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;

-- Step 2: Enable pgcrypto extension
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Step 3: Create tables with correct schema
-- ============================================================

-- 1) Admin Users (Authentication)
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);

-- 2) Seasons (أرشفة المباريات)
-- ============================================================
CREATE TABLE IF NOT EXISTS seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3) Questions Library (مكتبة الأسئلة)
-- ============================================================
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  letter TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT chk_questions_letter_len CHECK (char_length(letter) = 1)
);

CREATE INDEX IF NOT EXISTS idx_questions_letter ON questions(letter);

-- 4) Matches (المباريات)
-- ============================================================
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  team1_name TEXT NOT NULL,
  team2_name TEXT NOT NULL,
  secret_word_display TEXT NOT NULL,
  secret_word_normalized TEXT NOT NULL,
  shuffled_letters JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  winner TEXT,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT chk_status CHECK (status IN ('draft', 'ready', 'live', 'finished')),
  CONSTRAINT chk_winner CHECK (winner IN ('team1', 'team2') OR winner IS NULL)
);

CREATE INDEX IF NOT EXISTS idx_matches_season_id ON matches(season_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);

-- 5) Match Questions (أسئلة المباراة)
-- ============================================================
CREATE TABLE IF NOT EXISTS match_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  original_question_id UUID REFERENCES questions(id) ON DELETE SET NULL,
  question_text TEXT NOT NULL,
  answer_text TEXT NOT NULL,
  letter TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(match_id, letter),
  CONSTRAINT chk_match_questions_letter_len CHECK (char_length(letter) = 1)
);

CREATE INDEX IF NOT EXISTS idx_match_questions_match_id ON match_questions(match_id);
CREATE INDEX IF NOT EXISTS idx_match_questions_match_id_letter ON match_questions(match_id, letter);

-- 6) Season Used Questions (منع التكرار داخل الموسم)
-- ============================================================
CREATE TABLE IF NOT EXISTS season_used_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  committed_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(season_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_season_used_questions_season_id ON season_used_questions(season_id);
CREATE INDEX IF NOT EXISTS idx_season_used_questions_question_id ON season_used_questions(question_id);

-- Step 4: Disable RLS for MVP
-- ============================================================
ALTER TABLE seasons DISABLE ROW LEVEL SECURITY;
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE match_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE season_used_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- Done! Tables are now correctly created
-- ============================================================
