"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "../../../lib/supabase/client";

function ResetPasswordContent() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("request"); // 'request' or 'update'
  const [error, setError] = useState("");
  const { resetPassword, updatePassword } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if this is a password reset callback
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    const type = hashParams.get("type");

    if (accessToken && type === "recovery") {
      setStep("update");
    }
  }, []);

  async function handleRequestReset(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await resetPassword(email);
    setLoading(false);

    if (!error) {
      setStep("sent");
    }
  }

  async function handleUpdatePassword(e) {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Password tidak cocok");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    setLoading(true);
    const { error } = await updatePassword(newPassword);
    setLoading(false);

    if (!error) {
      router.push("/auth/login");
    }
  }

  if (step === "sent") {
    return (
      <div className="w-full max-w-md mx-auto p-4">
        <div className="bg-[var(--card)] border border-base rounded-lg p-6 shadow-lg text-center">
          <div className="text-4xl mb-4">📧</div>
          <h1 className="text-2xl font-bold mb-2">Email Terkirim!</h1>
          <p className="text-muted mb-6">
            Kami telah mengirimkan link reset password ke email Anda. Silakan cek inbox Anda.
          </p>
          <Link
            href="/auth/login"
            className="text-[#3B82F6] font-medium hover:underline"
          >
            Kembali ke halaman login
          </Link>
        </div>
      </div>
    );
  }

  if (step === "update") {
    return (
      <div className="w-full max-w-md mx-auto p-4">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image src="/Logo.png" alt="FinZen Logo" width={64} height={64} className="rounded-lg" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
          <p className="text-muted">Masukkan password baru Anda</p>
        </div>

        <div className="bg-[var(--card)] border border-base rounded-lg p-6 shadow-lg">
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
                Password Baru
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full border border-base rounded-md px-3 py-2 bg-[var(--background)] text-foreground focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                placeholder="Minimal 6 karakter"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Konfirmasi Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full border border-base rounded-md px-3 py-2 bg-[var(--background)] text-foreground focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                placeholder="Ulangi password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2563eb] text-white py-2 rounded-md font-medium hover:bg-[#1d4ed8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Memproses..." : "Ubah Password"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Image src="/Logo.png" alt="FinZen Logo" width={64} height={64} className="rounded-lg" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Lupa Password?</h1>
        <p className="text-muted">Masukkan email Anda untuk reset password</p>
      </div>

      <div className="bg-[var(--card)] border border-base rounded-lg p-6 shadow-lg">
        <form onSubmit={handleRequestReset} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-base rounded-md px-3 py-2 bg-[var(--background)] text-foreground focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
              placeholder="nama@email.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2563eb] text-white py-2 rounded-md font-medium hover:bg-[#1d4ed8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Mengirim..." : "Kirim Link Reset"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <Link href="/auth/login" className="text-[#3B82F6] font-medium hover:underline">
            Kembali ke halaman login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6] mx-auto mb-4"></div>
          <p className="text-muted">Memuat...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}

