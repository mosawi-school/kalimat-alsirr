-- ============================================================
-- Kalimat Al-Sirr — Database Schema
-- ============================================================
-- Phase 0: Foundation Tables
-- تشغيل هذا الملف في Supabase SQL Editor
-- ============================================================

-- Enable pgcrypto extension for UUID generation
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1) Admin Users (Authentication)
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, -- bcrypt hashed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster login lookup
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
  letter TEXT NOT NULL, -- الحرف (مثل "أ")
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT chk_questions_letter_len CHECK (char_length(letter) = 1)
);

-- Index for faster filtering by letter
CREATE INDEX IF NOT EXISTS idx_questions_letter ON questions(letter);

-- 4) Matches (المباريات)
-- ============================================================
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  team1_name TEXT NOT NULL,
  team2_name TEXT NOT NULL,
  secret_word_display TEXT NOT NULL, -- كلمة السر للعرض (بالشكل الأصلي)
  secret_word_normalized TEXT NOT NULL, -- كلمة السر المعالَجة (للمقارنة)
  shuffled_letters JSONB NOT NULL, -- ترتيب التبعثر [3,1,4,2,...]
  status TEXT NOT NULL DEFAULT 'draft', -- draft | ready | live | finished
  winner TEXT, -- team1 | team2 | null
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT chk_status CHECK (status IN ('draft', 'ready', 'live', 'finished')),
  CONSTRAINT chk_winner CHECK (winner IN ('team1', 'team2') OR winner IS NULL)
);

-- Index for filtering by season and status
CREATE INDEX IF NOT EXISTS idx_matches_season_id ON matches(season_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);

-- 5) Match Questions (أسئلة المباراة)
-- ============================================================
-- سؤال واحد لكل حرف في المباراة (مو لكل position)
CREATE TABLE IF NOT EXISTS match_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  original_question_id UUID REFERENCES questions(id) ON DELETE SET NULL, -- nullable: إذا من المكتبة
  question_text TEXT NOT NULL, -- نسخة المباراة
  answer_text TEXT NOT NULL, -- نسخة المباراة
  letter TEXT NOT NULL, -- الحرف
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(match_id, letter), -- لضمان سؤال واحد لكل حرف في المباراة
  CONSTRAINT chk_match_questions_letter_len CHECK (char_length(letter) = 1)
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_match_questions_match_id ON match_questions(match_id);
CREATE INDEX IF NOT EXISTS idx_match_questions_match_id_letter ON match_questions(match_id, letter);

-- 6) Season Used Questions (منع التكرار داخل الموسم)
-- ============================================================
-- يُملأ عند Commit المباراة (End Match)
CREATE TABLE IF NOT EXISTS season_used_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  committed_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(season_id, question_id) -- منع استخدام نفس السؤال مرتين في نفس الموسم
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_season_used_questions_season_id ON season_used_questions(season_id);
CREATE INDEX IF NOT EXISTS idx_season_used_questions_question_id ON season_used_questions(question_id);

-- ============================================================
-- ملاحظات مهمة:
-- ============================================================
-- 1) استخدمنا admin_users مع password hashing بدل Supabase Auth لسهولة التنفيذ
-- 2) match_questions: سؤال واحد لكل حرف (مو لكل position) — UNIQUE(match_id, letter)
-- 3) secret_word_display للعرض + secret_word_normalized للمقارنة الداخلية
-- 4) season_used_questions: جدول منفصل بدل JSONB لضمان منع التكرار بـ UNIQUE constraint
-- 5) عند "Edit question" في Match Creator: نعدّل question_text/answer_text فقط،
--    original_question_id يظل كما هو (ما نعدّل السؤال الأصلي في المكتبة)
-- 6) Arabic normalization (دمج الحروف) راح يصير في الكود، مو داخل Database
-- ============================================================
