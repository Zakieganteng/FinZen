# Alur Aplikasi FinZen: Web Pengelolaan Keuangan Gen Z

## 1. Pendahuluan

FinZen adalah aplikasi web berbasis Next.js yang dirancang khusus untuk membantu generasi Z dalam mengelola keuangan pribadi. Aplikasi ini menggunakan pendekatan gamifikasi dengan sistem streak untuk membangun kebiasaan finansial yang konsisten.

## 2. Arsitektur Aplikasi

### 2.1 Struktur Folder
```
src/
├── app/                    # Next.js App Router
│   ├── layout.js          # Root layout dengan sidebar
│   ├── page.js            # Dashboard/Homepage
│   ├── onboarding/        # Halaman onboarding pertama kali
│   ├── transactions/      # Manajemen transaksi
│   ├── budgeting/         # Pengelolaan anggaran
│   ├── goals/             # Manajemen target tabungan
│   ├── reports/           # Laporan dan analitik
│   ├── tips/              # Tips edukasi finansial
│   ├── components/        # Komponen reusable
│   │   └── Sidebar.js     # Navigasi sidebar
│   └── ui.js              # Komponen UI (modals, cards, dll)
└── lib/
    └── data.js            # Data seed dan helper functions
```

### 2.2 Teknologi yang Digunakan
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS dengan dark mode support
- **State Management**: React Hooks (useState, useEffect)
- **Data Persistence**: localStorage (client-side)
- **Charts**: Recharts (BarChart, LineChart, PieChart, AreaChart)
- **Fonts**: Google Fonts (Geist Sans & Geist Mono)

## 3. Flow Navigasi Aplikasi

### 3.1 Entry Point
1. **Pertama Kali Mengakses** (`/onboarding`)
   - Pengguna memilih tema (Light/Dark)
   - Preview quick actions
   - Preview visualisasi data (charts)
   - Tombol "Mulai Sekarang" → redirect ke `/`

2. **Akses Berikutnya** (`/`)
   - Langsung masuk ke Dashboard
   - Tema di-load dari localStorage
   - Quick Expense Modal muncul jika belum catat transaksi hari ini

### 3.2 Struktur Navigasi (Sidebar)
Sidebar tetap terlihat di semua halaman dengan menu:
- 🏠 **Dashboard** (`/`)
- 💸 **Transaksi** (`/transactions`)
- 📊 **Budgeting** (`/budgeting`)
- 🎯 **Goals** (`/goals`)
- 📈 **Laporan** (`/reports`)
- 💡 **Tips** (`/tips`)
- ✨ **Onboarding** (`/onboarding`)

### 3.3 Theme Management
- Tema disimpan di `localStorage` dengan key `'finzen-theme'`
- Script di `layout.js` load tema sebelum interaktif (beforeInteractive)
- Toggle tema tersedia di footer sidebar
- Class `dark` ditambahkan ke `document.documentElement` untuk dark mode

## 4. Flow Fitur Utama

### 4.1 Dashboard (`/`)

**Tujuan**: Memberikan overview finansial pengguna

**Komponen Utama**:
1. **Header dengan Streak**
   - Nama pengguna
   - Streak days (kebiasaan konsisten)
   - Card streak dengan emoji 🔥

2. **Summary Cards** (4 cards)
   - Saldo total
   - Pengeluaran hari ini
   - Budget terpakai (persentase)
   - Rata-rata progress goals

3. **Quick Actions** (4 aksi cepat)
   - Tambah Transaksi → `/transactions`
   - Atur Budget → `/budgeting`
   - Buat Goals → `/goals`
   - Lihat Laporan → `/reports`

4. **Visualisasi Data**
   - Bar Chart: Komposisi pengeluaran per kategori (bulan ini)
   - Line Chart: Tren mingguan pengeluaran harian

5. **Progress Tracking**
   - Anggaran per kategori dengan progress bar
   - Goals dengan progress bar

6. **Quick Expense Modal**
   - Muncul otomatis saat pertama kali akses hari ini
   - Cek `localStorage.getItem('finzen-last-expense-prompt')`
   - Jika berbeda dengan tanggal hari ini → tampilkan modal
   - User bisa catat transaksi cepat atau skip

**Data Flow**:
- Load dari `data.js` (seed data)
- Load dari `localStorage` untuk transaksi user
- Agregasi data untuk summary cards
- Perhitungan progress goals dan budget

