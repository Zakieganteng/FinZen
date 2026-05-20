/**
 * Simple authentication utilities
 * Tidak menggunakan Supabase Auth, langsung ke tabel users
 */

import { supabase } from "./supabase/client";

/**
 * Hash password sederhana (untuk development)
 * NOTE: Untuk production, gunakan bcrypt atau library hashing yang proper
 */
export function hashPassword(password) {
  // Simple hash untuk development (tidak secure untuk production!)
  // Di production, gunakan: import bcrypt from 'bcryptjs'; return bcrypt.hashSync(password, 10);
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

/**
 * Register user baru (langsung insert ke tabel users)
 */
export async function registerUser(email, password, name) {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const hashedPassword = hashPassword(password);

    const { data, error } = await supabase
      .from('users')
      .insert({
        email: normalizedEmail,
        password: hashedPassword,
        name: name,
        // default role untuk user baru
        role: 'user',
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('Email sudah terdaftar');
      }
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Login user (cek email dan password dari tabel users)
 */
export async function loginUser(email, password) {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const hashedPassword = hashPassword(password);

    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, theme, role')
      .eq('email', normalizedEmail)
      .eq('password', hashedPassword)
      .single();

    if (error || !data) {
      throw new Error('Email atau password salah');
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, theme, role')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

