/**
 * A/B Testing System for Insight Frequency
 */

const VARIANTS = {
  A: { id: "A", maxInsights: 2, name: "2 Insights" },
  B: { id: "B", maxInsights: 3, name: "3 Insights" },
  C: { id: "C", maxInsights: null, name: "Dynamic" }, // Dynamic based on engagement
};

/**
 * Get or assign A/B variant for user
 * @returns {Object} Variant object
 */
export function getABVariant() {
  if (typeof window === "undefined") return VARIANTS.B; // Default
  
  try {
    const stored = localStorage.getItem("finzen-ab-variant");
    if (stored) {
      const variant = VARIANTS[stored];
      if (variant) return variant;
    }
    
    // Assign random variant (33% each)
    const random = Math.random();
    let variant;
    if (random < 0.33) {
      variant = VARIANTS.A;
    } else if (random < 0.66) {
      variant = VARIANTS.B;
    } else {
      variant = VARIANTS.C;
    }
    
    localStorage.setItem("finzen-ab-variant", variant.id);
    return variant;
  } catch (e) {
    console.error("Error getting AB variant:", e);
    return VARIANTS.B; // Default fallback
  }
}

/**
 * Track metric for A/B testing
 * @param {string} variant - Variant ID (A, B, C)
 * @param {string} metric - Metric name (e.g., "insight_click", "engagement_time")
 * @param {any} value - Metric value
 */
export function trackMetric(variant, metric, value) {
  if (typeof window === "undefined") return;
  
  try {
    const key = "finzen-ab-metrics";
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    
    existing.push({
      variant,
      metric,
      value,
      timestamp: new Date().toISOString(),
    });
    
    // Keep only last 1000 metrics
    const trimmed = existing.slice(-1000);
    localStorage.setItem(key, JSON.stringify(trimmed));
  } catch (e) {
    console.error("Error tracking metric:", e);
  }
}

/**
 * Get metrics summary for analysis
 * @returns {Object} Summary of metrics by variant
 */
export function getMetricsSummary() {
  if (typeof window === "undefined") return {};
  
  try {
    const metrics = JSON.parse(localStorage.getItem("finzen-ab-metrics") || "[]");
    const summary = {};
    
    Object.keys(VARIANTS).forEach(variantId => {
      const variantMetrics = metrics.filter(m => m.variant === variantId);
      summary[variantId] = {
        total: variantMetrics.length,
        clicks: variantMetrics.filter(m => m.metric === "insight_click").length,
        avgEngagement: variantMetrics
          .filter(m => m.metric === "engagement_time")
          .reduce((sum, m) => sum + (m.value || 0), 0) / Math.max(1, variantMetrics.filter(m => m.metric === "engagement_time").length),
      };
    });
    
    return summary;
  } catch (e) {
    console.error("Error getting metrics summary:", e);
    return {};
  }
}

/**
 * Calculate dynamic max insights based on user engagement
 * @param {number} streak - Current streak
 * @param {number} transactionCount - Total transaction count
 * @returns {number} Max insights (1-3)
 */
export function calculateDynamicMaxInsights(streak, transactionCount) {
  // Higher engagement = more insights
  if (streak >= 7 && transactionCount >= 50) return 3;
  if (streak >= 3 && transactionCount >= 20) return 2;
  return 1;
}

