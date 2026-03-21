"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2, X, Calendar as CalendarIcon, Filter } from "lucide-react";

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState("");
  const [formData, setFormData] = useState({ userId: "", shiftId: "", locationId: "", date: "" });

  const fetchData = async () => {
    setLoading(true);
    try {
      const url = dateFilter ? `/api/schedules?date=${dateFilter}` : `/api/schedules`;
      const [resS, resE, resSh, resL] = await Promise.all([fetch(url), fetch("/api/users"), fetch("/api/shifts?activeOnly=true"), fetch("/api/locations?activeOnly=true")]);
      setSchedules(await resS.json());
      const emps = await resE.json();
      setEmployees(emps.filter((e: any) => e.role === "EMPLOYEE" && e.isActive));
      setShifts(await resSh.json());
      setLocations(await resL.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [dateFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/schedules", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
    if (res.ok) { setIsModalOpen(false); setFormData({ userId: "", shiftId: "", locationId: "", date: "" }); fetchData(); }
    else { const err = await res.json(); alert(err.error || "Failed"); }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this schedule?")) {
      const res = await fetch(`/api/schedules/${id}`, { method: "DELETE" });
      if (res.ok) fetchData(); else { const err = await res.json(); alert(err.error || "Failed"); }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Schedules</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Assign shifts and locations to employees</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg px-4 py-2 transition-colors inline-flex items-center gap-2 text-sm">
          <Plus className="h-4 w-4" /> Assign Schedule
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="flex flex-col sm:flex-row border-b border-slate-200/60 dark:border-slate-800/60 px-5 sm:px-6 py-4 gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
            <Filter className="h-4 w-4 text-slate-400" /> Filter by Date:
          </div>
          <div className="flex items-center gap-2">
            <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="input-field w-auto" />
            {dateFilter && <button onClick={() => setDateFilter("")} className="text-xs font-medium text-emerald-500 hover:text-emerald-600">Clear</button>}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/60">
                <th className="px-5 sm:px-6 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Date</th>
                <th className="px-5 sm:px-6 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Employee</th>
                <th className="px-5 sm:px-6 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 hidden sm:table-cell">Shift</th>
                <th className="px-5 sm:px-6 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 hidden md:table-cell">Location</th>
                <th className="px-5 sm:px-6 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr><td colSpan={5} className="py-12 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-emerald-500" /></td></tr>
              ) : schedules.length === 0 ? (
                <tr><td colSpan={5} className="py-16 text-center">
                  <CalendarIcon className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700 mb-3" />
                  <p className="text-slate-400">No schedules found.</p>
                </td></tr>
              ) : schedules.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 sm:px-6 py-4">
                    <span className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {new Date(s.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                  </td>
                  <td className="px-5 sm:px-6 py-4">
                    <div className="font-medium text-slate-900 dark:text-white">{s.user.name}</div>
                    <div className="text-xs text-slate-400">{s.user.employeeId}</div>
                  </td>
                  <td className="px-5 sm:px-6 py-4 text-emerald-600 dark:text-emerald-400 font-medium hidden sm:table-cell">{s.shift.name}</td>
                  <td className="px-5 sm:px-6 py-4 text-slate-600 dark:text-slate-400 hidden md:table-cell">{s.location.name}</td>
                  <td className="px-5 sm:px-6 py-4 text-right">
                    <button onClick={() => handleDelete(s.id)} className="p-2 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Assign Schedule</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Date</label><input required type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="input-field" /></div>
              <div><label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Employee</label><select required value={formData.userId} onChange={(e) => setFormData({...formData, userId: e.target.value})} className="input-field"><option value="">Select employee...</option>{employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.employeeId})</option>)}</select></div>
              <div><label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Shift</label><select required value={formData.shiftId} onChange={(e) => setFormData({...formData, shiftId: e.target.value})} className="input-field"><option value="">Select shift...</option>{shifts.map(s => <option key={s.id} value={s.id}>{s.name} ({s.startTime} - {s.endTime})</option>)}</select></div>
              <div><label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Location</label><select required value={formData.locationId} onChange={(e) => setFormData({...formData, locationId: e.target.value})} className="input-field"><option value="">Select location...</option>{locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select></div>
              <div className="pt-3 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl px-4 py-2 transition-colors text-sm">Cancel</button>
                <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg px-4 py-2 transition-colors text-sm">Assign</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
