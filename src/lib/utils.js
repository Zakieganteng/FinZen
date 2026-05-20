import toast from "react-hot-toast";
import { supabase } from "./supabase/client";

/**
 * Show toast notification
 * @param {string} message - Toast message
 * @param {string} type - Toast type: 'success', 'info', 'warning', 'error'
 */
export function showToast(message, type = "success") {
  switch (type) {
    case "success":
      toast.success(message);
      break;
    case "info":
      toast(message, {
        icon: "ℹ️",
      });
      break;
    case "warning":
      toast(message, {
        icon: "⚠️",
      });
      break;
    case "error":
      toast.error(message);
      break;
    default:
      toast(message);
  }
}

/**
 * Format number ke string dengan pemisah ribuan (IDR format)
 * @param {string|number} value - Nilai yang akan di-format
 * @returns {string} - String dengan format 50.000
 */
export function formatCurrencyInput(value) {
  if (!value && value !== 0) return "";
  // Hapus semua karakter non-digit
  const numericValue = String(value).replace(/\D/g, "");
  if (!numericValue) return "";
  // Format dengan pemisah ribuan
  return Number(numericValue).toLocaleString("id-ID");
}

/**
 * Parse string dengan pemisah ribuan ke number
 * @param {string} value - String dengan format "50.000"
 * @returns {number} - Number (50000)
 */
export function parseCurrencyInput(value) {
  if (!value) return 0;
  // Hapus semua karakter non-digit
  const numericValue = String(value).replace(/\D/g, "");
  return Number(numericValue) || 0;
}

/**
 * Handler untuk onChange input currency
 * Auto-format saat user mengetik
 * @param {Event} e - Change event
 * @param {Function} setForm - State setter function
 * @param {string} fieldName - Nama field di form state
 */
export function handleCurrencyInputChange(e, setForm, fieldName) {
  const rawValue = e.target.value;
  // Jika kosong, set empty string
  if (!rawValue) {
    setForm((prev) => ({ ...prev, [fieldName]: "" }));
    return;
  }
  // Format dengan pemisah ribuan
  const formatted = formatCurrencyInput(rawValue);
  setForm((prev) => ({ ...prev, [fieldName]: formatted }));
}

/**
 * Get smart category suggestion based on user patterns
 * @param {Array} transactions - Array of transaction objects
 * @param {Date} currentTime - Current time
 * @returns {Object} { category: string, confidence: number, reason: string }
 */
export function getSmartCategorySuggestion(transactions = [], currentTime = new Date()) {
  // Priority 1: Last used category from localStorage
  if (typeof window !== "undefined") {
    const lastCategory = localStorage.getItem("finzen-last-category");
    if (lastCategory) {
      return {
        category: lastCategory,
        confidence: 0.9,
        reason: "last_used",
      };
    }
  }

  // Priority 2: Most frequent category at same time (±2 hours)
  const currentHour = currentTime.getHours();
  const timeWindow = [currentHour - 2, currentHour + 2].map((h) => (h + 24) % 24);

  const categoryFrequency = {};
  transactions.forEach((t) => {
    if (!t.date || !t.category) return;
    const txDate = new Date(t.date);
    const txHour = txDate.getHours();

    // Check if transaction is within time window
    const inWindow = timeWindow.some((w) => {
      if (w > currentHour) {
        return txHour >= w || txHour <= currentHour;
      } else {
        return txHour >= w && txHour <= currentHour;
      }
    });

    if (inWindow) {
      categoryFrequency[t.category] = (categoryFrequency[t.category] || 0) + 1;
    }
  });

  // Find most frequent category
  const mostFrequent = Object.entries(categoryFrequency).sort((a, b) => b[1] - a[1])[0];
  if (mostFrequent && mostFrequent[1] >= 2) {
    return {
      category: mostFrequent[0],
      confidence: Math.min(0.8, 0.5 + mostFrequent[1] * 0.1),
      reason: "time_pattern",
    };
  }

  // Priority 3: Default by time of day
  let defaultCategory = "Makan"; // fallback
  if (currentHour >= 6 && currentHour < 12) {
    defaultCategory = "Makan";
  } else if (currentHour >= 12 && currentHour < 18) {
    defaultCategory = "Transportasi";
  } else if (currentHour >= 18 && currentHour < 24) {
    defaultCategory = "Hiburan";
  }

  return {
    category: defaultCategory,
    confidence: 0.3,
    reason: "time_default",
  };
}

