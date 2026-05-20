import { supabase } from "./client";

export async function getTips({ activeOnly = true } = {}) {
  try {
    let query = supabase
      .from("tips")
      .select("*")
      .order("order_index", { ascending: true });

    if (activeOnly) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;
    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    console.error("Error fetching tips:", error);
    return { data: [], error };
  }
}

export async function createTip(tip) {
  try {
    const { data, error } = await supabase
      .from("tips")
      .insert(tip)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error creating tip:", error);
    return { data: null, error };
  }
}

export async function updateTip(id, tip) {
  try {
    const { data, error } = await supabase
      .from("tips")
      .update(tip)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error updating tip:", error);
    return { data: null, error };
  }
}

export async function deleteTip(id) {
  try {
    const { error } = await supabase.from("tips").delete().eq("id", id);
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error("Error deleting tip:", error);
    return { error };
  }
}

export async function reorderTips(orderedIds) {
  // Simple implementation: update order_index sequentially
  try {
    const updates = orderedIds.map((id, index) => ({
      id,
      order_index: index + 1,
    }));

    const { error } = await supabase.from("tips").upsert(updates, {
      onConflict: "id",
    });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error("Error reordering tips:", error);
    return { error };
  }
}


