"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the OAuth callback or email verification
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          router.push("/auth/login?error=callback_error");
          return;
        }

        if (data.session) {
          // Successfully authenticated
          router.push("/");
        } else {
          // No session, redirect to login
          router.push("/auth/login");
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        router.push("/auth/login?error=unexpected_error");
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6] mx-auto mb-4"></div>
        <p className="text-muted">Memproses autentikasi...</p>
      </div>
    </div>
  );
}