/**
 * Calculate streak from transactions
 * @param {Array} transactions - Array of transaction objects
 * @returns {number} Streak days
 */
export function calculateStreak(transactions = []) {
  if (!transactions.length) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get unique dates with transactions, sorted descending
  const dates = [...new Set(transactions.map(t => t.date))].sort((a, b) => b.localeCompare(a));
  
  let streak = 0;
  let currentDate = new Date(today);
  
  for (const dateStr of dates) {
    const txDate = new Date(dateStr);
    txDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((currentDate - txDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === streak) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}

/**
 * Get daily focus action based on priority logic
 * @param {Array} transactions - Array of transaction objects
 * @param {Array} budgets - Array of budget/category objects
 * @param {Array} goals - Array of goal objects
 * @param {number} streak - Current streak days
 * @returns {Object} Action object with type, priority, and related data
 */
export function getDailyFocusAction(transactions = [], budgets = [], goals = [], streak = 0) {
  const today = new Date();
  const ymd = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  
  // Priority 1: Check if no transaction today
  const hasTransactionToday = transactions.some(t => t.date === ymd);
  if (!hasTransactionToday) {
    return {
      type: "record_transaction",
      priority: 1,
      title: "Catat Pengeluaran Hari Ini",
      description: "Mulai hari dengan mencatat transaksi pertama.",
      icon: "📝",
      color: "#3B82F6", // Blue
    };
  }
  
  // Priority 2: Check budget hampir penuh (>80%)
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const budgetKey = `finzen-budgets-${ym}`;
  let userBudgets = budgets;
  
  if (typeof window !== "undefined" && !userBudgets.length) {
    try {
      userBudgets = JSON.parse(localStorage.getItem(budgetKey) || "[]");
    } catch (e) {}
  }
  
  if (userBudgets.length) {
    const criticalBudget = userBudgets.find(c => {
      const pct = c.spent / Math.max(1, c.budget);
      return pct > 0.8;
    });
    
    if (criticalBudget) {
      return {
        type: "check_budget",
        priority: 2,
        category: criticalBudget.name,
        categoryId: criticalBudget.id,
        title: `Cek Anggaran ${criticalBudget.name}`,
        description: `Anggaran ${criticalBudget.name} sudah ${Math.round((criticalBudget.spent / criticalBudget.budget) * 100)}% terpakai.`,
        icon: "⚠️",
        color: "#EAB308", // Yellow
      };
    }
  }
  
  // Priority 3: Check goal mendekati deadline (<30 hari)
  let userGoals = goals;
  if (typeof window !== "undefined" && !userGoals.length) {
    try {
      userGoals = JSON.parse(localStorage.getItem("finzen-goals") || "[]");
    } catch (e) {}
  }
  
  if (userGoals.length) {
    const urgentGoal = userGoals
      .filter(g => g.dueDate)
      .map(g => {
        const dueDate = new Date(g.dueDate);
        const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        const remaining = g.target - g.saved;
        const monthlyNeeded = remaining / Math.max(1, daysLeft / 30);
        return { ...g, daysLeft, monthlyNeeded };
      })
      .filter(g => g.daysLeft > 0 && g.daysLeft < 30)
      .sort((a, b) => a.daysLeft - b.daysLeft)[0];
    
    if (urgentGoal) {
      return {
        type: "topup_goal",
        priority: 3,
        goal: urgentGoal,
        title: `Top Up Goal: ${urgentGoal.title}`,
        description: `Tersisa ${urgentGoal.daysLeft} hari. Butuh Rp ${Math.ceil(urgentGoal.monthlyNeeded).toLocaleString("id-ID")}/bulan.`,
        icon: "🎯",
        color: "#F97316", // Orange
      };
    }
  }
  
  // Priority 4: Check streak < 3 hari
  if (streak < 3 && streak > 0) {
    return {
      type: "maintain_streak",
      priority: 4,
      title: "Jaga Streak Hari Ini",
      description: `Streak ${streak} hari! Catat transaksi hari ini untuk mempertahankannya.`,
      icon: "🔥",
      color: "#A855F7", // Purple
    };
  }
  
  // Default: Record transaction
  return {
    type: "record_transaction",
    priority: 5,
    title: "Catat Pengeluaran Hari Ini",
    description: "Tetap konsisten dengan mencatat setiap transaksi.",
    icon: "📝",
    color: "#3B82F6", // Blue
  };
}

/**
 * Generate insights based on user data
 * @param {Array} transactions - Array of transaction objects
 * @param {Array} budgets - Array of budget/category objects
 * @param {Array} goals - Array of goal objects
 * @param {number} streak - Current streak days
 * @param {number} maxInsights - Maximum number of insights (for A/B testing)
 * @returns {Array} Array of insight objects
 */
export function generateInsights(transactions = [], budgets = [], goals = [], streak = 0, maxInsights = 3) {
  const insights = [];
  const today = new Date();
  const ymd = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  
  // Insight 1: Spending Increase (week-over-week)
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
  thisWeekStart.setHours(0, 0, 0, 0);
  
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  
  const thisWeekEnd = new Date(thisWeekStart);
  thisWeekEnd.setDate(thisWeekEnd.getDate() + 7);
  
  const lastWeekEnd = new Date(lastWeekStart);
  lastWeekEnd.setDate(lastWeekEnd.getDate() + 7);
  
  const thisWeekTx = transactions.filter(t => {
    const txDate = new Date(t.date);
    return txDate >= thisWeekStart && txDate < thisWeekEnd;
  });
  
  const lastWeekTx = transactions.filter(t => {
    const txDate = new Date(t.date);
    return txDate >= lastWeekStart && txDate < lastWeekEnd;
  });
  
  // Group by category
  const thisWeekByCat = {};
  const lastWeekByCat = {};
  
  thisWeekTx.forEach(t => {
    thisWeekByCat[t.category] = (thisWeekByCat[t.category] || 0) + t.amount;
  });
  
  lastWeekTx.forEach(t => {
    lastWeekByCat[t.category] = (lastWeekByCat[t.category] || 0) + t.amount;
  });
  
  // Find category with >20% increase
  for (const [category, thisWeekAmount] of Object.entries(thisWeekByCat)) {
    const lastWeekAmount = lastWeekByCat[category] || 0;
    if (lastWeekAmount > 0) {
      const increase = ((thisWeekAmount - lastWeekAmount) / lastWeekAmount) * 100;
      if (increase > 20) {
        insights.push({
          type: "spending_increase",
          message: `Pengeluaran ${category} naik ${Math.round(increase)}% vs minggu lalu`,
          icon: "📈",
          color: "#EAB308", // Yellow - warning
          priority: 1,
        });
        break;
      }
    }
  }
  
  // Insight 2: Budget Warning
  if (budgets.length) {
    const totalBudget = budgets.reduce((s, c) => s + c.budget, 0);
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const idealDaily = totalBudget / daysInMonth;
    
    const todaySpending = transactions
      .filter(t => t.date === ymd)
      .reduce((s, t) => s + t.amount, 0);
    
    const pct = idealDaily > 0 ? (todaySpending / idealDaily) * 100 : 0;
    if (pct > 80) {
      insights.push({
        type: "budget_warning",
        message: `Hari ini sudah ${Math.round(pct)}% dari budget harian ideal`,
        icon: "⚠️",
        color: "#EAB308", // Yellow - warning
        priority: 2,
      });
    }
  }
  
  // Insight 3: Streak Milestone
  const milestones = [5, 10, 15, 30];
  const reachedMilestone = milestones.find(m => streak >= m && streak < m + 1);
  if (reachedMilestone) {
    insights.push({
      type: "streak_milestone",
      message: `Streak ${streak} hari! Pertahankan momentum`,
      icon: "🔥",
      color: "#22C55E", // Green - success
      priority: 3,
    });
  }
  
  // Insight 4: Goal Progress
  if (goals.length) {
    const approachingGoal = goals.find(g => {
      const pct = g.saved / Math.max(1, g.target);
      const remaining = g.target - g.saved;
      // Approaching 25%, 50%, or 75%
      return (pct >= 0.2 && pct < 0.25) || (pct >= 0.45 && pct < 0.5) || (pct >= 0.7 && pct < 0.75);
    });
    
    if (approachingGoal) {
      const pct = Math.round((approachingGoal.saved / approachingGoal.target) * 100);
      const nextMilestone = pct < 25 ? 25 : pct < 50 ? 50 : 75;
      const remaining = (approachingGoal.target * nextMilestone / 100) - approachingGoal.saved;
      
      insights.push({
        type: "goal_progress",
        message: `Goal "${approachingGoal.title}" butuh Rp ${Math.ceil(remaining).toLocaleString("id-ID")} lagi untuk milestone ${nextMilestone}%`,
        icon: "🎯",
        color: "#3B82F6", // Blue - info
        priority: 4,
      });
    }
  }
  
  // Sort by priority and return max insights
  return insights.sort((a, b) => a.priority - b.priority).slice(0, maxInsights);
}

/**
 * Check if milestone was crossed
 * @param {number} current - Current saved amount
 * @param {number} target - Target amount
 * @param {number} previous - Previous saved amount
 * @returns {Object|null} { milestone: number } if milestone crossed, null otherwise
 */
export function checkMilestone(current, target, previous = 0) {
  if (!target || target <= 0) return null;
  
  const milestones = [0.25, 0.5, 0.75, 1.0];
  const previousPct = previous / target;
  const currentPct = current / target;
  
  for (const milestone of milestones) {
    if (previousPct < milestone && currentPct >= milestone) {
      return {
        milestone: milestone * 100, // Return as percentage (25, 50, 75, 100)
        crossed: true,
      };
    }
  }
  
  return null;
}

/**
 * Check and unlock badges based on type and data
 * @param {string} type - Badge type: 'transaction' | 'budget' | 'goal' | 'streak'
 * @param {Object} data - Relevant data for checking
 * @returns {Array} Array of newly unlocked badge IDs
 */
export function checkBadges(type, data) {
  if (typeof window === "undefined") return [];
  
  const { badgeDefinitions } = require("./badges");
  
  try {
    // Load existing unlocked badges
    const unlocked = JSON.parse(localStorage.getItem("finzen-badges") || "[]");
    const unlockedIds = new Set(unlocked.map(b => b.id));
    
    const newlyUnlocked = [];
    
    // Filter badges by type/category
    const relevantBadges = badgeDefinitions.filter(badge => {
      if (type === "streak" && badge.category === "consistency") return true;
      if (type === "transaction" && badge.category === "transaction") return true;
      if (type === "budget" && badge.category === "budget") return true;
      if (type === "goal" && badge.category === "goal") return true;
      return false;
    });
    
    // Check each relevant badge
    for (const badge of relevantBadges) {
      if (unlockedIds.has(badge.id)) continue; // Already unlocked
      
      if (badge.condition(data)) {
        // Unlock badge
        const unlockData = {
          id: badge.id,
          unlockedAt: new Date().toISOString(),
        };
        unlocked.push(unlockData);
        newlyUnlocked.push(badge.id);
      }
    }
    
    // Save updated badges
    if (newlyUnlocked.length > 0) {
      localStorage.setItem("finzen-badges", JSON.stringify(unlocked));
    }
    
    return newlyUnlocked;
  } catch (e) {
    console.error("Error checking badges:", e);
    return [];
  }
}

/**
 * Get current week in YYYY-WW format
 * @returns {string} Week string (e.g., "2025-01")
 */
export function getCurrentWeek() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
  const week = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `${now.getFullYear()}-${String(week).padStart(2, "0")}`;
}

/**
 * Get Monday and Sunday of current week
 * @returns {Object} { monday: Date, sunday: Date }
 */
export function getWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { monday, sunday };
}

