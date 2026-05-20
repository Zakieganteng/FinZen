"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import BrandingSection from "../components/BrandingSection";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signUp, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Password tidak cocok");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    setLoading(true);
    
    try {
      const result = await signUp(email, password, name);
      
      if (result?.error) {
        setError(result.error.message || "Gagal registrasi. Coba lagi.");
      } else {
        router.push("/auth/login");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <BrandingSection variant="register" />
      
      <div className="flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo - hidden on desktop */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex justify-center mb-4">
              <Image src="/Logo.png" alt="FinZen Logo" width={64} height={64} className="rounded-lg" />
            </div>
          </div>

          <div className="bg-[var(--card)] border border-base rounded-xl p-6 lg:p-8 shadow-lg">
            <div className="mb-6">
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">Mulai Perjalanan Finansial Anda</h1>
              <p className="text-sm text-muted">
                Buat akun FinZen dan kelola keuangan Anda dengan lebih terstruktur.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Nama
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full border border-base rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] bg-[var(--background)] text-foreground transition-all"
                  placeholder="Nama lengkap"
                />
              </div>

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
                  className="w-full border border-base rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] bg-[var(--background)] text-foreground transition-all"
                  placeholder="nama@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full border border-base rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] bg-[var(--background)] text-foreground transition-all"
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
                  className="w-full border border-base rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] bg-[var(--background)] text-foreground transition-all"
                  placeholder="Ulangi password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2563eb] text-white py-2.5 rounded-md font-medium hover:bg-[#1d4ed8] hover:shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loading ? "Memproses..." : "Buat Akun FinZen"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted">Sudah punya akun? </span>
              <Link href="/auth/login" className="text-[#3B82F6] font-medium hover:underline transition-colors">
                Masuk
              </Link>
            </div>

            <p className="mt-6 text-xs text-center text-muted leading-relaxed">
              Dengan mendaftar, Anda menyetujui{" "}
              <Link href="#" className="text-[#3B82F6] hover:underline">
                Kebijakan Privasi
              </Link>{" "}
              &{" "}
              <Link href="#" className="text-[#3B82F6] hover:underline">
                Syarat Penggunaan
              </Link>
              .
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 lg:gap-6 text-xs text-muted">
            <div className="flex items-center gap-1.5">
              <span>🔒</span>
              <span>Data Anda terenkripsi</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>☁️</span>
              <span>Cloud-based & reliable</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>📈</span>
              <span>Dipercaya oleh profesional</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}