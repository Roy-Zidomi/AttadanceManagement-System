"use client";

import { useState, useEffect } from "react";
import { Loader2, Calendar, MapPin, Eye, ExternalLink, X } from "lucide-react";

export default function AttendancePage() {
  const [attendances, setAttendances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchAttendances = async () => {
    setLoading(true);
    try { const url = dateFilter ? `/api/attendance?date=${dateFilter}` : `/api/attendance`; setAttendances(await (await fetch(url)).json()); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAttendances(); }, [dateFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Attendance Monitoring</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">View real-time check-ins and check-outs</p>
        </div>
        <div className="flex items-center gap-2">
          <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="input-field w-auto" />
          {dateFilter && <button onClick={() => setDateFilter("")} className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-3 py-2 rounded-lg ring-1 ring-inset ring-emerald-500/20 hover:bg-emerald-500/20 transition-colors">Clear</button>}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/60">
                <th className="px-5 sm:px-6 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Employee</th>
                <th className="px-5 sm:px-6 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 hidden sm:table-cell">Shift & Location</th>
                <th className="px-5 sm:px-6 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 hidden md:table-cell">Check-In</th>
                <th className="px-5 sm:px-6 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 hidden md:table-cell">Check-Out</th>
                <th className="px-5 sm:px-6 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                <th className="px-5 sm:px-6 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center">Proof</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr><td colSpan={6} className="py-12 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-emerald-500" /></td></tr>
              ) : attendances.length === 0 ? (
                <tr><td colSpan={6} className="py-16 text-center">
                  <Calendar className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700 mb-3" />
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">No records found</p>
                  <p className="text-sm text-slate-400 mt-1">Adjust your filters to see more results.</p>
                </td></tr>
              ) : attendances.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 sm:px-6 py-4">
                    <div className="font-medium text-slate-900 dark:text-white">{r.user.name}</div>
                    <div className="text-xs text-slate-400">{r.user.department || r.user.employeeId}</div>
                  </td>
                  <td className="px-5 sm:px-6 py-4 hidden sm:table-cell">
                    <div className="text-emerald-600 dark:text-emerald-400 font-medium">{r.schedule.shift.name}</div>
                    <div className="text-xs text-slate-400 flex items-center mt-0.5"><MapPin className="h-3 w-3 mr-1" />{r.schedule.location.name}</div>
                  </td>
                  <td className="px-5 sm:px-6 py-4 hidden md:table-cell">
                    {r.checkInTime ? (
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{new Date(r.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        {r.checkInDistance && <div className="text-xs text-slate-400 mt-0.5">{Math.round(r.checkInDistance)}m away</div>}
                      </div>
                    ) : <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-5 sm:px-6 py-4 hidden md:table-cell">
                    {r.checkOutTime ? (
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{new Date(r.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        {r.checkOutDistance && <div className="text-xs text-slate-400 mt-0.5">{Math.round(r.checkOutDistance)}m away</div>}
                      </div>
                    ) : <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-5 sm:px-6 py-4"><StatusBadge status={r.status} /></td>
                  <td className="px-5 sm:px-6 py-4 text-center">
                    {r.photoUrl ? (
                      <button onClick={() => setSelectedImage(r.photoUrl)} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors"><Eye className="h-4 w-4" /></button>
                    ) : <span className="text-slate-300 text-xs">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-2xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4">
              <h3 className="font-medium">Check-in Proof</h3>
              <div className="flex items-center gap-2">
                <a href={selectedImage} target="_blank" rel="noreferrer" className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"><ExternalLink className="h-4 w-4" /></a>
                <button onClick={() => setSelectedImage(null)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"><X className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="relative w-full aspect-video bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <img src={selectedImage} alt="Proof" className="max-h-[70vh] w-auto object-contain" onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Not+Found"; }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const c: Record<string, { label: string; cls: string }> = {
    on_time: { label: "On Time", cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20" },
    late: { label: "Late", cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20" },
    early_leave: { label: "Early Leave", cls: "bg-orange-500/10 text-orange-600 dark:text-orange-400 ring-orange-500/20" },
    absent: { label: "Absent", cls: "bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-rose-500/20" },
    incomplete: { label: "Incomplete", cls: "bg-slate-500/10 text-slate-600 dark:text-slate-400 ring-slate-500/20" },
    rejected_outside_area: { label: "Rejected", cls: "bg-red-500/10 text-red-600 dark:text-red-400 ring-red-500/20" },
  };
  const cfg = c[status] || { label: status, cls: "bg-slate-500/10 text-slate-500 ring-slate-500/20" };
  return <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${cfg.cls}`}>{cfg.label}</span>;
}
