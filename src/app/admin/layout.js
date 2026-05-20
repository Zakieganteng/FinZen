"use client";

import { useState } from "react";
import AdminProtectedRoute from "../../components/AdminProtectedRoute";
import AdminSidebar from "../components/AdminSidebar";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen grid grid-cols-1 md:grid-cols-[260px_1fr]">
        {/* Hamburger Button - Mobile Only */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-[var(--card)] border border-base shadow-md hover:bg-black/[.03] dark:hover:bg-white/[.05] transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>

        {/* Overlay - Mobile Only */}
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`bg-[var(--card)] border-r border-black/[.08] dark:border-white/[.18] md:sticky md:top-0 md:h-screen md:overflow-y-auto self-start transition-transform duration-300 ease-in-out ${
            sidebarOpen
              ? "fixed left-0 top-0 h-screen w-[260px] z-50 overflow-y-auto"
              : "hidden md:block"
          }`}
          style={{ zIndex: sidebarOpen ? 50 : 1 }}
        >
          {/* Close Button - Mobile Only */}
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden absolute top-4 right-4 p-2 rounded-md bg-black/[.03] dark:bg-white/[.05] hover:bg-black/[.06] dark:hover:bg-white/[.08] transition-colors z-10"
              aria-label="Close sidebar"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          )}
          <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
        </aside>
        <main className="p-4 md:p-6 pt-16 md:pt-6 bg-[var(--background)]">{children}</main>
      </div>
    </AdminProtectedRoute>
  );
}