### 4.2 Transaksi (`/transactions`)

**Tujuan**: Mencatat dan melihat semua transaksi keuangan

**Fitur**:
1. **Header dengan Tombol Tambah**
   - Tombol "+ Tambah Transaksi" → buka `AddTransactionModal`

2. **Summary Cards** (3 cards)
   - Total hari ini (agregasi transaksi tanggal hari ini)
   - Jumlah transaksi (total item)
   - Rata-rata per item

3. **Grafik Harian**
   - Bar Chart: Total pengeluaran per tanggal
   - Data di-agregasi dari semua transaksi

4. **Daftar Transaksi**
   - Tabel dengan kolom: Tanggal, Kategori, Jumlah, Catatan
   - Data terbaru di atas (sorted by date desc)

**Data Flow**:
- Load seed transactions dari `data.js`
- Load user transactions dari `localStorage.getItem('finzen-transactions')`
- Merge kedua data
- Saat tambah transaksi baru:
  - Simpan ke `localStorage`
  - Update state → re-render
  - Callback `onAdded` untuk update parent

**Modal Add Transaction**:
- Form: Date, Category (dropdown), Amount, Note
- Validasi: Date, Category, Amount wajib
- Simpan ke `localStorage` dengan key `'finzen-transactions'`
- Format: `{ id, date, category, amount, note }`

### 4.3 Budgeting (`/budgeting`)

**Tujuan**: Mengatur dan memantau anggaran per kategori

**Fitur**:
1. **Summary Cards** (3 cards)
   - Total Anggaran (semua kategori)
   - Terpakai (akumulasi pemakaian)
   - Sisa & Hari Tersisa

2. **Visualisasi**
   - Donut Chart: Komposisi pemakaian per kategori
   - Burn Rate & Forecast:
     - Ideal per hari (total budget / hari dalam bulan)
     - Aktual per hari (total spent / hari yang sudah lewat)
     - Forecast akhir bulan (aktual per hari × hari dalam bulan)
     - Status: "Aman" atau "Berpotensi overspend"

3. **Kategori Cards**
   - Setiap kategori menampilkan:
     - Nama kategori
     - Status: "Aman" (<75%), "Hampir Penuh" (75-100%), "Melewati" (>100%)
     - Progress bar dengan warna kategori
     - Spent / Budget
     - Tombol: -50k, +50k (adjust budget), + Catat (quick add transaction)

**Data Flow**:
- Load seed categories dari `data.js`
- Load user budgets dari `localStorage` dengan key `'finzen-budgets-{YYYY-MM}'`
- Setiap bulan punya budget terpisah
- Saat adjust budget: update state → save ke localStorage
- Saat quick add: buka modal dengan kategori pre-filled

**Perhitungan**:
- `idealDaily = totalBudget / daysInMonth`
- `actualDaily = totalSpent / day` (hari yang sudah lewat)
- `forecast = actualDaily × daysInMonth`
- `status = forecast > totalBudget ? "Berpotensi overspend" : "Aman"`

### 4.4 Goals (`/goals`)

**Tujuan**: Mengatur target tabungan dan memantau progres

**Fitur**:
1. **Header dengan Tombol Buat Goal**
   - Tombol "+ Buat Goal" → buka `GoalModal`

2. **Filter/Sort**
   - Dropdown: Urutkan berdasarkan
     - Prioritas
     - Terdekat (due date)
     - Sisa target

3. **Visualisasi**
   - Pie Chart: Alokasi terkumpul per goal
   - Proyeksi: Rekomendasi tabungan per bulan
     - Hitung berdasarkan due date dan sisa target
     - Status: "Aman", "Mengejar", atau "Tanpa target"

4. **Goal Cards**
   - Setiap goal menampilkan:
     - Nama goal
     - Tombol Edit & Hapus
     - Progress bar (saved / target)
     - Area Chart: Sparkline tren top up (jika ada history)
     - Tombol "+ Top up"
     - Riwayat top up (6 terbaru)

**Data Flow**:
- Load seed goals dari `data.js`
- Load user goals dari `localStorage.getItem('finzen-goals')`
- Load history dari `localStorage.getItem('finzen-goal-history')`
- Saat top up:
  - Tambah ke history
  - Update `saved` pada goal
  - Simpan kedua data ke localStorage
  - Alert jika mencapai milestone (25%, 50%, 75%, 100%)