/**
 * Generate weekly challenge for current week
 * @returns {Object} Challenge object with startDate and endDate
 */
export function generateWeeklyChallenge() {
  if (typeof window === "undefined") return null;

  const week = getCurrentWeek();
  const storageKey = `finzen-weekly-challenge-${week}`;

  try {
    // Check if challenge already exists for this week
    const existing = localStorage.getItem(storageKey);
    if (existing) {
      return JSON.parse(existing);
    }

    // Generate new challenge
    const { getRandomChallenge } = require("./challenges");
    const challenge = getRandomChallenge();
    const { monday, sunday } = getWeekRange();

    const weeklyChallenge = {
      ...challenge,
      startDate: monday.toISOString().split("T")[0],
      endDate: sunday.toISOString().split("T")[0],
      week,
    };

    // Save to localStorage
    localStorage.setItem(storageKey, JSON.stringify(weeklyChallenge));

    return weeklyChallenge;
  } catch (e) {
    console.error("Error generating weekly challenge:", e);
    return null;
  }
}

/**
 * Check challenge progress
 * @param {Object} challenge - Challenge object
 * @param {Array} transactions - Array of transactions
 * @param {Array} budgets - Array of budgets
 * @param {Array} goals - Array of goals
 * @param {Array} goalHistory - Array of goal top up history
 * @returns {Object} { progress: number, target: number, completed: boolean }
 */
