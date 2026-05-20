-- ============================================
-- Seed Data: Power User (User dengan Banyak Data)
-- File: 001_user_power_user.sql
-- Scenario: User aktif dengan banyak transaksi, goals yang beragam, dan budget yang terkelola baik
-- User ID: GANTI_MANUAL_USER_ID_DISINI
-- ============================================
-- 
-- CASE: User yang sudah menggunakan aplikasi selama beberapa bulan
-- - Banyak transaksi (3 bulan terakhir)
-- - Budget terkelola dengan baik
-- - Goals dengan berbagai progress (completed, on track, baru mulai)
-- - Perfect untuk demo fitur lengkap aplikasi
-- ============================================

DO $$
DECLARE
  v_user_id UUID := 'GANTI_MANUAL_USER_ID_DISINI'; -- ⚠️ GANTI INI!
  v_current_month TEXT := TO_CHAR(CURRENT_DATE, 'YYYY-MM');
  v_prev_month TEXT := TO_CHAR(CURRENT_DATE - INTERVAL '1 month', 'YYYY-MM');
  v_prev_month2 TEXT := TO_CHAR(CURRENT_DATE - INTERVAL '2 months', 'YYYY-MM');
BEGIN

-- ============================================
-- 1. TRANSACTIONS (3 Bulan Terakhir - Banyak Data)
-- ============================================

-- BULAN INI - Data Aktif & Bervariasi
INSERT INTO public.transactions (user_id, date, category, amount, note) VALUES
  (v_user_id, CURRENT_DATE, 'Makan', 35000, 'Sarapan pagi'),
  (v_user_id, CURRENT_DATE, 'Transportasi', 15000, 'Gojek ke kampus'),
  (v_user_id, CURRENT_DATE - INTERVAL '1 day', 'Makan', 28000, 'Makan siang'),
  (v_user_id, CURRENT_DATE - INTERVAL '1 day', 'Hiburan', 50000, 'Spotify Premium'),
  (v_user_id, CURRENT_DATE - INTERVAL '1 day', 'Transportasi', 12000, 'Gojek pulang'),
  (v_user_id, CURRENT_DATE - INTERVAL '2 days', 'Makan', 40000, 'Makan malam'),
  (v_user_id, CURRENT_DATE - INTERVAL '2 days', 'Transportasi', 18000, 'Gojek'),
  (v_user_id, CURRENT_DATE - INTERVAL '3 days', 'Makan', 32000, 'Sarapan'),
  (v_user_id, CURRENT_DATE - INTERVAL '3 days', 'Hiburan', 75000, 'Nonton film'),
  (v_user_id, CURRENT_DATE - INTERVAL '4 days', 'Makan', 30000, 'Makan siang'),
  (v_user_id, CURRENT_DATE - INTERVAL '4 days', 'Transportasi', 20000, 'Gojek'),
  (v_user_id, CURRENT_DATE - INTERVAL '5 days', 'Makan', 35000, 'Makan malam'),
  (v_user_id, CURRENT_DATE - INTERVAL '5 days', 'Hiburan', 60000, 'Game credit'),
  (v_user_id, CURRENT_DATE - INTERVAL '6 days', 'Makan', 25000, 'Sarapan'),
  (v_user_id, CURRENT_DATE - INTERVAL '6 days', 'Transportasi', 15000, 'Bus'),
  (v_user_id, CURRENT_DATE - INTERVAL '10 days', 'Makan', 45000, 'Makan siang'),
  (v_user_id, CURRENT_DATE - INTERVAL '10 days', 'Hiburan', 80000, 'Konser musik'),
  (v_user_id, CURRENT_DATE - INTERVAL '12 days', 'Makan', 38000, 'Makan malam'),
  (v_user_id, CURRENT_DATE - INTERVAL '12 days', 'Transportasi', 22000, 'Gojek'),
  (v_user_id, CURRENT_DATE - INTERVAL '15 days', 'Makan', 42000, 'Sarapan'),
  (v_user_id, CURRENT_DATE - INTERVAL '15 days', 'Hiburan', 55000, 'Streaming service'),
  (v_user_id, CURRENT_DATE - INTERVAL '18 days', 'Makan', 33000, 'Makan siang'),
  (v_user_id, CURRENT_DATE - INTERVAL '18 days', 'Transportasi', 16000, 'Gojek'),
  (v_user_id, CURRENT_DATE - INTERVAL '20 days', 'Makan', 40000, 'Makan malam'),
  (v_user_id, CURRENT_DATE - INTERVAL '20 days', 'Hiburan', 70000, 'Shopping online'),
  (v_user_id, CURRENT_DATE - INTERVAL '22 days', 'Makan', 36000, 'Sarapan'),
  (v_user_id, CURRENT_DATE - INTERVAL '22 days', 'Transportasi', 18000, 'Gojek'),
  (v_user_id, CURRENT_DATE - INTERVAL '25 days', 'Makan', 29000, 'Makan siang'),
  (v_user_id, CURRENT_DATE - INTERVAL '25 days', 'Hiburan', 65000, 'Event ticket');