**Perhitungan**:
- `monthlyRecommendation = remaining / months` (jika ada due date)
- `riskStatus`: 
  - Jika `monthlyRecommendation / target > 0.1` → "Mengejar"
  - Jika `monthlyRecommendation / target ≤ 0.1` → "Aman"
  - Jika tidak ada due date → "Tanpa target"

**Modal Goal**:
- Form: Title, Target, Saved (opsional), Due Date (opsional), Priority
- Validasi: Title dan Target wajib
- Save/Update goal ke localStorage

**Modal Top Up**:
- Form: Date, Amount, Note
- Validasi: Amount wajib
- Update goal saved amount
- Tambah ke history
- Alert milestone

### 4.5 Laporan (`/reports`)

**Tujuan**: Analisis dan ekspor data keuangan

**Fitur**:
1. **Header dengan Tombol Ekspor**
   - Ekspor CSV (Transaksi) → semua transaksi raw
   - Ekspor CSV (Kategori/Bulan) → agregasi per kategori bulan ini
   - Ekspor PNG (IG) → summary image untuk Instagram
   - Salin Caption → copy caption untuk posting

2. **Filter Rentang Waktu**
   - Bulan ini
   - 3 bulan terakhir
   - YTD (Year to Date)

3. **Summary Cards** (3 cards)
   - Total Bulan Ini
   - MoM (Month over Month): Perbandingan dengan bulan lalu
     - Delta: `currentTotal - prevTotal`
     - Persentase: `(delta / prevTotal) × 100`
   - Variance vs Budget: Selisih dengan total anggaran

4. **Visualisasi**
   - Bar Chart: Pengeluaran per kategori (berdasarkan rentang)
   - Pie Chart: Komposisi pengeluaran (berdasarkan rentang)
   - Bar Chart: Tren harian (berdasarkan rentang)

5. **Top Kategori**
   - List 5 kategori tertinggi (sorted by value desc)

6. **Tabel Transaksi Terbaru**
   - 10 transaksi paling baru (berdasarkan rentang)

**Data Flow**:
- Load transaksi dari `localStorage.getItem('finzen-transactions')`
- Filter berdasarkan rentang waktu yang dipilih
- Agregasi per kategori dan per tanggal
- Load budget dari `localStorage.getItem('finzen-budgets-{YYYY-MM}')`
- Hitung MoM: bandingkan bulan ini vs bulan lalu
- Hitung variance: `currentTotal - budgetTotal`

**Ekspor Data**:
- **CSV Raw**: Semua transaksi dengan header `id,date,category,amount,note`
- **CSV Agg**: Agregasi per kategori dengan header `category,value`
- **PNG Summary**: Canvas-based image dengan:
  - Header: "FinZen — Monthly Summary"
  - Periode
  - 3 metric cards (Total, MoM, Vs Budget)
  - Footer: "#FinZen • jaga konsistensi finansialmu"
- **Copy Caption**: Text siap pakai untuk posting

### 4.6 Tips (`/tips`)

**Tujuan**: Edukasi finansial untuk pengguna

**Fitur**:
- Grid cards menampilkan tips dari `data.js`
- Setiap tip: Type, Title, Content
- Tipe: artikel, infografis, kuis

**Data Flow**:
- Load dari `data.js` (static data)

### 4.7 Onboarding (`/onboarding`)

**Tujuan**: Pengenalan aplikasi untuk pengguna baru

**Fitur**:
1. **Pilih Tema**
   - Tombol Light dan Dark
   - Preview langsung
   - Simpan ke localStorage

2. **Quick Actions Preview**
   - 4 card dengan link ke fitur utama
   - Deskripsi singkat setiap fitur

3. **Preview Charts**
   - Bar Chart: Komposisi pengeluaran
   - Line Chart: Tren mingguan
   - Preview visualisasi yang akan digunakan

4. **Motivasi**
   - Pesan motivasi
   - Tombol "Mulai Sekarang" → redirect ke `/`

**Data Flow**:
- Load tema dari localStorage (jika ada)
- Preview data dari `data.js`
- Setelah finish → redirect ke dashboard

## 5. Alur Data dan State Management

### 5.1 Data Storage (localStorage)

