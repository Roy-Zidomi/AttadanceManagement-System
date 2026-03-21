"use client";

import { useEffect, useState } from "react";
import { CalendarDays, CheckCircle, Clock, Navigation, LocateFixed, Briefcase, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function EmployeeDashboard() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/dashboard")
      .then(async (res) => {
        const d = await res.json();
        if (!res.ok) throw new Error(d?.error || "Failed to load dashboard");
        return d;
      })
      .then((d) => setData(d))
      .catch((err) => setError(err?.message || "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center shadow-sm">
        <p className="text-red-500 font-medium">{error}</p>
      </div>
    );
  }

  if (!data) return <div className="text-center py-12 text-slate-500">Failed to load data</div>;

  const isCheckedIn = data.todayStatus?.includes("Checked In");
  const isCompleted = data.todayStatus?.includes("Completed");

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="mb-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Welcome back, {session?.user?.name?.split(' ')[0] || 'Employee'} 👋
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
          Here is your daily overview. Stay on top of your attendance and view your upcoming shifts.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-6">
          {/* Today's Schedule */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 p-5 sm:p-6 border-b border-slate-200/60 dark:border-slate-800/60">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                <Briefcase className="w-4 h-4 text-blue-500" />
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-white">Today's Schedule</h3>
            </div>

            <div className="p-5 sm:p-6">
              {data.nextShift ? (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-50/80 dark:bg-white/[0.03] rounded-xl p-4 border border-slate-100 dark:border-slate-800/40">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Shift</p>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">{data.nextShift.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{data.nextShift.time}</p>
                    </div>
                    <div className="bg-slate-50/80 dark:bg-white/[0.03] rounded-xl p-4 border border-slate-100 dark:border-slate-800/40">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Location</p>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">{data.nextShift.location}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center mt-0.5">
                        <LocateFixed className="w-3 h-3 mr-1 text-blue-400" />
                        Geo-fenced area
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/40">
                    {isCheckedIn ? (
                      <Link href="/employee/check-out" className="flex items-center justify-center w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium shadow-lg shadow-amber-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all group">
                        Process Check Out
                        <ChevronRight className="w-4 h-4 ml-1 opacity-70 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    ) : isCompleted ? (
                      <div className="flex items-center justify-center w-full py-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium border border-emerald-500/20">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Shift Completed for Today
                      </div>
                    ) : (
                      <Link href="/employee/check-in" className="flex items-center justify-center w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium shadow-md shadow-emerald-500/25 hover:shadow-lg hover:-translate-y-0.5 transition-all group">
                        Process Check In
                        <ChevronRight className="w-4 h-4 ml-1 opacity-70 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <CalendarDays className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700 mb-3" />
                  <p className="text-lg font-medium text-slate-900 dark:text-white">No shift scheduled</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">You have the day off or haven't been assigned yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid gap-4 grid-cols-3">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm text-center">
              <h4 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{data.totalSchedules}</h4>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Total Shifts</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm text-center">
              <h4 className="text-2xl sm:text-3xl font-bold text-emerald-600">{data.onTime}</h4>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">On Time</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm text-center">
              <h4 className="text-2xl sm:text-3xl font-bold text-rose-500">{data.late}</h4>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Late</p>
            </div>
          </div>
        </div>

        {/* Recent Activity Sidebar */}
        <div className="lg:col-span-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm h-full flex flex-col">
            <div className="p-5 border-b border-slate-200/60 dark:border-slate-800/60 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800 dark:text-white">Recent Activity</h3>
              <Link href="/employee/history" className="text-xs font-medium text-emerald-500 hover:text-emerald-600 transition-colors">View All</Link>
            </div>

            <div className="flex-1 p-5 max-h-[400px] overflow-y-auto">
              <div className="space-y-4">
                {data.recentAttendance?.length > 0 ? (
                  data.recentAttendance.map((record: any) => (
                    <div key={record.id} className="relative pl-5 before:absolute before:left-[7px] before:top-5 before:h-[calc(100%-4px)] before:w-px before:bg-slate-200 dark:before:bg-slate-800 last:before:hidden">
                      <div className={`absolute left-0 top-1 h-4 w-4 rounded-full border-2 border-white dark:border-slate-900 z-10 ${record.status === 'on_time' ? 'bg-emerald-500' : record.status === 'late' ? 'bg-amber-500' : 'bg-slate-400'
                        }`} />
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          {new Date(record.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </p>
                        <div className="mt-1.5 bg-slate-50/80 dark:bg-white/[0.03] rounded-xl p-3 border border-slate-100 dark:border-slate-800/40">
                          <p className="font-medium text-slate-800 dark:text-white text-sm">
                            {record.schedule.shift.name} at {record.schedule.location.name}
                          </p>
                          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 grid grid-cols-2 gap-2">
                            <div>
                              <span className="block text-slate-400 text-[10px]">In</span>
                              {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                            </div>
                            <div>
                              <span className="block text-slate-400 text-[10px]">Out</span>
                              {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-sm text-center py-8">No recent records.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