-- BULAN LALU - Banyak Transaksi
INSERT INTO public.transactions (user_id, date, category, amount, note) VALUES
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '1 day', 'Makan', 30000, 'Sarapan'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '1 day', 'Transportasi', 15000, 'Gojek'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '2 days', 'Makan', 35000, 'Makan siang'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '2 days', 'Hiburan', 60000, 'Spotify'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '3 days', 'Makan', 40000, 'Makan malam'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '3 days', 'Transportasi', 20000, 'Gojek'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '5 days', 'Makan', 32000, 'Sarapan'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '5 days', 'Hiburan', 80000, 'Nonton film'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '7 days', 'Makan', 38000, 'Makan siang'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '7 days', 'Transportasi', 18000, 'Gojek'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '10 days', 'Makan', 45000, 'Makan malam'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '10 days', 'Hiburan', 90000, 'Konser'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '12 days', 'Makan', 30000, 'Sarapan'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '12 days', 'Transportasi', 22000, 'Gojek'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '15 days', 'Makan', 42000, 'Makan siang'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '15 days', 'Hiburan', 75000, 'Shopping'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '18 days', 'Makan', 36000, 'Makan malam'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '18 days', 'Transportasi', 16000, 'Gojek'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '20 days', 'Makan', 40000, 'Sarapan'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '20 days', 'Hiburan', 85000, 'Event'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '22 days', 'Makan', 33000, 'Makan siang'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '22 days', 'Transportasi', 19000, 'Gojek'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '25 days', 'Makan', 38000, 'Makan malam'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '25 days', 'Hiburan', 70000, 'Streaming'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '28 days', 'Makan', 35000, 'Sarapan'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE + INTERVAL '28 days', 'Transportasi', 17000, 'Gojek');

-- 2 BULAN LALU
INSERT INTO public.transactions (user_id, date, category, amount, note) VALUES
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '2 months')::DATE + INTERVAL '2 days', 'Makan', 28000, 'Sarapan'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '2 months')::DATE + INTERVAL '2 days', 'Transportasi', 12000, 'Gojek'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '2 months')::DATE + INTERVAL '5 days', 'Makan', 32000, 'Makan siang'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '2 months')::DATE + INTERVAL '5 days', 'Hiburan', 50000, 'Spotify'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '2 months')::DATE + INTERVAL '8 days', 'Makan', 35000, 'Makan malam'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '2 months')::DATE + INTERVAL '8 days', 'Transportasi', 15000, 'Gojek'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '2 months')::DATE + INTERVAL '12 days', 'Makan', 30000, 'Sarapan'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '2 months')::DATE + INTERVAL '12 days', 'Hiburan', 60000, 'Nonton'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '2 months')::DATE + INTERVAL '15 days', 'Makan', 38000, 'Makan siang'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '2 months')::DATE + INTERVAL '15 days', 'Transportasi', 18000, 'Gojek'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '2 months')::DATE + INTERVAL '20 days', 'Makan', 40000, 'Makan malam'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '2 months')::DATE + INTERVAL '20 days', 'Hiburan', 55000, 'Shopping'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '2 months')::DATE + INTERVAL '25 days', 'Makan', 33000, 'Sarapan'),
  (v_user_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '2 months')::DATE + INTERVAL '25 days', 'Transportasi', 16000, 'Gojek');