**Keys yang Digunakan**:
1. `'finzen-theme'` → `'light'` atau `'dark'`
2. `'finzen-transactions'` → Array of transaction objects
3. `'finzen-budgets-{YYYY-MM}'` → Array of category objects (per bulan)
4. `'finzen-goals'` → Array of goal objects
5. `'finzen-goal-history'` → Array of top-up history objects
6. `'finzen-last-expense-prompt'` → Date string (YYYY-MM-DD)

**Format Data**:

**Transaction**:
```javascript
{
  id: number,
  date: string, // YYYY-MM-DD
  category: string,
  amount: number,
  note: string
}
```

**Category/Budget**:
```javascript
{
  id: string,
  name: string,
  color: string,
  budget: number,
  spent: number
}
```

**Goal**:
```javascript
{
  id: string,
  title: string,
  target: number,
  saved: number,
  dueDate: string, // YYYY-MM-DD (optional)
  priority: string // 'low' | 'normal' | 'high'
}
```

**Goal History**:
```javascript
{
  id: number,
  goalId: string,
  date: string, // YYYY-MM-DD
  amount: number,
  note: string
}
```

### 5.2 State Management Pattern

**Client Component Pattern**:
- Semua halaman menggunakan `"use client"`
- State lokal menggunakan `useState`
- Side effects menggunakan `useEffect`
- Data persistence: `localStorage` (sync)
- Computed values: `useMemo` untuk optimasi

**Data Flow Pattern**:
1. **Initial Load**: 
   - `useEffect` load dari localStorage
   - Merge dengan seed data (jika perlu)
   - Set state

2. **User Action**:
   - Update state
   - Save ke localStorage
   - Re-render

3. **Computed Values**:
   - `useMemo` untuk agregasi
   - Dependensi: state yang relevan
   - Re-compute saat dependency berubah

## 6. Interaksi Pengguna (User Flow)

### 6.1 First Time User

```
1. Akses aplikasi
   ↓
2. Masuk ke /onboarding
   ↓
3. Pilih tema (Light/Dark)
   ↓
4. Preview quick actions & charts
   ↓
5. Klik "Mulai Sekarang"
   ↓
6. Masuk ke Dashboard (/)
   ↓
7. Quick Expense Modal muncul
   ↓
8. User bisa:
   - Catat transaksi hari ini → Simpan → Modal tutup
   - Skip → Modal tutup
   ↓
9. Dashboard menampilkan data seed
```

### 6.2 Daily Usage Flow

```
1. Akses aplikasi
   ↓
2. Dashboard load
   ↓
3. Cek localStorage 'finzen-last-expense-prompt'
   ↓
4. Jika berbeda dengan hari ini:
   - Tampilkan Quick Expense Modal
   ↓
5. User melihat:
   - Summary cards
   - Quick actions
   - Charts & progress
   ↓
6. User bisa:
   - Klik Quick Action → Navigate ke halaman
   - Klik menu Sidebar → Navigate ke halaman
   - Catat transaksi via modal
```

### 6.3 Transaction Management Flow

```
1. User di halaman Transactions (/transactions)
   ↓
2. Klik "+ Tambah Transaksi"
   ↓
3. Modal Add Transaction terbuka
   ↓
4. User isi form:
   - Date (default: hari ini)
   - Category (dropdown)
   - Amount
   - Note (opsional)
   ↓
5. Klik "Simpan"
   ↓
6. Validasi: Date, Category, Amount wajib
   ↓
7. Simpan ke localStorage 'finzen-transactions'
   ↓
8. Update state → Re-render list
   ↓
9. Update summary cards & charts
```

### 6.4 Budget Management Flow

```
1. User di halaman Budgeting (/budgeting)
   ↓
2. Lihat summary: Total, Terpakai, Sisa
   ↓
3. Lihat visualisasi: Donut chart, Burn rate
   ↓
4. User bisa:
   a. Adjust budget:
      - Klik -50k atau +50k
      - Budget update
      - Save ke localStorage
   b. Quick add transaction:
      - Klik "+ Catat" pada kategori
      - Modal terbuka dengan kategori pre-filled
      - Isi form → Simpan
      - Transaction tersimpan
      - Spent pada kategori update
   ↓
5. Progress bar & status update
```

### 6.5 Goal Management Flow

