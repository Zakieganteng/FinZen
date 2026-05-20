# Seed Data untuk 3 User Berbeda

Folder ini berisi seed data untuk 3 user dengan scenario berbeda untuk demonstrasi presentasi.

## 📁 File Structure

```
supabase/seeds/
├── README.md                    # Dokumentasi ini
├── 001_user_power_user.sql      # Power User (banyak data)
├── 002_user_new_user.sql        # New User (sedikit data)
├── 003_user_budget_problem.sql  # Budget Problem User (masalah keuangan)
└── 004_seed_tips_artikel.sql    # 5 Artikel Tips Keuangan (created_by NULL)
```

## ⚠️ PENTING: Sebelum Menjalankan

**GANTI `v_user_id` di setiap file dengan user_id yang sesuai!**

Setiap file memiliki placeholder:
```sql
v_user_id UUID := 'GANTI_MANUAL_USER_ID_DISINI'; -- ⚠️ GANTI INI!
```

## 📊 Scenario Overview

### 1. Power User (`001_user_power_user.sql`)

**Profile**: User aktif yang sudah menggunakan aplikasi selama beberapa bulan

**Data**:
- ✅ **Transactions**: ~64 transaksi (3 bulan terakhir)
- ✅ **Budgets**: 12 budget entries (3 bulan × 4 kategori)
- ✅ **Goals**: 6 goals dengan berbagai status
  - Hampir selesai (92%)
  - On track (64%)
  - Baru mulai (25%)
  - Completed (100%)
  - Urgent (36%)
  - Jangka panjang (17%)
- ✅ **Goal History**: ~22 history entries

**Use Case**: 
- Demo fitur lengkap aplikasi
- Menunjukkan semua chart dan visualisasi
- Menunjukkan berbagai status goals
- Menunjukkan milestone celebration

---

### 2. New User (`002_user_new_user.sql`)

**Profile**: User yang baru saja mendaftar dan mulai menggunakan aplikasi

**Data**:
- ✅ **Transactions**: ~13 transaksi (hanya minggu ini)
- ✅ **Budgets**: 4 budget entries (hanya bulan ini)
- ✅ **Goals**: 3 goals baru dengan progress kecil
  - Beli Laptop (6.25%)
  - Liburan Akhir Tahun (6.67%)
  - Emergency Fund (0%)
- ✅ **Goal History**: ~3 history entries

**Use Case**:
- Demo onboarding flow
- Menunjukkan fitur dasar aplikasi
- Menunjukkan empty state handling
- Menunjukkan progress tracking untuk user baru

---

### 3. Budget Problem User (`003_user_budget_problem.sql`)

**Profile**: User yang mengalami masalah keuangan - budget melebihi, goals urgent

**Data**:
- ✅ **Transactions**: ~52 transaksi (2 bulan, banyak transaksi besar)
- ✅ **Budgets**: 8 budget entries (2 bulan)
  - Budget kecil yang akan melebihi
  - Bulan lalu sudah melebihi budget
- ✅ **Goals**: 4 goals urgent dengan deadline dekat
  - Bayar Tagihan Kampus (24%, deadline 10 hari)
  - Bayar Cicilan Motor (26.67%, deadline 5 hari)
  - Beli Buku Semester (33.33%, deadline 15 hari)
  - Liburan Akhir Tahun (25%, deadline 2 bulan)
- ✅ **Goal History**: ~9 history entries (top-up kecil)

**Use Case**:
- Demo warning dan alerts
- Menunjukkan budget over limit
- Menunjukkan urgency warnings
- Menunjukkan financial insights untuk masalah keuangan
- Menunjukkan daily focus action untuk masalah urgent

---

## 🚀 Cara Menggunakan

### Step 1: Siapkan 3 User ID

Buat atau pilih 3 user ID yang berbeda dari database `users` table.

### Step 2: Edit Setiap File

Buka setiap file dan ganti `'GANTI_MANUAL_USER_ID_DISINI'` dengan user_id yang sesuai:

**File 1**: `001_user_power_user.sql`
```sql
v_user_id UUID := 'USER_ID_1_DISINI';
```

**File 2**: `002_user_new_user.sql`
```sql
v_user_id UUID := 'USER_ID_2_DISINI';
```

**File 3**: `003_user_budget_problem.sql`
```sql
v_user_id UUID := 'USER_ID_3_DISINI';
```