-- ============================================
-- 2. BUDGETS (3 Bulan)
-- ============================================
INSERT INTO public.budgets (user_id, category_id, category_name, year_month, budget_amount, spent_amount, color) VALUES
  (v_user_id, 'food', 'Makan', v_current_month, 600000, 0, '#3B82F6'),
  (v_user_id, 'transport', 'Transportasi', v_current_month, 300000, 0, '#22C55E'),
  (v_user_id, 'entertainment', 'Hiburan', v_current_month, 400000, 0, '#A855F7'),
  (v_user_id, 'savings', 'Tabungan', v_current_month, 800000, 0, '#EAB308'),
  (v_user_id, 'food', 'Makan', v_prev_month, 600000, 0, '#3B82F6'),
  (v_user_id, 'transport', 'Transportasi', v_prev_month, 300000, 0, '#22C55E'),
  (v_user_id, 'entertainment', 'Hiburan', v_prev_month, 400000, 0, '#A855F7'),
  (v_user_id, 'savings', 'Tabungan', v_prev_month, 800000, 0, '#EAB308'),
  (v_user_id, 'food', 'Makan', v_prev_month2, 600000, 0, '#3B82F6'),
  (v_user_id, 'transport', 'Transportasi', v_prev_month2, 300000, 0, '#22C55E'),
  (v_user_id, 'entertainment', 'Hiburan', v_prev_month2, 400000, 0, '#A855F7'),
  (v_user_id, 'savings', 'Tabungan', v_prev_month2, 800000, 0, '#EAB308')
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
-- 3. GOALS (Berbagai Status)
-- ============================================
INSERT INTO public.goals (user_id, title, target, saved, due_date, priority, completed) VALUES
  (v_user_id, 'Beli Laptop Gaming', 10000000, 9200000, CURRENT_DATE + INTERVAL '1 month', 'high', false),
  (v_user_id, 'Liburan ke Bali', 5000000, 3200000, CURRENT_DATE + INTERVAL '3 months', 'normal', false),
  (v_user_id, 'Emergency Fund', 10000000, 2500000, NULL, 'urgent', false),
  (v_user_id, 'Beli Sepeda', 3000000, 3000000, CURRENT_DATE - INTERVAL '5 days', 'normal', true),
  (v_user_id, 'Bayar Tagihan Kampus', 5000000, 1800000, CURRENT_DATE + INTERVAL '20 days', 'urgent', false),
  (v_user_id, 'DP Rumah', 50000000, 8500000, CURRENT_DATE + INTERVAL '2 years', 'high', false)
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. GOAL HISTORY
-- ============================================
-- Beli Laptop Gaming (6 top-ups)
INSERT INTO public.goal_history (goal_id, user_id, amount, date, note)
SELECT g.id, v_user_id, 500000, CURRENT_DATE - INTERVAL '60 days', 'Top up pertama'
FROM public.goals g WHERE g.user_id = v_user_id AND g.title = 'Beli Laptop Gaming' LIMIT 1;
INSERT INTO public.goal_history (goal_id, user_id, amount, date, note)
SELECT g.id, v_user_id, 1000000, CURRENT_DATE - INTERVAL '45 days', 'Top up kedua'
FROM public.goals g WHERE g.user_id = v_user_id AND g.title = 'Beli Laptop Gaming' LIMIT 1;
INSERT INTO public.goal_history (goal_id, user_id, amount, date, note)
SELECT g.id, v_user_id, 2000000, CURRENT_DATE - INTERVAL '30 days', 'Top up ketiga'
FROM public.goals g WHERE g.user_id = v_user_id AND g.title = 'Beli Laptop Gaming' LIMIT 1;
INSERT INTO public.goal_history (goal_id, user_id, amount, date, note)
SELECT g.id, v_user_id, 1500000, CURRENT_DATE - INTERVAL '20 days', 'Top up keempat'
FROM public.goals g WHERE g.user_id = v_user_id AND g.title = 'Beli Laptop Gaming' LIMIT 1;
INSERT INTO public.goal_history (goal_id, user_id, amount, date, note)
SELECT g.id, v_user_id, 2000000, CURRENT_DATE - INTERVAL '10 days', 'Top up kelima'
FROM public.goals g WHERE g.user_id = v_user_id AND g.title = 'Beli Laptop Gaming' LIMIT 1;
INSERT INTO public.goal_history (goal_id, user_id, amount, date, note)
SELECT g.id, v_user_id, 2200000, CURRENT_DATE - INTERVAL '5 days', 'Top up terakhir'
FROM public.goals g WHERE g.user_id = v_user_id AND g.title = 'Beli Laptop Gaming' LIMIT 1;

-- Liburan ke Bali (4 top-ups)
INSERT INTO public.goal_history (goal_id, user_id, amount, date, note)
SELECT g.id, v_user_id, 500000, CURRENT_DATE - INTERVAL '50 days', 'Tabungan awal'
FROM public.goals g WHERE g.user_id = v_user_id AND g.title = 'Liburan ke Bali' LIMIT 1;
INSERT INTO public.goal_history (goal_id, user_id, amount, date, note)
SELECT g.id, v_user_id, 800000, CURRENT_DATE - INTERVAL '35 days', 'Top up kedua'
FROM public.goals g WHERE g.user_id = v_user_id AND g.title = 'Liburan ke Bali' LIMIT 1;
INSERT INTO public.goal_history (goal_id, user_id, amount, date, note)
SELECT g.id, v_user_id, 1000000, CURRENT_DATE - INTERVAL '20 days', 'Top up ketiga'
FROM public.goals g WHERE g.user_id = v_user_id AND g.title = 'Liburan ke Bali' LIMIT 1;
INSERT INTO public.goal_history (goal_id, user_id, amount, date, note)
SELECT g.id, v_user_id, 900000, CURRENT_DATE - INTERVAL '7 days', 'Top up keempat'
FROM public.goals g WHERE g.user_id = v_user_id AND g.title = 'Liburan ke Bali' LIMIT 1;