```
1. User di halaman Goals (/goals)
   ↓
2. Klik "+ Buat Goal"
   ↓
3. Modal Goal terbuka
   ↓
4. User isi form:
   - Title
   - Target
   - Saved (opsional)
   - Due Date (opsional)
   - Priority
   ↓
5. Klik "Simpan"
   ↓
6. Goal tersimpan ke localStorage
   ↓
7. Goal card muncul
   ↓
8. User bisa:
   a. Top up:
      - Klik "+ Top up"
      - Modal Top Up terbuka
      - Isi Amount & Note
      - Simpan
      - Saved update
      - History ditambah
      - Alert milestone (jika ada)
   b. Edit:
      - Klik "Edit"
      - Modal terbuka dengan data pre-filled
      - Update → Simpan
   c. Hapus:
      - Klik "Hapus"
      - Konfirmasi
      - Goal & history dihapus
```

### 6.6 Report Generation Flow

```
1. User di halaman Reports (/reports)
   ↓
2. Pilih rentang waktu (Bulan ini / 3 bulan / YTD)
   ↓
3. Data di-filter & di-agregasi
   ↓
4. Charts & summary update
   ↓
5. User bisa ekspor:
   a. CSV (Transaksi):
      - Download file dengan semua transaksi
   b. CSV (Kategori/Bulan):
      - Download file dengan agregasi per kategori
   c. PNG (IG):
      - Generate canvas image
      - Download PNG summary
   d. Salin Caption:
      - Copy text ke clipboard
```

## 7. Fitur Gamifikasi

### 7.1 Streak System

**Konsep**:
- Streak = hari berturut-turut user mencatat transaksi
- Tampil di Dashboard header
- Motivasi: "Jaga ritme finansialmu. Streak X hari."

**Implementasi**:
- Data streak disimpan di `userProfile.streakDays` (seed data)
- Quick Expense Modal mendorong user catat setiap hari
- `localStorage.getItem('finzen-last-expense-prompt')` track hari terakhir prompt

### 7.2 Progress Tracking

**Visual Indicators**:
- Progress bars untuk budget per kategori
- Progress bars untuk goals
- Status indicators: "Aman", "Hampir Penuh", "Melewati"
- Color coding: Green (aman), Yellow (warning), Red (danger)

### 7.3 Milestone Alerts

**Goal Milestones**:
- 25% → "🔥 Keren! Sudah melewati 25% target."
- 50% → "💪 Mantap! Sudah melewati 50% target."
- 75% → "👏 Hebat! Sudah melewati 75% target."
- 100% → "🎉 Selamat! Goal tercapai 100%!"

## 8. Responsive Design

### 8.1 Layout Structure

**Desktop (md breakpoint ke atas)**:
- Grid 2 kolom: Sidebar (260px) + Main content (1fr)
- Sidebar sticky, full height
- Charts dan cards dalam grid

**Mobile**:
- Grid 1 kolom: Sidebar di atas, Main content di bawah
- Sidebar scrollable
- Cards stack vertikal

### 8.2 Breakpoints
- Mobile: default (< 768px)
- Tablet/Desktop: `md:` (≥ 768px)
- Large Desktop: `lg:` (≥ 1024px)

## 9. Dark Mode Implementation

### 9.1 Theme Toggle
- Toggle di footer sidebar
- State: `'light'` atau `'dark'`
- Persist di localStorage

### 9.2 CSS Variables
- Menggunakan CSS variables untuk theming
- `var(--card)`, `var(--foreground)`, `var(--muted)`
- Dark mode: class `dark` pada `document.documentElement`
- Tailwind dark mode: `dark:` prefix

### 9.3 Theme Script
- Script di `layout.js` dengan strategy `beforeInteractive`
- Load tema sebelum render untuk menghindari flash
- Check localStorage → apply class

## 10. Kesimpulan

Aplikasi FinZen dirancang dengan flow yang intuitif untuk membantu Gen Z membangun kebiasaan finansial yang sehat. Fitur utama meliputi:

1. **Tracking**: Pencatatan transaksi harian
2. **Planning**: Budgeting per kategori
3. **Goal Setting**: Target tabungan dengan progres
4. **Analytics**: Laporan dan visualisasi data
5. **Education**: Tips finansial
6. **Gamification**: Streak system dan milestone alerts

Semua data disimpan di client-side (localStorage) untuk privasi dan kemudahan akses. Aplikasi menggunakan responsive design dan dark mode untuk pengalaman pengguna yang optimal di berbagai perangkat dan preferensi.

