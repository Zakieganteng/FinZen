-- ============================================
-- Seed Data: Budget Problem User (User dengan Masalah Budget)
-- File: 003_user_budget_problem.sql
-- Scenario: User yang mengalami masalah keuangan - budget melebihi, goals urgent
-- User ID: GANTI_MANUAL_USER_ID_DISINI
-- ============================================
-- 
-- CASE: User yang perlu perhatian khusus
-- - Banyak transaksi yang melebihi budget
-- - Budget hampir habis atau sudah melebihi di beberapa kategori
-- - Goals dengan deadline dekat tapi progress kurang
-- - Perfect untuk demo warning, alerts, dan fitur insight
-- ============================================

DO $$
DECLARE
  v_user_id UUID := 'GANTI_MANUAL_USER_ID_DISINI'; -- ⚠️ GANTI INI!
  v_current_month TEXT := TO_CHAR(CURRENT_DATE, 'YYYY-MM');
  v_prev_month TEXT := TO_CHAR(CURRENT_DATE - INTERVAL '1 month', 'YYYY-MM');
BEGIN

-- ============================================
-- 1. TRANSACTIONS (Banyak & Melebihi Budget)
-- ============================================

-- BULAN INI - Banyak transaksi besar (melebihi budget)
INSERT INTO public.transactions (user_id, date, category, amount, note) VALUES
  (v_user_id, CURRENT_DATE, 'Makan', 50000, 'Sarapan + Kopi'),
  (v_user_id, CURRENT_DATE, 'Transportasi', 25000, 'Gojek premium'),
  (v_user_id, CURRENT_DATE - INTERVAL '1 day', 'Makan', 60000, 'Makan siang resto'),
  (v_user_id, CURRENT_DATE - INTERVAL '1 day', 'Hiburan', 150000, 'Konser musik'),
  (v_user_id, CURRENT_DATE - INTERVAL '1 day', 'Transportasi', 30000, 'Gojek'),
  (v_user_id, CURRENT_DATE - INTERVAL '2 days', 'Makan', 55000, 'Makan malam'),
  (v_user_id, CURRENT_DATE - INTERVAL '2 days', 'Hiburan', 120000, 'Shopping online'),
  (v_user_id, CURRENT_DATE - INTERVAL '3 days', 'Makan', 45000, 'Sarapan'),
  (v_user_id, CURRENT_DATE - INTERVAL '3 days', 'Transportasi', 22000, 'Gojek'),
  (v_user_id, CURRENT_DATE - INTERVAL '4 days', 'Makan', 50000, 'Makan siang'),
  (v_user_id, CURRENT_DATE - INTERVAL '4 days', 'Hiburan', 100000, 'Event ticket'),
  (v_user_id, CURRENT_DATE - INTERVAL '5 days', 'Makan', 60000, 'Makan malam'),
  (v_user_id, CURRENT_DATE - INTERVAL '5 days', 'Transportasi', 28000, 'Gojek'),
  (v_user_id, CURRENT_DATE - INTERVAL '6 days', 'Makan', 48000, 'Sarapan'),
  (v_user_id, CURRENT_DATE - INTERVAL '6 days', 'Hiburan', 130000, 'Streaming + Game'),
  (v_user_id, CURRENT_DATE - INTERVAL '7 days', 'Makan', 55000, 'Makan siang'),
  (v_user_id, CURRENT_DATE - INTERVAL '7 days', 'Transportasi', 25000, 'Gojek'),
  (v_user_id, CURRENT_DATE - INTERVAL '10 days', 'Makan', 60000, 'Makan malam'),
  (v_user_id, CURRENT_DATE - INTERVAL '10 days', 'Hiburan', 140000, 'Konser'),
  (v_user_id, CURRENT_DATE - INTERVAL '12 days', 'Makan', 50000, 'Sarapan'),
  (v_user_id, CURRENT_DATE - INTERVAL '12 days', 'Transportasi', 30000, 'Gojek'),
  (v_user_id, CURRENT_DATE - INTERVAL '15 days', 'Makan', 55000, 'Makan siang'),
  (v_user_id, CURRENT_DATE - INTERVAL '15 days', 'Hiburan', 110000, 'Shopping'),
  (v_user_id, CURRENT_DATE - INTERVAL '18 days', 'Makan', 60000, 'Makan malam'),
  (v_user_id, CURRENT_DATE - INTERVAL '18 days', 'Transportasi', 28000, 'Gojek'),
  (v_user_id, CURRENT_DATE - INTERVAL '20 days', 'Makan', 50000, 'Sarapan'),
  (v_user_id, CURRENT_DATE - INTERVAL '20 days', 'Hiburan', 120000, 'Event'),
  (v_user_id, CURRENT_DATE - INTERVAL '22 days', 'Makan', 55000, 'Makan siang'),
  (v_user_id, CURRENT_DATE - INTERVAL '22 days', 'Transportasi', 30000, 'Gojek'),
  (v_user_id, CURRENT_DATE - INTERVAL '25 days', 'Makan', 60000, 'Makan malam'),
  (v_user_id, CURRENT_DATE - INTERVAL '25 days', 'Hiburan', 130000, 'Streaming');

