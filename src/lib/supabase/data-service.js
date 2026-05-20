/**
 * Database Service Layer untuk CRUD operations ke Supabase
 */

import { supabase } from "./client";

// ============================================
// TRANSACTIONS
// ============================================

/**
 * Get all transactions for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of transactions
 */
export async function getTransactions(userId) {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return { data: [], error };
  }
}

/**
 * Create a new transaction
 * @param {string} userId - User ID
 * @param {Object} transactionData - { date, category, amount, note }
 * @returns {Promise<Object>} Created transaction
 */
export async function createTransaction(userId, transactionData) {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .insert({
        user_id: userId,
        date: transactionData.date,
        category: transactionData.category,
        amount: transactionData.amount,
        type: transactionData.type || "expense",
        note: transactionData.note || null,
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error creating transaction:", error);
    return { data: null, error };
  }
}

/**
 * Update a transaction
 * @param {string} transactionId - Transaction ID
 * @param {Object} transactionData - { date, category, amount, note }
 * @returns {Promise<Object>} Updated transaction
 */
export async function updateTransaction(transactionId, transactionData) {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .update({
        date: transactionData.date,
        category: transactionData.category,
        amount: transactionData.amount,
        type: transactionData.type || "expense",
        note: transactionData.note || null,
      })
      .eq("id", transactionId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error updating transaction:", error);
    return { data: null, error };
  }
}

/**
 * Delete a transaction
 * @param {string} transactionId - Transaction ID
 * @returns {Promise<Object>} Success status
 */
export async function deleteTransaction(transactionId) {
  try {
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", transactionId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return { error };
  }
}

// ============================================
// BUDGETS
// ============================================

/**
 * Get budgets for a user and month
 * @param {string} userId - User ID
 * @param {string} yearMonth - Format: 'YYYY-MM'
 * @returns {Promise<Array>} Array of budgets
 */
export async function getBudgets(userId, yearMonth) {
  try {
    const { data, error } = await supabase
      .from("budgets")
      .select("*")
      .eq("user_id", userId)
      .eq("year_month", yearMonth)
      .order("category_name", { ascending: true });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error("Error fetching budgets:", error);
    return { data: [], error };
  }
}

/**
 * Create or update a budget
 * @param {string} userId - User ID
 * @param {Object} budgetData - { category_id, category_name, year_month, budget_amount, color }
 * @returns {Promise<Object>} Created/updated budget
 */
export async function upsertBudget(userId, budgetData) {
  try {
    const row = {
      user_id: userId,
      category_id: budgetData.category_id,
      category_name: budgetData.category_name,
      year_month: budgetData.year_month,
      budget_amount: budgetData.budget_amount,
      color: budgetData.color || null,
    };
    if (budgetData.spent_amount !== undefined && budgetData.spent_amount !== null) {
      row.spent_amount = budgetData.spent_amount;
    }

    const { data, error } = await supabase
      .from("budgets")
      .upsert(row, {
        onConflict: "user_id,category_id,year_month",
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error upserting budget:", error);
    return { data: null, error };
  }
}

/**
 * Delete a budget
 * @param {string} budgetId - Budget ID
 * @returns {Promise<Object>} Success status
 */
export async function deleteBudget(budgetId) {
  try {
    const { error } = await supabase
      .from("budgets")
      .delete()
      .eq("id", budgetId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error("Error deleting budget:", error);
    return { error };
  }
}

// ============================================
// GOALS
// ============================================

/**
 * Get all goals for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of goals
 */
export async function getGoals(userId) {
  try {
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error("Error fetching goals:", error);
    return { data: [], error };
  }
}

/**
 * Create a new goal
 * @param {string} userId - User ID
 * @param {Object} goalData - { title, target, due_date, priority }
 * @returns {Promise<Object>} Created goal
 */
export async function createGoal(userId, goalData) {
  try {
    const { data, error } = await supabase
      .from("goals")
      .insert({
        user_id: userId,
        title: goalData.title,
        target: goalData.target,
        saved: goalData.saved || 0,
        due_date: goalData.due_date || null,
        priority: goalData.priority || "normal",
        completed: false,
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error creating goal:", error);
    return { data: null, error };
  }
}

/**
 * Update a goal
 * @param {string} goalId - Goal ID
 * @param {Object} goalData - { title, target, saved, due_date, priority, completed }
 * @returns {Promise<Object>} Updated goal
 */
export async function updateGoal(goalId, goalData) {
  try {
    const updateData = {};
    if (goalData.title !== undefined) updateData.title = goalData.title;
    if (goalData.target !== undefined) updateData.target = goalData.target;
    if (goalData.saved !== undefined) updateData.saved = goalData.saved;
    if (goalData.due_date !== undefined) updateData.due_date = goalData.due_date;
    if (goalData.priority !== undefined) updateData.priority = goalData.priority;
    if (goalData.completed !== undefined) updateData.completed = goalData.completed;

    const { data, error } = await supabase
      .from("goals")
      .update(updateData)
      .eq("id", goalId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error updating goal:", error);
    return { data: null, error };
  }
}

/**
 * Delete a goal
 * @param {string} goalId - Goal ID
 * @returns {Promise<Object>} Success status
 */
export async function deleteGoal(goalId) {
  try {
    const { error } = await supabase
      .from("goals")
      .delete()
      .eq("id", goalId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error("Error deleting goal:", error);
    return { error };
  }
}

// ============================================
// GOAL HISTORY
// ============================================

/**
 * Get goal history for a user
 * @param {string} userId - User ID
 * @param {string} goalId - Optional: filter by goal ID
 * @returns {Promise<Array>} Array of goal history entries
 */
export async function getGoalHistory(userId, goalId = null) {
  try {
    let query = supabase
      .from("goal_history")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (goalId) {
      query = query.eq("goal_id", goalId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error("Error fetching goal history:", error);
    return { data: [], error };
  }
}

/**
 * Add goal history (top-up)
 * @param {string} goalId - Goal ID
 * @param {string} userId - User ID
 * @param {Object} historyData - { amount, date, note }
 * @returns {Promise<Object>} Created history entry
 */
export async function addGoalHistory(goalId, userId, historyData) {
  try {
    const { data, error } = await supabase
      .from("goal_history")
      .insert({
        goal_id: goalId,
        user_id: userId,
        amount: historyData.amount,
        date: historyData.date || new Date().toISOString().split("T")[0],
        note: historyData.note || null,
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error adding goal history:", error);
    return { data: null, error };
  }
}

// ============================================
// USER BALANCE
// ============================================

/**
 * Update saldo awal user
 * @param {string} userId
 * @param {number} initialBalance
 */
export async function updateUserInitialBalance(userId, initialBalance) {
  try {
    const { data, error } = await supabase
      .from("users")
      .update({ initial_balance: initialBalance })
      .eq("id", userId)
      .select("id, email, name, theme, role, initial_balance")
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error updating initial balance:", error);
    return { data: null, error };
  }
}

