

# 📑 Product Requirement Document (PRD)

*Nama Produk:* FinZen (Web Pengelolaan Keuangan Gen Z)
*Target Pengguna:* Generasi Z (usia 18–26 tahun, mahasiswa & pekerja muda, aktif digital)
*Platform:* Web app (desktop & mobile browser)
*Metode Desain:* User-Centered Design (ISO 9241-210)

---

## 1. Latar Belakang

* *Masalah:*

  * Literasi finansial Gen Z rendah (SNLIK 2022: 49,68%).
  * 72% pengguna berhenti memakai aplikasi finansial dalam 3 bulan (rendah retensi).
  * Gaya hidup konsumtif dan impulsif membuat Gen Z sulit konsisten.
* *Solusi:*

  * Aplikasi web dengan fitur keuangan dasar, visual interaktif, dan gamifikasi streak system.
  * Mengedepankan desain UI/UX sesuai preferensi Gen Z (visual, cepat, gamified).

---

## 2. Tujuan Produk

* Membantu Gen Z mengelola keuangan dengan cara *mudah, menarik, dan konsisten*.
* Meningkatkan *engagement* dengan streak system.
* Mendukung peningkatan *literasi finansial* dengan edukasi ringan.

---

## 3. Fitur Utama

1. *Onboarding Interaktif*

   * Penjelasan manfaat aplikasi dengan ilustrasi.
   * Pilihan tema awal (Light/Dark).

2. *Dashboard Keuangan Pribadi*

   * Ringkasan saldo, pengeluaran hari ini, anggaran, dan goals.
   * Tampilan berbasis card UI.

3. *Pencatatan Transaksi*

   * Input cepat (tanggal, kategori, jumlah, catatan).
   * Kategori default: makan, transportasi, hiburan, tabungan.

4. *Perencanaan Anggaran (Budgeting Tool)*

   * Menetapkan batas pengeluaran per kategori.
   * Indikator progres: hijau (aman), kuning (hampir penuh), merah (melewati).

5. *Tujuan Finansial (Saving Goals)*

   * Membuat target tabungan.
   * Progress bar dengan update otomatis.

6. *Laporan & Statistik Keuangan*

   * Grafik pengeluaran bulanan (pie/bar chart).
   * Tren tabungan.

7. *Tips Edukasi Finansial*

   * Artikel pendek, infografis, kuis ringan.

8. *Gamifikasi – Streak System*

   * Streak harian untuk konsistensi pencatatan transaksi.
   * Notifikasi “jangan putus streak hari ini”.
   * Badge sederhana sebagai reward virtual.

---

## 4. Alur Pengguna (User Flow)

1. *Onboarding → Registrasi/Login → Pilih Tema → Dashboard*
2. *Dashboard → Tambah Transaksi / Atur Anggaran / Goals*
3. *Streak aktif jika mencatat transaksi → ditampilkan di dashboard*
4. *Pengguna melihat laporan bulanan → baca tips edukasi*

---

## 5. Guideline UI/UX

* *Warna Utama:* Biru/Hijau (stabilitas & keuangan).
* *Accent:* Kuning (optimisme, CTA), Ungu Neon (highlight streak).
* *Typography:* Sans-serif modern (Poppins, Inter, atau Nunito).
* *Layout:* Card-based, clean, dengan white space.
* *Mode:* Light & Dark mode.
* *Microinteraction:* Animasi singkat saat transaksi dicatat & streak naik.

---

## 6. Teknologi
* *Visualisasi:* Chart.js / Recharts.
* *Deployment:* Vercel / Netlify.

---

## 7. Evaluasi

* *Usability Testing:* skenario (input transaksi, buat anggaran, capai streak).
* *Alat ukur:* System Usability Scale (SUS), target skor ≥ 70.
* *Feedback:* wawancara singkat pasca uji coba.

---

## 8. KPI

* *Retention rate mingguan*.
* *Rata-rata panjang streak per user*.
* *Jumlah transaksi tercatat per user*.
* *Daily Active Users (DAU)*.

---