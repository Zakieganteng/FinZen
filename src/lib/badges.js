/**
 * Badge definitions with conditions
 */

export const badgeDefinitions = [
  // Consistency badges
  {
    id: "first_week",
    name: "First Week",
    description: "Telah mencatat transaksi selama 7 hari berturut-turut",
    icon: "🔥",
    category: "consistency",
    condition: (data) => {
      // data: { streak }
      return data.streak >= 7;
    },
  },
  {
    id: "month_warrior",
    name: "Month Warrior",
    description: "Telah mencatat transaksi selama 30 hari berturut-turut",
    icon: "⚡",
    category: "consistency",
    condition: (data) => {
      // data: { streak }
      return data.streak >= 30;
    },
  },
  
  // Transaction badges — simulasi pencatat (tier 5 / 10 / 15)
  {
    id: "catatan_5",
    name: "Pencatat Pemula",
    description: "Telah mencatat minimal 5 transaksi",
    icon: "📒",
    category: "transaction",
    threshold: 5,
    condition: (data) => data.transactionCount >= 5,
  },
  {
    id: "catatan_10",
    name: "Pencatat Aktif",
    description: "Telah mencatat minimal 10 transaksi",
    icon: "📗",
    category: "transaction",
    threshold: 10,
    condition: (data) => data.transactionCount >= 10,
  },
  {
    id: "catatan_15",
    name: "Pencatat Rajin",
    description: "Telah mencatat minimal 15 transaksi",
    icon: "📘",
    category: "transaction",
    threshold: 15,
    condition: (data) => data.transactionCount >= 15,
  },
  {
    id: "record_keeper",
    name: "Record Keeper",
    description: "Telah mencatat 100 transaksi",
    icon: "📝",
    category: "transaction",
    condition: (data) => {
      // data: { transactionCount }
      return data.transactionCount >= 100;
    },
  },
  {
    id: "daily_tracker",
    name: "Daily Tracker",
    description: "Mencatat transaksi selama 30 hari berturut-turut",
    icon: "📅",
    category: "transaction",
    condition: (data) => {
      // data: { consecutiveDays }
      return data.consecutiveDays >= 30;
    },
  },
  
  // Budget badges
  {
    id: "budget_master",
    name: "Budget Master",
    description: "1 bulan tidak overspend di semua kategori",
    icon: "💰",
    category: "budget",
    condition: (data) => {
      // data: { budgets, month }
      // Check if all categories spent <= budget for the month
      if (!data.budgets || !data.budgets.length) return false;
      return data.budgets.every(c => c.spent <= c.budget);
    },
  },
  {
    id: "smart_spender",
    name: "Smart Spender",
    description: "3 bulan berturut-turut on track dengan budget",
    icon: "🧠",
    category: "budget",
    condition: (data) => {
      // data: { monthsOnTrack }
      // Simplified: check if current month on track
      return data.monthsOnTrack >= 3;
    },
  },
  
  // Goal badges
  {
    id: "goal_getter",
    name: "Goal Getter",
    description: "Berhasil mencapai 1 goal",
    icon: "🎯",
    category: "goal",
    condition: (data) => {
      // data: { completedGoals }
      return data.completedGoals >= 1;
    },
  },
  {
    id: "multi_achiever",
    name: "Multi Achiever",
    description: "Berhasil mencapai 3 goals",
    icon: "🏆",
    category: "goal",
    condition: (data) => {
      // data: { completedGoals }
      return data.completedGoals >= 3;
    },
  },
];

/**
 * Get badge by ID
 */
export function getBadgeById(id) {
  return badgeDefinitions.find(b => b.id === id);
}

/**
 * Get badges by category
 */
export function getBadgesByCategory(category) {
  return badgeDefinitions.filter(b => b.category === category);
}

/** Badge simulasi: penghargaan mencatat transaksi (5, 10, 15) */
export const recordingBadgeDefinitions = badgeDefinitions.filter(
  (b) => b.id === "catatan_5" || b.id === "catatan_10" || b.id === "catatan_15"
);

export const RECORDING_BADGE_IDS = recordingBadgeDefinitions.map((b) => b.id);

/** Prioritas modal: tier tertinggi yang baru terbuka */
export function pickRecordingBadgeUnlock(newlyUnlocked = []) {
  const recording = newlyUnlocked.filter((id) => RECORDING_BADGE_IDS.includes(id));
  if (recording.length === 0) return newlyUnlocked[0] ?? null;
  const order = new Map(RECORDING_BADGE_IDS.map((id, i) => [id, i]));
  return recording.sort((a, b) => order.get(b) - order.get(a))[0];
}

