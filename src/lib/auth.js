import { supabase } from "./supabase/client";

/**
 * Get current authenticated user
 * @returns {Promise<Object|null>} User object or null
 */
export async function getCurrentUser() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) throw error;
    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * Get current session
 * @returns {Promise<Object|null>} Session object or null
 */
export async function getCurrentSession() {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) throw error;
    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

/**
 * Require authentication (for server-side or API routes)
 * @returns {Promise<Object>} User object
 * @throws {Error} If not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}

/**
 * Handle auth errors consistently
 * @param {Error} error - Error object
 * @returns {string} User-friendly error message
 */
export function handleAuthError(error) {
  if (!error) return "Terjadi kesalahan";

  const errorMessages = {
    "Invalid login credentials": "Email atau password salah",
    "Email not confirmed": "Email belum dikonfirmasi. Silakan cek inbox Anda.",
    "User already registered": "Email sudah terdaftar",
    "Password should be at least 6 characters": "Password minimal 6 karakter",
    "Email rate limit exceeded": "Terlalu banyak percobaan. Coba lagi nanti.",
  };

  return errorMessages[error.message] || error.message || "Terjadi kesalahan";
}

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>}
 */
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}


