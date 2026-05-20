"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "../ui";
import BadgeCollection from "./BadgeCollection";
import FeedbackModal from "./FeedbackModal";
import { useAuth } from "../../contexts/AuthContext";

const nav = [
  { href: "/", label: "Dashboard", icon: "🏠" },
  { href: "/transactions", label: "Transaksi", icon: "💸" },
  { href: "/budgeting", label: "Budgeting", icon: "📊" },
  { href: "/goals", label: "Goals", icon: "🎯" },
  { href: "/reports", label: "Laporan", icon: "📈" },
  { href: "/tips", label: "Tips", icon: "💡" },
  { href: "/onboarding", label: "Onboarding", icon: "✨" },
];

export default function Sidebar({ onNavigate }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [openFeedback, setOpenFeedback] = useState(false);

  const handleLogout = async () => {
    await signOut();
  };

  const handleLinkClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-4 border-b border-black/[.08] dark:border-white/[.145]">
        <div className="flex items-center gap-3">
          <Image 
            src="/Logo.png" 
            alt="FinZen Logo" 
            width={36} 
            height={36} 
            className="rounded-lg"
            priority
          />
          <div className="flex-1">
            <div className="font-semibold">FinZen</div>
            <div className="text-xs text-black/60 dark:text-white/60">
              {user ? user.email : "Gen Z Finance"}
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 md:p-4 space-y-1">
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleLinkClick}
              aria-current={active ? "page" : undefined}
              className={`relative flex items-center gap-3 px-3 py-2 rounded-md text-sm border transition-all ${
                active
                  ? "bg-[#e0ecff] dark:bg-white/[.06] border-[#60a5fa] dark:border-white/[.145] text-[#1d4ed8] font-semibold shadow-md"
                  : "border-transparent hover:bg-black/[.03] dark:hover:bg-white/[.05]"
              }`}
            >
              {active ? (
                <span className="absolute left-0 top-0 h-full w-[4px] rounded-r bg-[#3B82F6]" />
              ) : null}
              <span className={`flex h-8 w-8 items-center justify-center rounded-md text-base ${active ? "bg-[#dbeafe] text-[#1d4ed8] ring-1 ring-[#93c5fd]" : ""}`}>{item.icon}</span>
              <span className={active ? "" : ""}>{item.label}</span>
              {active ? (
                <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-[#bfdbfe] text-[#1e3a8a]">AKTIF</span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-black/[.08] dark:border-white/[.145] space-y-4">
        <BadgeCollection compact={true} />
        <button
          onClick={() => setOpenFeedback(true)}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm border border-base hover:bg-black/[.03] dark:hover:bg-white/[.05] transition-colors"
        >
          <span>💬</span>
          <span>Feedback</span>
        </button>
        <div className="flex items-center justify-between">
          <span className="text-xs text-black/60 dark:text-white/60">Tema</span>
          <ThemeToggle />
        </div>
        {user && (
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm border border-base hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        )}
      </div>
      
      <FeedbackModal open={openFeedback} onClose={() => setOpenFeedback(false)} />
    </div>
  );
}


