"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";

const adminNav = [
  { href: "/admin", label: "Overview", icon: "📊" },
  { href: "/admin/feedback", label: "Feedback", icon: "💬" },
  { href: "/admin/tips", label: "Tips", icon: "💡" },
];

export default function AdminSidebar({ onNavigate }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const handleLinkClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-4 border-b border-black/[.08] dark:border-white/[.145]">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted">
            Admin Panel
          </div>
          <div className="mt-1 text-sm font-medium">
            {user?.name || user?.email || "Admin"}
          </div>
          <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-200">
            <span>⭐</span>
            <span>{user?.role || "admin"}</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {adminNav.map((item) => {
          const active =
            pathname === item.href ||
            (item.href === "/admin" && pathname === "/admin");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm border transition-all ${
                active
                  ? "bg-[#e0ecff] dark:bg-white/[.06] border-[#60a5fa] dark:border-white/[.145] text-[#1d4ed8] font-semibold shadow-sm"
                  : "border-transparent hover:bg-black/[.03] dark:hover:bg-white/[.05]"
              }`}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-md text-base">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-black/[.08] dark:border-white/[.145] space-y-2">
        <button
          onClick={signOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm border border-base hover:bg-black/[.03] dark:hover:bg-white/[.05] transition-colors"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>

        <Link
          href="/"
          className="block text-xs text-muted text-center hover:underline"
        >
          ← Kembali ke dashboard user
        </Link>
      </div>
    </div>
  );
}


