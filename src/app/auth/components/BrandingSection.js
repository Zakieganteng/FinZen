"use client";

import Image from "next/image";

export default function BrandingSection({ variant = "login" }) {
  const isLogin = variant === "login";
  
  return (
    <div className="hidden lg:flex lg:flex-col lg:justify-center lg:px-12 xl:px-16 bg-gradient-to-br from-blue-100 via-cyan-100 to-blue-50 dark:from-blue-950/20 dark:via-cyan-950/20 dark:to-gray-900 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-300/30 dark:bg-blue-800/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-300/30 dark:bg-cyan-800/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="relative z-10 animate-fade-in">
        <div className="mb-8">
          <Image 
            src="/Logo.png" 
            alt="FinZen Logo" 
            width={80} 
            height={80} 
            className="rounded-lg mb-6 shadow-lg"
            priority
          />
          <h1 className="text-4xl xl:text-5xl font-bold mb-4 text-black dark:text-white leading-tight drop-shadow-sm">
            {isLogin 
              ? "Kelola Keuangan Anda dengan Lebih Cerdas"
              : "Mulai Perjalanan Finansial Anda"
            }
          </h1>
          <p className="text-lg text-gray-900 dark:text-gray-300 leading-relaxed font-medium">
            {isLogin
              ? "FinZen membantu Anda memantau, menganalisis, dan mengambil keputusan finansial dengan lebih percaya diri."
              : "Buat akun FinZen dan kelola keuangan Anda dengan lebih terstruktur."
            }
          </p>
        </div>

        <div className="space-y-4 mt-8">
          <div className="flex items-start gap-3 bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg p-4 border border-white/80 dark:border-gray-700/50 shadow-sm">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-500 dark:bg-blue-600 flex items-center justify-center text-xl shadow-md">
              📊
            </div>
            <div>
              <div className="font-bold text-black dark:text-white mb-1 text-base">
                Insight keuangan real-time
              </div>
              <p className="text-sm text-gray-800 dark:text-gray-300 leading-relaxed">
                Pantau pengeluaran dan pemasukan Anda secara real-time dengan dashboard yang intuitif.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg p-4 border border-white/80 dark:border-gray-700/50 shadow-sm">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-green-500 dark:bg-green-600 flex items-center justify-center text-xl shadow-md">
              🔐
            </div>
            <div>
              <div className="font-bold text-black dark:text-white mb-1 text-base">
                Keamanan data berstandar tinggi
              </div>
              <p className="text-sm text-gray-800 dark:text-gray-300 leading-relaxed">
                Data Anda terenkripsi dan tersimpan dengan aman menggunakan teknologi cloud terpercaya.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg p-4 border border-white/80 dark:border-gray-700/50 shadow-sm">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-purple-500 dark:bg-purple-600 flex items-center justify-center text-xl shadow-md">
              ⚡
            </div>
            <div>
              <div className="font-bold text-black dark:text-white mb-1 text-base">
                Proses cepat & intuitif
              </div>
              <p className="text-sm text-gray-800 dark:text-gray-300 leading-relaxed">
                Antarmuka yang sederhana dan mudah digunakan, tanpa kurva pembelajaran yang rumit.
              </p>
            </div>
          </div>
        </div>

        {!isLogin && (
          <div className="mt-12 pt-8 border-t border-gray-300 dark:border-gray-700">
            <div className="text-sm font-bold text-black dark:text-gray-300 mb-4">
              Langkah-langkah mudah:
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center shadow-md">
                  1
                </div>
                <span className="text-sm font-medium text-black dark:text-gray-300">Buat akun</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center shadow-md">
                  2
                </div>
                <span className="text-sm font-medium text-black dark:text-gray-300">Lengkapi profil</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center shadow-md">
                  3
                </div>
                <span className="text-sm font-medium text-black dark:text-gray-300">Akses dashboard</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

