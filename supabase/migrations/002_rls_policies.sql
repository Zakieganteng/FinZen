-- ============================================
-- Row Level Security (RLS) Policies
-- Migration: 002_rls_policies.sql
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unlocked_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_testing_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS POLICIES
-- ============================================
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Users are created automatically via trigger (see triggers.sql)
-- No INSERT policy needed as it's handled by trigger

-- ============================================
-- TRANSACTIONS POLICIES
-- ============================================
-- Users can view their own transactions
CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own transactions
CREATE POLICY "Users can insert own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own transactions
CREATE POLICY "Users can update own transactions"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own transactions
CREATE POLICY "Users can delete own transactions"
  ON public.transactions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- BUDGETS POLICIES
-- ============================================
-- Users can view their own budgets
CREATE POLICY "Users can view own budgets"
  ON public.budgets FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own budgets
CREATE POLICY "Users can insert own budgets"
  ON public.budgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own budgets
CREATE POLICY "Users can update own budgets"
  ON public.budgets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own budgets
CREATE POLICY "Users can delete own budgets"
  ON public.budgets FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- GOALS POLICIES
-- ============================================
-- Users can view their own goals
CREATE POLICY "Users can view own goals"
  ON public.goals FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own goals
CREATE POLICY "Users can insert own goals"
  ON public.goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own goals
CREATE POLICY "Users can update own goals"
  ON public.goals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own goals
CREATE POLICY "Users can delete own goals"
  ON public.goals FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- GOAL_HISTORY POLICIES
-- ============================================
-- Users can view their own goal history
CREATE POLICY "Users can view own goal history"
  ON public.goal_history FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own goal history
CREATE POLICY "Users can insert own goal history"
  ON public.goal_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own goal history
CREATE POLICY "Users can update own goal history"
  ON public.goal_history FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own goal history
CREATE POLICY "Users can delete own goal history"
  ON public.goal_history FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- UNLOCKED_BADGES POLICIES
-- ============================================
-- Users can view their own badges
CREATE POLICY "Users can view own badges"
  ON public.unlocked_badges FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own badges
CREATE POLICY "Users can insert own badges"
  ON public.unlocked_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users cannot update or delete badges (immutable once unlocked)
-- No UPDATE or DELETE policies

-- ============================================
-- WEEKLY_CHALLENGES POLICIES
-- ============================================
-- Users can view their own challenges
CREATE POLICY "Users can view own challenges"
  ON public.weekly_challenges FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own challenges
CREATE POLICY "Users can insert own challenges"
  ON public.weekly_challenges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own challenges
CREATE POLICY "Users can update own challenges"
  ON public.weekly_challenges FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own challenges
CREATE POLICY "Users can delete own challenges"
  ON public.weekly_challenges FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- FEEDBACK POLICIES
-- ============================================
-- Users can view their own feedback
CREATE POLICY "Users can view own feedback"
  ON public.feedback FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own feedback
CREATE POLICY "Users can insert own feedback"
  ON public.feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users cannot update or delete feedback (immutable)
-- No UPDATE or DELETE policies

-- ============================================
-- AB_TESTING_METRICS POLICIES
-- ============================================
-- Users can view their own metrics
CREATE POLICY "Users can view own metrics"
  ON public.ab_testing_metrics FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own metrics
CREATE POLICY "Users can insert own metrics"
  ON public.ab_testing_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users cannot update or delete metrics (immutable)
-- No UPDATE or DELETE policies

-- ============================================
-- USER_PREFERENCES POLICIES
-- ============================================
-- Users can view their own preferences
CREATE POLICY "Users can view own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert own preferences"
  ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own preferences"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own preferences
CREATE POLICY "Users can delete own preferences"
  ON public.user_preferences FOR DELETE
  USING (auth.uid() = user_id);


