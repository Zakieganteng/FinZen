/**
 * Admin-specific Supabase service functions
 */

import { supabase } from "./client";

// ============================
// USER STATS
// ============================

export async function getUserStats() {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, created_at, role");

    if (error) throw error;

    const total = data.length;
    const now = new Date();
    const daysAgo = (n) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);

    const newLast7 = data.filter(
      (u) => new Date(u.created_at) >= daysAgo(7)
    ).length;
    const newLast30 = data.filter(
      (u) => new Date(u.created_at) >= daysAgo(30)
    ).length;

    const admins = data.filter(
      (u) => u.role === "admin" || u.role === "superadmin"
    ).length;

    return {
      data: {
        totalUsers: total,
        newLast7,
        newLast30,
        adminCount: admins,
      },
      error: null,
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return { data: null, error };
  }
}

// ============================
// FEEDBACK STATS
// ============================

export async function getFeedbackStats() {
  try {
    const { data, error } = await supabase
      .from("feedback")
      .select("id, rating, category, comment, created_at");

    if (error) throw error;

    const total = data.length;
    const avgRating =
      total === 0
        ? 0
        : data.reduce((sum, f) => sum + (f.rating || 0), 0) / total;

    const byCategory = data.reduce((acc, f) => {
      acc[f.category] = (acc[f.category] || 0) + 1;
      return acc;
    }, {});

    // Rating distribution
    const ratingDistribution = {};
    data.forEach((f) => {
      const rating = f.rating || 0;
      ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
    });

    const latest = data
      .slice()
      .sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      )
      .slice(0, 5);

    return {
      data: {
        totalFeedback: total,
        averageRating: avgRating,
        byCategory,
        ratingDistribution,
        latest,
      },
      error: null,
    };
  } catch (error) {
    console.error("Error fetching feedback stats:", error);
    return { data: null, error };
  }
}

export async function getAllFeedback({ limit = 50, offset = 0 } = {}) {
  try {
    const { data, error, count } = await supabase
      .from("feedback")
      .select("id, user_id, rating, category, comment, created_at", {
        count: "exact",
      })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return { data, count, error: null };
  } catch (error) {
    console.error("Error fetching all feedback:", error);
    return { data: [], count: 0, error };
  }
}

export async function getAllUsers() {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, name, role, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { data: [], error };
  }
}

export async function updateUserRole(userId, role) {
  try {
    const { data, error } = await supabase
      .from("users")
      .update({ role })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { data: null, error };
  }
}