### Step 3: Jalankan Script

Jalankan setiap script di Supabase SQL Editor secara berurutan:

1. Jalankan `001_user_power_user.sql`
2. Jalankan `002_user_new_user.sql`
3. Jalankan `003_user_budget_problem.sql`

### Step 4: Verifikasi

Untuk memverifikasi data yang di-insert, jalankan query berikut (ganti user_id):

```sql
-- Verifikasi Power User
SELECT 'Power User - Transactions' as type, COUNT(*) as count 
FROM public.transactions 
WHERE user_id = 'USER_ID_1_DISINI'
UNION ALL
SELECT 'Power User - Goals', COUNT(*) 
FROM public.goals 
WHERE user_id = 'USER_ID_1_DISINI';

-- Verifikasi New User
SELECT 'New User - Transactions' as type, COUNT(*) as count 
FROM public.transactions 
WHERE user_id = 'USER_ID_2_DISINI'
UNION ALL
SELECT 'New User - Goals', COUNT(*) 
FROM public.goals 
WHERE user_id = 'USER_ID_2_DISINI';

-- Verifikasi Budget Problem User
SELECT 'Budget Problem - Transactions' as type, COUNT(*) as count 
FROM public.transactions 
WHERE user_id = 'USER_ID_3_DISINI'
UNION ALL
SELECT 'Budget Problem - Goals', COUNT(*) 
FROM public.goals 
WHERE user_id = 'USER_ID_3_DISINI';
```

## 🎯 Tips Presentasi

### Untuk Power User:
1. Mulai dari dashboard dengan chart lengkap
2. Tunjukkan berbagai status goals
3. Tunjukkan milestone celebration (goal 92%)
4. Tunjukkan completed goals
5. Tunjukkan reports dengan data 3 bulan

### Untuk New User:
1. Tunjukkan onboarding flow
2. Tunjukkan empty states
3. Tunjukkan fitur dasar (add transaction, set budget, create goal)
4. Tunjukkan progress tracking yang baru mulai

### Untuk Budget Problem User:
1. Tunjukkan warning alerts (budget melebihi)
2. Tunjukkan urgency warnings (deadline dekat)
3. Tunjukkan financial insights
4. Tunjukkan daily focus action untuk masalah urgent
5. Tunjukkan bagaimana aplikasi membantu mengatasi masalah keuangan

## 📈 Data Statistics

| User Type | Transactions | Budgets | Goals | Goal History |
|-----------|-------------|---------|-------|--------------|
| Power User | ~64 | 12 | 6 | ~22 |
| New User | ~13 | 4 | 3 | ~3 |
| Budget Problem | ~52 | 8 | 4 | ~9 |

---

### 4. Tips Artikel (`004_seed_tips_artikel.sql`)

**Profile**: Seed data untuk 5 artikel tips keuangan yang lengkap

**Data**:
- ✅ **Tips**: 5 artikel tips keuangan dengan konten yang panjang
  - Panduan Lengkap Mengelola Keuangan Pribadi untuk Pemula
  - Strategi Menabung yang Efektif untuk Mencapai Tujuan Keuangan
  - Memahami dan Mengelola Utang dengan Bijak
  - Investasi untuk Pemula: Panduan Memulai Perjalanan Investasi Anda
  - Membangun Kebiasaan Keuangan yang Sehat untuk Masa Depan
- ✅ **Type**: Semua artikel bertipe 'artikel'
- ✅ **Created By**: NULL (tidak ada user yang membuat)
- ✅ **Order Index**: 4-8
- ✅ **Is Active**: true

**Use Case**:
- Menampilkan konten edukasi keuangan yang lengkap
- Memberikan referensi artikel untuk pengguna
- Demo fitur tips dan edukasi keuangan

**Cara Menggunakan**:
File ini tidak memerlukan user_id karena `created_by` di-set NULL. Langsung jalankan script di Supabase SQL Editor.

---

## 💡 Notes

- Semua data menggunakan tanggal relatif (`CURRENT_DATE`), sehingga selalu relevan dengan tanggal saat ini
- Budget `spent_amount` akan dihitung otomatis dari transactions
- Goal `saved` akan dihitung otomatis dari goal_history
- Pastikan user_id yang digunakan sudah ada di table `users` sebelum menjalankan script (kecuali untuk `004_seed_tips_artikel.sql`)

---

**Happy Presenting! 🎉**

