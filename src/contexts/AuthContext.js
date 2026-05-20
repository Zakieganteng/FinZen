"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "../lib/utils";
import { registerUser, loginUser, getUserById } from "../lib/auth-simple";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get user from localStorage and refresh from database
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("finzen-user");
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          
          // Refresh user data from database to get latest role
          if (userData?.id) {
            getUserById(userData.id).then(({ data, error }) => {
              if (!error && data) {
                // Update with latest data including role
                const updatedUser = { ...data };
                localStorage.setItem("finzen-user", JSON.stringify(updatedUser));
                setUser(updatedUser);
              }
            });
          }
        } catch (e) {
          localStorage.removeItem("finzen-user");
        }
      }
      setLoading(false);
    }
  }, []);

  const signIn = async (email, password) => {
    try {
      const { data, error } = await loginUser(email, password);

      if (error) {
        showToast(error.message || "Gagal login. Coba lagi.", "error");
        return { data: null, error };
      }

      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("finzen-user", JSON.stringify(data));
      }

      setUser(data);
      showToast("✓ Login berhasil!", "success");
      
      // Redirect berdasarkan role
      const isAdmin = data?.role === "admin" || data?.role === "superadmin";
      if (isAdmin) {
        router.push("/admin");
      } else {
        router.push("/");
      }
      
      return { data, error: null };
    } catch (error) {
      showToast(error.message || "Gagal login. Coba lagi.", "error");
      return { data: null, error };
    }
  };

  const signUp = async (email, password, name) => {
    try {
      const { data, error } = await registerUser(email, password, name);

      if (error) {
        let errorMessage = error.message || "Gagal registrasi. Coba lagi.";
        
        if (error.message.includes("Email sudah terdaftar") || error.code === '23505') {
          errorMessage = "Email sudah terdaftar. Silakan gunakan email lain atau login.";
        }
        
        showToast(errorMessage, "error");
        return { data: null, error: { ...error, message: errorMessage } };
      }

      // Auto login setelah registrasi
      const { data: loginData, error: loginError } = await loginUser(email, password);
      
      if (!loginError && loginData) {
        if (typeof window !== "undefined") {
          localStorage.setItem("finzen-user", JSON.stringify(loginData));
        }
        setUser(loginData);
      }

      showToast("✓ Registrasi berhasil!", "success");
      return { data, error: null };
    } catch (error) {
      const errorMessage = error.message || "Gagal registrasi. Coba lagi.";
      showToast(errorMessage, "error");
      return { data: null, error: { ...error, message: errorMessage } };
    }
  };

  const signOut = async () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("finzen-user");
      }
      setUser(null);
      showToast("✓ Logout berhasil", "success");
      router.push("/auth/login");
    } catch (error) {
      showToast(error.message || "Gagal logout. Coba lagi.", "error");
    }
  };

  const resetPassword = async (email) => {
    // Simple reset password - untuk development
    showToast("Fitur reset password belum tersedia. Silakan hubungi admin.", "error");
    return { error: { message: "Not implemented" } };
  };

  const updatePassword = async (newPassword) => {
    // Simple update password - untuk development
    showToast("Fitur update password belum tersedia.", "error");
    return { error: { message: "Not implemented" } };
  };

  const refreshUser = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await getUserById(user.id);
      if (!error && data) {
        const updatedUser = { ...data };
        if (typeof window !== "undefined") {
          localStorage.setItem("finzen-user", JSON.stringify(updatedUser));
        }
        setUser(updatedUser);
        return { data: updatedUser, error: null };
      }
      return { data: null, error };
    } catch (error) {
      return { data: null, error };
    }
  };

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";
  const isSuperAdmin = user?.role === "superadmin";

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    refreshUser,
    isAdmin,
    isSuperAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}


