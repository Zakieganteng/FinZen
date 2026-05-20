"use client";

import { useEffect, useState } from "react";
import { getUserStats, getFeedbackStats } from "../../lib/supabase/admin-service";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

export default function AdminOverviewPage() {
  const [userStats, setUserStats] = useState(null);
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [u, f] = await Promise.all([getUserStats(), getFeedbackStats()]);
      setUserStats(u.data);
      setFeedbackStats(f.data);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          Admin Overview
        </h1>
        <p className="text-sm text-muted">Memuat data admin...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Admin Overview
        </h1>
        <p className="text-sm text-muted">
          Ringkasan singkat aktivitas user dan feedback aplikasi.
        </p>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total User"
          value={userStats?.totalUsers ?? 0}
          subtitle={`+${userStats?.newLast30 ?? 0} dalam 30 hari`}
        />
        <StatCard
          title="User Baru 7 Hari"
          value={userStats?.newLast7 ?? 0}
          subtitle="Sign up terakhir 7 hari"
        />
        <StatCard
          title="Admin / Superadmin"
          value={userStats?.adminCount ?? 0}
          subtitle="Termasuk akun ini"
        />
        <StatCard
          title="Total Feedback"
          value={feedbackStats?.totalFeedback ?? 0}
          subtitle={
            feedbackStats
              ? `Rating rata-rata ${feedbackStats.averageRating.toFixed(1)}`
              : "-"
          }
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-base p-4 card">
          <h2 className="text-sm font-semibold mb-4">
            Distribusi Feedback per Kategori
          </h2>
          {feedbackStats && Object.keys(feedbackStats.byCategory || {}).length ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={Object.entries(feedbackStats.byCategory).map(([name, value]) => ({ name, value }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.entries(feedbackStats.byCategory).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)'
                  }}
                  itemStyle={{ color: 'var(--foreground)' }}
                  labelStyle={{ color: 'var(--foreground)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted">Belum ada feedback.</p>
          )}
        </div>

        <div className="rounded-xl border border-base p-4 card">
          <h2 className="text-sm font-semibold mb-4">Distribusi Rating</h2>
          {feedbackStats && feedbackStats.totalFeedback > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={getRatingDistribution(feedbackStats)}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis 
                  dataKey="rating" 
                  tick={{ fill: 'var(--foreground)' }}
                />
                <YAxis 
                  tick={{ fill: 'var(--foreground)' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)'
                  }}
                />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted">Belum ada feedback.</p>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-base p-4 card">
          <h2 className="text-sm font-semibold mb-4">Feedback Terbaru</h2>
          {feedbackStats && feedbackStats.latest?.length ? (
            <ul className="space-y-2 text-sm max-h-64 overflow-y-auto">
              {feedbackStats.latest.map((f) => (
                <li
                  key={f.id}
                  className="border border-base rounded-md px-3 py-2"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs uppercase tracking-wide text-muted">
                      {f.category}
                    </span>
                    <span className="text-xs">
                      ⭐ {f.rating} •{" "}
                      {new Date(f.created_at).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                  <p className="text-sm">
                    {f.comment || <span className="text-muted">Tanpa komentar</span>}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">Belum ada feedback.</p>
          )}
        </div>

        <div className="rounded-xl border border-base p-4 card">
          <h2 className="text-sm font-semibold mb-4">Ringkasan Statistik</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted">Total User</span>
              <span className="text-lg font-semibold">{userStats?.totalUsers ?? 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted">User Baru (7 hari)</span>
              <span className="text-lg font-semibold">{userStats?.newLast7 ?? 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted">User Baru (30 hari)</span>
              <span className="text-lg font-semibold">{userStats?.newLast30 ?? 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted">Rating Rata-rata</span>
              <span className="text-lg font-semibold">
                {feedbackStats?.averageRating ? feedbackStats.averageRating.toFixed(1) : "0.0"} ⭐
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

function getRatingDistribution(feedbackStats) {
  if (!feedbackStats?.ratingDistribution) return [];
  return Object.entries(feedbackStats.ratingDistribution)
    .map(([rating, count]) => ({
      rating: `${rating} ⭐`,
      count,
    }))
    .sort((a, b) => {
      const aNum = parseInt(a.rating);
      const bNum = parseInt(b.rating);
      return aNum - bNum;
    });
}

function StatCard({ title, value, subtitle }) {
  return (
    <div className="rounded-xl border border-base p-4 card">
      <div className="text-xs uppercase tracking-wide text-muted mb-1">
        {title}
      </div>
      <div className="text-2xl font-semibold">{value}</div>
      {subtitle && (
        <div className="text-xs text-muted mt-1 truncate">{subtitle}</div>
      )}
    </div>
  );
}