-- Emergency Fund (3 top-ups)
INSERT INTO public.goal_history (goal_id, user_id, amount, date, note)
SELECT g.id, v_user_id, 1000000, CURRENT_DATE - INTERVAL '40 days', 'Tabungan awal'
FROM public.goals g WHERE g.user_id = v_user_id AND g.title = 'Emergency Fund' LIMIT 1;
INSERT INTO public.goal_history (goal_id, user_id, amount, date, note)
SELECT g.id, v_user_id, 800000, CURRENT_DATE - INTERVAL '25 days', 'Top up kedua'
FROM public.goals g WHERE g.user_id = v_user_id AND g.title = 'Emergency Fund' LIMIT 1;
INSERT INTO public.goal_history (goal_id, user_id, amount, date, note)
SELECT g.id, v_user_id, 700000, CURRENT_DATE - INTERVAL '10 days', 'Top up ketiga'
FROM public.goals g WHERE g.user_id = v_user_id AND g.title = 'Emergency Fund' LIMIT 1;

-- Beli Sepeda (completed - 3 top-ups)
INSERT INTO public.goal_history (goal_id, user_id, amount, date, note)
SELECT g.id, v_user_id, 500000, CURRENT_DATE - INTERVAL '80 days', 'Tabungan awal'
FROM public.goals g WHERE g.user_id = v_user_id AND g.title = 'Beli Sepeda' LIMIT 1;
INSERT INTO public.goal_history (goal_id, user_id, amount, date, note)
SELECT g.id, v_user_id, 1000000, CURRENT_DATE - INTERVAL '60 days', 'Top up kedua'
FROM public.goals g WHERE g.user_id = v_user_id AND g.title = 'Beli Sepeda' LIMIT 1;
INSERT INTO public.goal_history (goal_id, user_id, amount, date, note)
SELECT g.id, v_user_id, 1500000, CURRENT_DATE - INTERVAL '5 days', 'Top up final - Goal tercapai!'
FROM public.goals g WHERE g.user_id = v_user_id AND g.title = 'Beli Sepeda' LIMIT 1;

-- Bayar Tagihan Kampus (2 top-ups)
INSERT INTO public.goal_history (goal_id, user_id, amount, date, note)
SELECT g.id, v_user_id, 800000, CURRENT_DATE - INTERVAL '30 days', 'Tabungan awal'
FROM public.goals g WHERE g.user_id = v_user_id AND g.title = 'Bayar Tagihan Kampus' LIMIT 1;
INSERT INTO public.goal_history (goal_id, user_id, amount, date, note)
SELECT g.id, v_user_id, 1000000, CURRENT_DATE - INTERVAL '15 days', 'Top up kedua'
FROM public.goals g WHERE g.user_id = v_user_id AND g.title = 'Bayar Tagihan Kampus' LIMIT 1;

-- DP Rumah (4 top-ups)
INSERT INTO public.goal_history (goal_id, user_id, amount, date, note)
SELECT g.id, v_user_id, 2000000, CURRENT_DATE - INTERVAL '90 days', 'Tabungan awal'
FROM public.goals g WHERE g.user_id = v_user_id AND g.title = 'DP Rumah' LIMIT 1;
INSERT INTO public.goal_history (goal_id, user_id, amount, date, note)
SELECT g.id, v_user_id, 2500000, CURRENT_DATE - INTERVAL '60 days', 'Top up kedua'
FROM public.goals g WHERE g.user_id = v_user_id AND g.title = 'DP Rumah' LIMIT 1;
INSERT INTO public.goal_history (goal_id, user_id, amount, date, note)
SELECT g.id, v_user_id, 2000000, CURRENT_DATE - INTERVAL '30 days', 'Top up ketiga'
FROM public.goals g WHERE g.user_id = v_user_id AND g.title = 'DP Rumah' LIMIT 1;
INSERT INTO public.goal_history (goal_id, user_id, amount, date, note)
SELECT g.id, v_user_id, 2000000, CURRENT_DATE - INTERVAL '10 days', 'Top up keempat'
FROM public.goals g WHERE g.user_id = v_user_id AND g.title = 'DP Rumah' LIMIT 1;

UPDATE public.goals g
SET saved = COALESCE((
  SELECT SUM(amount) FROM public.goal_history gh WHERE gh.goal_id = g.id
), 0)
WHERE g.user_id = v_user_id;

END $$;