export function checkChallengeProgress(challenge, transactions = [], budgets = [], goals = [], goalHistory = []) {
  if (!challenge) return { progress: 0, target: 0, completed: false };

  const { monday, sunday } = getWeekRange();
  const mondayStr = monday.toISOString().split("T")[0];
  const sundayStr = sunday.toISOString().split("T")[0];

  switch (challenge.type) {
    case "transaction_count":
      const weekTransactions = transactions.filter(
        (t) => t.date >= mondayStr && t.date <= sundayStr
      );
      const progress = weekTransactions.length;
      const target = challenge.target;
      return {
        progress,
        target,
        completed: progress >= target,
      };

    case "budget_track":
      const threshold = challenge.target.threshold;
      const allOnTrack = budgets.every((b) => {
        const pct = b.spent / Math.max(1, b.budget);
        return pct <= threshold;
      });
      return {
        progress: allOnTrack ? 1 : 0,
        target: 1,
        completed: allOnTrack,
      };

    case "goal_topup":
      const weekTopUps = goalHistory.filter(
        (h) => h.date >= mondayStr && h.date <= sundayStr
      );
      const topUpCount = weekTopUps.length;
      const targetCount = challenge.target.count;
      return {
        progress: topUpCount,
        target: targetCount,
        completed: topUpCount >= targetCount,
      };

    default:
      return { progress: 0, target: 0, completed: false };
  }
}

