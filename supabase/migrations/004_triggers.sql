-- ============================================
-- Database Triggers
-- Migration: 004_triggers.sql
-- ============================================

-- ============================================
-- FUNCTION: Update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Create user profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: Auto-create user profile on signup
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- TRIGGERS: Auto-update updated_at
-- ============================================

-- Users table
DROP TRIGGER IF EXISTS set_updated_at_users ON public.users;
CREATE TRIGGER set_updated_at_users
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Transactions table
DROP TRIGGER IF EXISTS set_updated_at_transactions ON public.transactions;
CREATE TRIGGER set_updated_at_transactions
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Budgets table
DROP TRIGGER IF EXISTS set_updated_at_budgets ON public.budgets;
CREATE TRIGGER set_updated_at_budgets
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Goals table
DROP TRIGGER IF EXISTS set_updated_at_goals ON public.goals;
CREATE TRIGGER set_updated_at_goals
  BEFORE UPDATE ON public.goals
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Weekly challenges table
DROP TRIGGER IF EXISTS set_updated_at_weekly_challenges ON public.weekly_challenges;
CREATE TRIGGER set_updated_at_weekly_challenges
  BEFORE UPDATE ON public.weekly_challenges
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- User preferences table
DROP TRIGGER IF EXISTS set_updated_at_user_preferences ON public.user_preferences;
CREATE TRIGGER set_updated_at_user_preferences
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- FUNCTION: Update goal saved amount on history insert
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_goal_history_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the goal's saved amount
  UPDATE public.goals
  SET saved = saved + NEW.amount,
      updated_at = NOW()
  WHERE id = NEW.goal_id;
  
  -- Check if goal is completed
  UPDATE public.goals
  SET completed = TRUE,
      updated_at = NOW()
  WHERE id = NEW.goal_id
    AND saved >= target
    AND completed = FALSE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Auto-update goal saved on history insert
-- ============================================
DROP TRIGGER IF EXISTS on_goal_history_insert ON public.goal_history;
CREATE TRIGGER on_goal_history_insert
  AFTER INSERT ON public.goal_history
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_goal_history_insert();

-- ============================================
-- FUNCTION: Calculate budget spent from transactions
-- ============================================
CREATE OR REPLACE FUNCTION public.update_budget_spent()
RETURNS TRIGGER AS $$
BEGIN
  -- Update budget spent amount based on transactions
  UPDATE public.budgets
  SET spent_amount = (
    SELECT COALESCE(SUM(amount), 0)
    FROM public.transactions
    WHERE user_id = NEW.user_id
      AND category = NEW.category
      AND date >= DATE_TRUNC('month', NEW.date)::DATE
      AND date < (DATE_TRUNC('month', NEW.date) + INTERVAL '1 month')::DATE
  ),
  updated_at = NOW()
  WHERE user_id = NEW.user_id
    AND category_name = NEW.category
    AND year_month = TO_CHAR(NEW.date, 'YYYY-MM');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Auto-update budget spent on transaction insert/update/delete
-- ============================================
DROP TRIGGER IF EXISTS on_transaction_budget_update ON public.transactions;
CREATE TRIGGER on_transaction_budget_update
  AFTER INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_budget_spent();