-- BULAN LALU - Juga banyak transaksi
INSERT INTO public.transactions (user_id, date, category, amount, note) VALUES
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '1 day', 'Makan', 50000, 'Sarapan'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '1 day', 'Transportasi', 25000, 'Gojek'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '2 days', 'Makan', 60000, 'Makan siang'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '2 days', 'Hiburan', 150000, 'Konser'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '3 days', 'Makan', 55000, 'Makan malam'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '3 days', 'Transportasi', 30000, 'Gojek'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '5 days', 'Makan', 50000, 'Sarapan'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '5 days', 'Hiburan', 120000, 'Shopping'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '7 days', 'Makan', 60000, 'Makan siang'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '7 days', 'Transportasi', 28000, 'Gojek'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '10 days', 'Makan', 55000, 'Makan malam'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '10 days', 'Hiburan', 140000, 'Event'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '12 days', 'Makan', 50000, 'Sarapan'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '12 days', 'Transportasi', 30000, 'Gojek'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '15 days', 'Makan', 60000, 'Makan siang'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '15 days', 'Hiburan', 130000, 'Streaming'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '18 days', 'Makan', 55000, 'Makan malam'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '18 days', 'Transportasi', 28000, 'Gojek'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '20 days', 'Makan', 50000, 'Sarapan'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '20 days', 'Hiburan', 120000, 'Shopping'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '22 days', 'Makan', 60000, 'Makan siang'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '22 days', 'Transportasi', 30000, 'Gojek'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '25 days', 'Makan', 55000, 'Makan malam'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '25 days', 'Hiburan', 150000, 'Konser'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '28 days', 'Makan', 50000, 'Sarapan'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '28 days', 'Transportasi', 28000, 'Gojek');

-- ============================================
-- 2. BUDGETS (Budget Kecil, Akan Melebihi)
-- ============================================
INSERT INTO public.budgets (user_id, category_id, category_name, year_month, budget_amount, spent_amount, color) VALUES
  -- Bulan ini - budget kecil, akan melebihi
  (v_user_id, 'food', 'Makan', v_current_month, 400000, 0, '#3B82F6'),
  (v_user_id, 'transport', 'Transportasi', v_current_month, 200000, 0, '#22C55E'),
  (v_user_id, 'entertainment', 'Hiburan', v_current_month, 300000, 0, '#A855F7'),
  (v_user_id, 'savings', 'Tabungan', v_current_month, 0, 0, '#EAB308'),
  -- Bulan lalu - sudah melebihi
  (v_user_id, 'food', 'Makan', v_prev_month, 400000, 0, '#3B82F6'),
  (v_user_id, 'transport', 'Transportasi', v_prev_month, 200000, 0, '#22C55E'),
  (v_user_id, 'entertainment', 'Hiburan', v_prev_month, 300000, 0, '#A855F7'),
  (v_user_id, 'savings', 'Tabungan', v_prev_month, 0, 0, '#EAB308')
ON CONFLICT (user_id, category_id, year_month) DO NOTHING;

UPDATE public.budgets b
SET spent_amount = COALESCE((
  SELECT SUM(amount)
  FROM public.transactions t
  WHERE t.user_id = b.user_id
    AND t.category = b.category_name
    AND TO_CHAR(t.date, 'YYYY-MM') = b.year_month
), 0)
WHERE b.user_id = v_user_id;