/**
 * Find repeatable transactions (same category & similar amount within 7 days)
 * @param {Array} transactions - Array of transaction objects
 * @param {string} category - Category to check (optional)
 * @param {number} amount - Amount to check (optional)
 * @param {number} days - Number of days to look back (default: 7)
 * @returns {Array} Array of repeatable transactions with count and lastDate
 */
export function findRepeatableTransactions(transactions = [], category = null, amount = null, days = 7) {
  if (!transactions.length) return [];

  const today = new Date();
  const cutoffDate = new Date(today);
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoffStr = cutoffDate.toISOString().split("T")[0];

  // Filter transactions within date range
  const recentTx = transactions.filter((t) => t.date >= cutoffStr);

  // Group by category
  const byCategory = {};
  recentTx.forEach((t) => {
    if (!byCategory[t.category]) {
      byCategory[t.category] = [];
    }
    byCategory[t.category].push(t);
  });

  const repeatable = [];

  // For each category, find similar amounts
  Object.entries(byCategory).forEach(([cat, txs]) => {
    if (category && cat !== category) return;

    // Group by similar amount (±10%)
    const byAmount = {};
    txs.forEach((t) => {
      const amountKey = Math.round(t.amount / 1000) * 1000; // Round to nearest 1000
      if (!byAmount[amountKey]) {
        byAmount[amountKey] = [];
      }
      byAmount[amountKey].push(t);
    });

    // Find amounts with 2+ occurrences
    Object.entries(byAmount).forEach(([amtKey, group]) => {
      if (group.length >= 2) {
        // Check if amount matches (if specified)
        if (amount) {
          const tolerance = amount * 0.1; // ±10%
          const matches = group.filter((t) => Math.abs(t.amount - amount) <= tolerance);
          if (matches.length === 0) return;
        }

        // Sort by date, get most recent
        const sorted = group.sort((a, b) => b.date.localeCompare(a.date));
        const lastTx = sorted[0];

        repeatable.push({
          transaction: lastTx,
          count: group.length,
          lastDate: lastTx.date,
          category: cat,
          averageAmount: Math.round(group.reduce((s, t) => s + t.amount, 0) / group.length),
        });
      }
    });
  });

  // Sort by frequency (most frequent first), return max 3
  return repeatable.sort((a, b) => b.count - a.count).slice(0, 3);
}

