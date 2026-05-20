export const userProfile = {
  name: "Ayu",
  streakDays: 5,
  theme: "light",
};

export const dashboardSummary = {
  balance: 2500000,
  todaySpending: 55000,
  monthlyBudgetUsedPct: 0.42,
  goalsProgressAvg: 0.33,
};

/** Kategori pengeluaran (budget & transaksi keluar) */
export const categories = [
  { id: "food", name: "Makan", color: "#3B82F6", budget: 600000, spent: 220000 },
  { id: "transport", name: "Transportasi", color: "#22C55E", budget: 300000, spent: 120000 },
  { id: "entertainment", name: "Hiburan", color: "#A855F7", budget: 400000, spent: 260000 },
  { id: "savings", name: "Tabungan", color: "#EAB308", budget: 800000, spent: 800000 },
  { id: "other_expense", name: "Lainnya", color: "#6B7280", budget: 0, spent: 0 },
];

/** Kategori pemasukan */
export const incomeCategories = [
  { id: "salary", name: "Gaji" },
  { id: "allowance", name: "Uang Saku" },
  { id: "bonus", name: "Bonus" },
  { id: "transfer_in", name: "Transfer Masuk" },
  { id: "other_income", name: "Lainnya (Pemasukan)" },
];

export const transactions = [
  { id: 1, date: "2025-09-28", category: "Makan", amount: 25000, note: "Sarapan" },
  { id: 2, date: "2025-09-28", category: "Transportasi", amount: 12000, note: "Bus kampus" },
  { id: 3, date: "2025-09-29", category: "Hiburan", amount: 45000, note: "Spotify" },
  { id: 4, date: "2025-09-30", category: "Makan", amount: 30000, note: "Makan siang" },
];

export const goals = [
  { id: "laptop", title: "Beli Laptop", target: 10000000, saved: 3500000 },
  { id: "trip", title: "Liburan Bali", target: 3000000, saved: 1200000 },
];

export const monthlySpendingByCategory = [
  { category: "Makan", value: 220000 },
  { category: "Transportasi", value: 120000 },
  { category: "Hiburan", value: 260000 },
  { category: "Tabungan", value: 800000 },
];

export const tips = [
  { id: 1, title: "Atur 50/30/20", type: "artikel", content: "Pisahkan kebutuhan, keinginan, dan tabungan." },
  { id: 2, title: "Hentikan impulse buying", type: "infografis", content: "Tunggu 24 jam sebelum membeli." },
  { id: 3, title: "Kuis singkat budgeting", type: "kuis", content: "Berapa % ideal untuk tabungan?" },
];

export function formatCurrency(idr) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(idr);
}


