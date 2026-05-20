"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

export default function AdminProtectedRoute({ children }) {
  const { user, loading, isAdmin, refreshUser } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!loading && user && !refreshing) {
      // Refresh user data to get latest role from database if role is missing
      if (!user.role) {
        setRefreshing(true);
        refreshUser().finally(() => {
          setRefreshing(false);
        });
      }
    }
  }, [loading, user, refreshUser, refreshing]);

  useEffect(() => {
    if (!loading && !refreshing) {
      if (!user) {
        router.push("/auth/login");
      } else if (user.role && !isAdmin) {
        router.push("/");
      }
    }
  }, [user, loading, isAdmin, router, refreshing]);

  if (loading || refreshing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6] mx-auto mb-4"></div>
          <p className="text-muted">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role && !isAdmin)) {
    return null;
  }

  return <>{children}</>;
}