/**
 * Generate share text for goal achievement
 * @param {Object} goal - Goal object
 * @param {number} milestone - Milestone percentage (optional)
 * @returns {string} Share text
 */
export function generateShareText(goal, milestone = null) {
  if (!goal) return "";
  
  const progress = Math.round((goal.saved / goal.target) * 100);
  const message = milestone
    ? `🎉 Milestone ${milestone}% tercapai! ${goal.title} - ${progress}%`
    : `🎉 Goal tercapai! ${goal.title} - ${progress}%
#FinZen #FinancialHabit`;
  
  return message;
}

/**
 * Generate share image for goal achievement (optional)
 * @param {Object} goal - Goal object
 * @param {number} milestone - Milestone percentage (optional)
 * @returns {Promise<string>} Data URL of generated image
 */
export async function generateShareImage(goal, milestone = null) {
  if (typeof window === "undefined" || !goal) return null;
  
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext("2d");
    
    // Background
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 48px Arial";
    ctx.textAlign = "center";
    ctx.fillText("🎉 Goal Tercapai!", canvas.width / 2, 200);
    
    // Goal name
    ctx.font = "36px Arial";
    ctx.fillText(goal.title, canvas.width / 2, 300);
    
    // Progress
    const progress = Math.round((goal.saved / goal.target) * 100);
    ctx.font = "bold 72px Arial";
    ctx.fillText(`${progress}%`, canvas.width / 2, 450);
    
    // Amount
    ctx.font = "24px Arial";
    ctx.fillText(
      `${goal.saved.toLocaleString("id-ID")} / ${goal.target.toLocaleString("id-ID")}`,
      canvas.width / 2,
      550
    );
    
    // Branding
    ctx.font = "20px Arial";
    ctx.fillStyle = "#9ca3af";
    ctx.fillText("FinZen - Financial Habit", canvas.width / 2, 1000);
    
    resolve(canvas.toDataURL("image/png"));
  });
}

/**
 * Save user feedback
 * @param {Object} feedback - Feedback object
 */
export async function saveFeedback(feedback, userId) {
  try {
    const payload = {
      rating: feedback.rating,
      comment: feedback.comment || "",
      category: feedback.category || "other",
      user_id: userId || null,
    };

    const { error } = await supabase.from("feedback").insert(payload);
    if (error) throw error;
  } catch (e) {
    console.error("Error saving feedback:", e);
    showToast("⚠ Gagal menyimpan feedback", "error");
  }
}

/**
 * Export feedback as CSV
 */
export function exportFeedbackAsCSV() {
  // Untuk saat ini, export akan tersedia di Admin Dashboard berbasis Supabase.
  showToast("Export feedback tersedia di Admin Dashboard", "info");
}

