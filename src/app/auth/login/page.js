"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import BrandingSection from "../components/BrandingSection";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      // Redirect berdasarkan role
      const isAdmin = user?.role === "admin" || user?.role === "superadmin";
      if (isAdmin) {
        router.push("/admin");
      } else {
        router.push("/");
      }
    }
  }, [user, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <BrandingSection variant="login" />
      
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
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">Selamat Datang</h1>
              <p className="text-sm text-muted">
                Masuk untuk melanjutkan ke dashboard FinZen
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="w-full border border-base rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] bg-[var(--background)] text-foreground transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <Link
                  href="/auth/reset-password"
                  className="text-[#3B82F6] hover:underline transition-colors"
                >
                  Lupa password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2563eb] text-white py-2.5 rounded-md font-medium hover:bg-[#1d4ed8] hover:shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loading ? "Memproses..." : "Masuk"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted">Belum punya akun? </span>
              <Link href="/auth/register" className="text-[#3B82F6] font-medium hover:underline transition-colors">
                Daftar sekarang
              </Link>
            </div>

            <p className="mt-6 text-xs text-center text-muted leading-relaxed">
              Dengan masuk, Anda menyetujui{" "}
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