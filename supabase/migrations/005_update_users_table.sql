-- ============================================
-- Update Users Table untuk Custom Auth
-- Migration: 005_update_users_table.sql
-- ============================================

-- Drop foreign key constraint ke auth.users
ALTER TABLE IF EXISTS public.users 
  DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Drop unique constraint on id (karena kita akan generate sendiri)
ALTER TABLE IF EXISTS public.users 
  DROP CONSTRAINT IF EXISTS users_id_key;

-- Add password column
ALTER TABLE IF EXISTS public.users 
  ADD COLUMN IF NOT EXISTS password TEXT NOT NULL DEFAULT '';

-- Change id to be auto-generated UUID (tidak reference auth.users lagi)
-- Drop existing id column constraint
ALTER TABLE IF EXISTS public.users 
  ALTER COLUMN id DROP DEFAULT;

-- Set id to generate UUID
ALTER TABLE IF EXISTS public.users 
  ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Add unique constraint on email instead
ALTER TABLE IF EXISTS public.users 
  ADD CONSTRAINT users_email_unique UNIQUE(email);

-- Update all foreign key references
-- Transactions
ALTER TABLE IF EXISTS public.transactions 
  DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;

ALTER TABLE IF EXISTS public.transactions 
  ADD CONSTRAINT transactions_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Budgets
ALTER TABLE IF EXISTS public.budgets 
  DROP CONSTRAINT IF EXISTS budgets_user_id_fkey;

ALTER TABLE IF EXISTS public.budgets 
  ADD CONSTRAINT budgets_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Goals
ALTER TABLE IF EXISTS public.goals 
  DROP CONSTRAINT IF EXISTS goals_user_id_fkey;

ALTER TABLE IF EXISTS public.goals 
  ADD CONSTRAINT goals_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Goal History
ALTER TABLE IF EXISTS public.goal_history 
  DROP CONSTRAINT IF EXISTS goal_history_user_id_fkey;

ALTER TABLE IF EXISTS public.goal_history 
  ADD CONSTRAINT goal_history_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Unlocked Badges
ALTER TABLE IF EXISTS public.unlocked_badges 
  DROP CONSTRAINT IF EXISTS unlocked_badges_user_id_fkey;

ALTER TABLE IF EXISTS public.unlocked_badges 
  ADD CONSTRAINT unlocked_badges_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Weekly Challenges
ALTER TABLE IF EXISTS public.weekly_challenges 
  DROP CONSTRAINT IF EXISTS weekly_challenges_user_id_fkey;

ALTER TABLE IF EXISTS public.weekly_challenges 
  ADD CONSTRAINT weekly_challenges_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Feedback
ALTER TABLE IF EXISTS public.feedback 
  DROP CONSTRAINT IF EXISTS feedback_user_id_fkey;

ALTER TABLE IF EXISTS public.feedback 
  ADD CONSTRAINT feedback_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- AB Testing Metrics
ALTER TABLE IF EXISTS public.ab_testing_metrics 
  DROP CONSTRAINT IF EXISTS ab_testing_metrics_user_id_fkey;

ALTER TABLE IF EXISTS public.ab_testing_metrics 
  ADD CONSTRAINT ab_testing_metrics_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- User Preferences
ALTER TABLE IF EXISTS public.user_preferences 
  DROP CONSTRAINT IF EXISTS user_preferences_user_id_fkey;

ALTER TABLE IF EXISTS public.user_preferences 
  ADD CONSTRAINT user_preferences_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Drop trigger yang auto-create user dari auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

