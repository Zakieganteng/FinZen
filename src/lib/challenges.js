/**
 * Weekly Challenge Definitions
 */

export const challengeTemplates = [
  {
    id: "transaction_count_5",
    type: "transaction_count",
    title: "Catat 5 Transaksi Minggu Ini",
    description: "Tingkatkan konsistensimu dengan mencatat minimal 5 transaksi dalam seminggu.",
    target: 5,
    reward: {
      type: "badge",
      value: "Week Starter",
    },
  },
  {
    id: "transaction_count_7",
    type: "transaction_count",
    title: "Catat 7 Transaksi Minggu Ini",
    description: "Jaga ritme harian dengan mencatat transaksi setiap hari.",
    target: 7,
    reward: {
      type: "celebration",
      value: "Perfect Week",
    },
  },
  {
    id: "budget_track_80",
    type: "budget_track",
    title: "Jaga Budget di Bawah 80%",
    description: "Kontrol pengeluaranmu dengan menjaga semua kategori budget di bawah 80%.",
    target: { threshold: 0.8 },
    reward: {
      type: "insight",
      value: "Budget Pro",
    },
  },
  {
    id: "budget_track_70",
    type: "budget_track",
    title: "Jaga Budget di Bawah 70%",
    description: "Tingkatkan kontrol finansialmu dengan menjaga budget lebih ketat.",
    target: { threshold: 0.7 },
    reward: {
      type: "celebration",
      value: "Budget Master",
    },
  },
  {
    id: "goal_topup_1",
    type: "goal_topup",
    title: "Top Up Goal Minimal 1x",
    description: "Langkah kecil menuju goal besar. Top up goal minimal 1x minggu ini.",
    target: { count: 1 },
    reward: {
      type: "celebration",
      value: "Goal Progress",
    },
  },
  {
    id: "goal_topup_2",
    type: "goal_topup",
    title: "Top Up Goal Minimal 2x",
    description: "Konsistensi adalah kunci. Top up goal minimal 2x minggu ini.",
    target: { count: 2 },
    reward: {
      type: "badge",
      value: "Goal Focused",
    },
  },
];

/**
 * Get challenge by ID
 */
export function getChallengeById(id) {
  return challengeTemplates.find((c) => c.id === id);
}

/**
 * Get random challenge
 */
export function getRandomChallenge() {
  return challengeTemplates[Math.floor(Math.random() * challengeTemplates.length)];
}