-- ============================================
-- 3. GOALS (Urgent, Deadline Dekat, Progress Kurang)
-- ============================================
INSERT INTO public.goals (user_id, title, target, saved, due_date, priority, completed) VALUES
  -- Urgent: Deadline dekat, progress kurang
  (v_user_id, 'Bayar Tagihan Kampus', 5000000, 1200000, CURRENT_DATE + INTERVAL '10 days', 'urgent', false),
  -- Urgent: Deadline sangat dekat, progress sangat kurang
  (v_user_id, 'Bayar Cicilan Motor', 3000000, 800000, CURRENT_DATE + INTERVAL '5 days', 'urgent', false),
  -- High: Deadline dekat, progress kurang
  (v_user_id, 'Beli Buku Semester', 1500000, 500000, CURRENT_DATE + INTERVAL '15 days', 'high', false),
  -- Normal: Deadline dekat, progress kurang
  (v_user_id, 'Liburan Akhir Tahun', 4000000, 1000000, CURRENT_DATE + INTERVAL '2 months', 'normal', false)
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. GOAL HISTORY (Sedikit Top-up, Progress Lambat)
-- ============================================
-- Bayar Tagihan Kampus (3 top-ups kecil)
INSERT INTO public.goal_history (goal_id, user_id, amount, date, note)
SELECT g.id, v_user_id, 500000, CURRENT_DATE - INTERVAL '30 days', 'Tabungan awal'
FROM public.goals g WHERE g.user_id = v_user_id AND g.title = 'Bayar Tagihan Kampus' LIMIT 1;
INSERT INTO public.goal_history (goal_id, user_id, amount, date, note)
SELECT g.id, v_user_id, 400000, CURRENT_DATE - INTERVAL '20 days', 'Top up kedua'
FROM public.goals g WHERE g.user_id = v_user_id AND g.title = 'Bayar Tagihan Kampus' LIMIT 1;
INSERT INTO public.goal_history (goal_id, user_id, amount, date, note)
SELECT g.id, v_user_id, 300000, CURRENT_DATE - INTERVAL '10 days', 'Top up ketiga'
FROM public.goals g WHERE g.user_id = v_user_id AND g.title = 'Bayar Tagihan Kampus' LIMIT 1;

-- Bayar Cicilan Motor (2 top-ups kecil)
INSERT INTO public.goal_history (goal_id, user_id, amount, date, note)
SELECT g.id, v_user_id, 500000, CURRENT_DATE - INTERVAL '25 days', 'Tabungan awal'
FROM public.goals g WHERE g.user_id = v_user_id AND g.title = 'Bayar Cicilan Motor' LIMIT 1;
INSERT INTO public.goal_history (goal_id, user_id, amount, date, note)
SELECT g.id, v_user_id, 300000, CURRENT_DATE - INTERVAL '15 days', 'Top up kedua'
FROM public.goals g WHERE g.user_id = v_user_id AND g.title = 'Bayar Cicilan Motor' LIMIT 1;

-- Beli Buku Semester (2 top-ups kecil)
INSERT INTO public.goal_history (goal_id, user_id, amount, date, note)
SELECT g.id, v_user_id, 300000, CURRENT_DATE - INTERVAL '20 days', 'Tabungan awal'
FROM public.goals g WHERE g.user_id = v_user_id AND g.title = 'Beli Buku Semester' LIMIT 1;
INSERT INTO public.goal_history (goal_id, user_id, amount, date, note)
SELECT g.id, v_user_id, 200000, CURRENT_DATE - INTERVAL '10 days', 'Top up kedua'
FROM public.goals g WHERE g.user_id = v_user_id AND g.title = 'Beli Buku Semester' LIMIT 1;

-- Liburan Akhir Tahun (2 top-ups)
INSERT INTO public.goal_history (goal_id, user_id, amount, date, note)
SELECT g.id, v_user_id, 600000, CURRENT_DATE - INTERVAL '40 days', 'Tabungan awal'
FROM public.goals g WHERE g.user_id = v_user_id AND g.title = 'Liburan Akhir Tahun' LIMIT 1;
INSERT INTO public.goal_history (goal_id, user_id, amount, date, note)
SELECT g.id, v_user_id, 400000, CURRENT_DATE - INTERVAL '20 days', 'Top up kedua'
FROM public.goals g WHERE g.user_id = v_user_id AND g.title = 'Liburan Akhir Tahun' LIMIT 1;

UPDATE public.goals g
SET saved = COALESCE((
  SELECT SUM(amount) FROM public.goal_history gh WHERE gh.goal_id = g.id
), 0)
WHERE g.user_id = v_user_id;

END $$;

