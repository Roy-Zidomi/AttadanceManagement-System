"use client";

import { useEffect, useState } from "react";
import { Loader2, TrendingUp } from "lucide-react";

type DashboardStats = {
  totalEmployees: number;
  totalScheduled: number;
  totalCheckedIn: number;
  onTime: number;
  late: number;
  earlyLeave: number;
  rejected: number;
  absentEstimate: number;
  recentAttendance: any[];
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!stats) return <div className="text-center py-12 text-slate-500 dark:text-slate-400">Failed to load data</div>;

  const statCards = [
    { title: "Total Employees", value: stats.totalEmployees },
    { title: "Scheduled Today", value: stats.totalScheduled },
    { title: "Checked In", value: stats.totalCheckedIn },
    { title: "Est. Absent", value: stats.absentEstimate },
  ];

  const detailCards = [
    { title: "On Time", value: stats.onTime },
    { title: "Late Check-ins", value: stats.late },
    { title: "Rejected (Location)", value: stats.rejected },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-emerald-500" />
          Dashboard
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Today's attendance statistics at a glance</p>
      </div>

      {/* Top stat cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.title} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm group">
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{card.value}</h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">{card.title}</p>
          </div>
        ))}
      </div>

      {/* Detail cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        {detailCards.map((card) => (
          <div key={card.title} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.title}</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Attendance Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200/60 dark:border-slate-800/60">
          <h3 className="text-base font-semibold text-slate-800 dark:text-white">Recent Attendance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/60">
                <th className="px-5 sm:px-6 py-3 font-medium text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Employee</th>
                <th className="px-5 sm:px-6 py-3 font-medium text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider hidden sm:table-cell">Time</th>
                <th className="px-5 sm:px-6 py-3 font-medium text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider hidden md:table-cell">Shift</th>
                <th className="px-5 sm:px-6 py-3 font-medium text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider hidden md:table-cell">Location</th>
                <th className="px-5 sm:px-6 py-3 font-medium text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {stats.recentAttendance.length > 0 ? (
                stats.recentAttendance.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 sm:px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-white">{record.user.name}</div>
                      <div className="text-xs text-slate-400">{record.user.employeeId}</div>
                    </td>
                    <td className="px-5 sm:px-6 py-4 text-slate-600 dark:text-slate-400 hidden sm:table-cell">
                      {new Date(record.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-5 sm:px-6 py-4 text-slate-600 dark:text-slate-400 hidden md:table-cell">{record.schedule.shift.name}</td>
                    <td className="px-5 sm:px-6 py-4 text-slate-600 dark:text-slate-400 hidden md:table-cell">{record.schedule.location.name}</td>
                    <td className="px-5 sm:px-6 py-4"><StatusBadge status={record.status} /></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">No attendance records for today.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; cls: string }> = {
    on_time: { label: "On Time", cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20" },
    late: { label: "Late", cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20" },
    early_leave: { label: "Early Leave", cls: "bg-orange-500/10 text-orange-600 dark:text-orange-400 ring-orange-500/20" },
    absent: { label: "Absent", cls: "bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-rose-500/20" },
    incomplete: { label: "Incomplete", cls: "bg-slate-500/10 text-slate-600 dark:text-slate-400 ring-slate-500/20" },
    rejected_outside_area: { label: "Rejected", cls: "bg-red-500/10 text-red-600 dark:text-red-400 ring-red-500/20" },
  };
  const c = config[status] || { label: status, cls: "bg-slate-500/10 text-slate-600 ring-slate-500/20" };
  return (
    <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${c.cls}`}>
      {c.label}
    </span>
  );
}
