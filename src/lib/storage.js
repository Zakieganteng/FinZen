/**
 * Optimized localStorage utilities with batching support
 */

const BATCH_DELAY = 100; // ms
const pendingWrites = new Map();
let batchTimeout = null;

/**
 * Batch write to localStorage
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 */
export function batchWrite(key, value) {
  pendingWrites.set(key, value);
  
  if (batchTimeout) {
    clearTimeout(batchTimeout);
  }
  
  batchTimeout = setTimeout(() => {
    if (typeof window !== "undefined") {
      try {
        pendingWrites.forEach((val, k) => {
          localStorage.setItem(k, typeof val === "string" ? val : JSON.stringify(val));
        });
        pendingWrites.clear();
      } catch (e) {
        console.error("Error batching localStorage writes:", e);
      }
    }
  }, BATCH_DELAY);
}

/**
 * Batch read from localStorage
 * @param {Array<string>} keys - Array of keys to read
 * @returns {Object} Object with key-value pairs
 */
export function batchRead(keys) {
  if (typeof window === "undefined") return {};
  
  const result = {};
  try {
    keys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value !== null) {
        try {
          result[key] = JSON.parse(value);
        } catch {
          result[key] = value;
        }
      }
    });
  } catch (e) {
    console.error("Error batching localStorage reads:", e);
  }
  return result;
}

/**
 * Cleanup old localStorage data (optional)
 * Remove data older than specified days
 * @param {number} daysToKeep - Number of days to keep
 */
export function cleanupOldData(daysToKeep = 90) {
  if (typeof window === "undefined") return;
  
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysToKeep);
    const cutoffStr = cutoff.toISOString().split("T")[0];
    
    // Cleanup old transactions
    const transactions = JSON.parse(localStorage.getItem("finzen-transactions") || "[]");
    const filtered = transactions.filter(t => t.date >= cutoffStr);
    if (filtered.length !== transactions.length) {
      localStorage.setItem("finzen-transactions", JSON.stringify(filtered));
    }
    
    // Cleanup old goal history
    const goalHistory = JSON.parse(localStorage.getItem("finzen-goal-history") || "[]");
    const filteredHistory = goalHistory.filter(h => h.date >= cutoffStr);
    if (filteredHistory.length !== goalHistory.length) {
      localStorage.setItem("finzen-goal-history", JSON.stringify(filteredHistory));
    }
  } catch (e) {
    console.error("Error cleaning up old data:", e);
  }
}

