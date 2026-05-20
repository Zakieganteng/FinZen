# Seed Data - Comprehensive Demo Data

## 📋 Overview
Seed data ini dibuat untuk demonstrasi presentasi dengan berbagai scenario yang menunjukkan semua fitur aplikasi FinZen.

## ⚠️ PENTING: Sebelum Menjalankan
**GANTI `v_user_id` di baris 11 dengan user_id yang sesuai!**
```sql
v_user_id UUID := 'GANTI_MANUAL_USER_ID_DISINI'; -- ⚠️ GANTI INI!
```

## 📊 Data yang Dibuat

### 1. TRANSACTIONS (3 Bulan Terakhir)

#### Bulan Ini (Current Month)
- **Total**: ~25 transaksi
- **Pattern**: Data aktif dengan berbagai kategori
- **Kategori**: Makan, Transportasi, Hiburan
- **Range**: Hari ini hingga 25 hari yang lalu
- **Use Case**: Menunjukkan aktivitas pengeluaran bulan ini

#### Bulan Lalu (Previous Month)
- **Total**: ~25 transaksi
- **Pattern**: Banyak transaksi (untuk menunjukkan budget hampir habis)
- **Kategori**: Makan, Transportasi, Hiburan
- **Use Case**: Menunjukkan data historis dan perbandingan bulan ke bulan

#### 2 Bulan Lalu (Previous Month 2)
- **Total**: ~14 transaksi
- **Pattern**: Data normal
- **Use Case**: Menunjukkan data historis untuk chart dan laporan

### 2. BUDGETS (3 Bulan)

#### Bulan Ini
- **Makan**: Rp 600.000 (akan terisi otomatis dari transactions)
- **Transportasi**: Rp 300.000
- **Hiburan**: Rp 400.000
- **Tabungan**: Rp 800.000
- **Status**: Beberapa kategori hampir habis, beberapa masih aman
- **Use Case**: Menunjukkan monitoring budget real-time

#### Bulan Lalu
- **Status**: Beberapa kategori melebihi budget
- **Use Case**: Menunjukkan warning/alert ketika budget melebihi limit

#### 2 Bulan Lalu
- **Status**: Data lengkap untuk perbandingan
- **Use Case**: Menunjukkan trend dan perbandingan historis

### 3. GOALS (6 Goals dengan Berbagai Status)

#### 1. Beli Laptop Gaming
- **Target**: Rp 10.000.000
- **Saved**: Rp 9.200.000 (92%)
- **Due Date**: 1 bulan lagi
- **Priority**: High
- **Status**: Hampir selesai
- **Use Case**: Menunjukkan milestone celebration (90%+)

#### 2. Liburan ke Bali
- **Target**: Rp 5.000.000
- **Saved**: Rp 3.200.000 (64%)
- **Due Date**: 3 bulan lagi
- **Priority**: Normal
- **Status**: On track
- **Use Case**: Menunjukkan progress yang baik (50-70%)

#### 3. Emergency Fund
- **Target**: Rp 10.000.000
- **Saved**: Rp 2.500.000 (25%)
- **Due Date**: Tidak ada (ongoing)
- **Priority**: Urgent
- **Status**: Baru mulai
- **Use Case**: Menunjukkan goal jangka panjang tanpa deadline

#### 4. Beli Sepeda
- **Target**: Rp 3.000.000
- **Saved**: Rp 3.000.000 (100%)
- **Due Date**: 5 hari yang lalu
- **Priority**: Normal
- **Status**: ✅ Completed
- **Use Case**: Menunjukkan achievement badge dan completed goals

#### 5. Bayar Tagihan Kampus
- **Target**: Rp 5.000.000
- **Saved**: Rp 1.800.000 (36%)
- **Due Date**: 20 hari lagi
- **Priority**: Urgent
- **Status**: Progress kurang, deadline dekat
- **Use Case**: Menunjukkan urgency warning dan reminder

#### 6. DP Rumah
- **Target**: Rp 50.000.000
- **Saved**: Rp 8.500.000 (17%)
- **Due Date**: 2 tahun lagi
- **Priority**: High
- **Status**: Jangka panjang, progress stabil
- **Use Case**: Menunjukkan goal jangka panjang dengan progress bertahap

### 4. GOAL HISTORY (Lengkap & Realistis)

Setiap goal memiliki history top-up yang bervariasi:
- **Beli Laptop Gaming**: 6 top-up (dari 60 hari lalu hingga 5 hari lalu)
- **Liburan ke Bali**: 4 top-up (dari 50 hari lalu hingga 7 hari lalu)
- **Emergency Fund**: 3 top-up (dari 40 hari lalu hingga 10 hari lalu)
- **Beli Sepeda**: 3 top-up (completed goal)
- **Bayar Tagihan Kampus**: 2 top-up (urgent, progress kurang)
- **DP Rumah**: 4 top-up (jangka panjang)

## 🎯 Fitur yang Bisa Didemonstrasikan

### Dashboard
- ✅ Summary cards dengan data real
- ✅ Chart komposisi pengeluaran per kategori
- ✅ Chart tren mingguan (7 hari terakhir)
- ✅ Daily focus action
- ✅ Financial insights
- ✅ Weekly challenge
- ✅ Badge collection

### Transactions Page
- ✅ Daftar transaksi 3 bulan terakhir
- ✅ Filter dan search
- ✅ Add transaction
- ✅ Edit/Delete transaction

### Budgeting Page
- ✅ Budget monitoring bulan ini
- ✅ Progress bar per kategori
- ✅ Warning ketika budget hampir habis/melebihi
- ✅ Budget historis (bulan lalu, 2 bulan lalu)

### Goals Page
- ✅ 6 goals dengan berbagai status
- ✅ Progress visualization
- ✅ Goal history untuk setiap goal
- ✅ Top-up goal functionality
- ✅ Completed goals
- ✅ Urgency warnings

### Reports Page
- ✅ Monthly comparison (bulan ini vs bulan lalu)
- ✅ Spending by category
- ✅ Daily trend chart
- ✅ Preset filters (this month, last month, etc.)

## 📈 Data Statistics (Estimasi)

Setelah seed data dijalankan:
- **Transactions**: ~64 transaksi
- **Budgets**: 12 budget entries (3 bulan × 4 kategori)
- **Goals**: 6 goals
- **Goal History**: ~22 history entries

## 🔄 Update Otomatis

Script ini akan:
1. ✅ Menghitung `spent_amount` di budgets dari transactions
2. ✅ Menghitung `saved` di goals dari goal_history
3. ✅ Menggunakan tanggal relatif (CURRENT_DATE) sehingga selalu up-to-date

## 🚀 Cara Menggunakan

1. Buka file `006_seed_data.sql`
2. Ganti `'GANTI_MANUAL_USER_ID_DISINI'` dengan user_id yang benar
3. Jalankan script di Supabase SQL Editor
4. Verifikasi data dengan query di bagian bawah file (uncomment jika perlu)

## 💡 Tips Presentasi

1. **Mulai dari Dashboard**: Tunjukkan summary dan chart dengan data real
2. **Transactions**: Tunjukkan filter dan search dengan banyak data
3. **Budgeting**: Tunjukkan warning ketika budget hampir habis
4. **Goals**: Tunjukkan berbagai status (completed, on track, urgent)
5. **Reports**: Tunjukkan perbandingan bulan ke bulan

---

**Note**: Data ini menggunakan tanggal relatif (`CURRENT_DATE - INTERVAL`), sehingga selalu menunjukkan data yang relevan dengan tanggal saat ini.

