"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Loader2, X, Clock } from "lucide-react";

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", startTime: "08:00", endTime: "17:00", lateThreshold: 15, earlyLeaveThreshold: 15, isActive: true });

  const fetchShifts = async () => {
    setLoading(true);
    try { const res = await fetch(`/api/shifts`); setShifts(await res.json()); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchShifts(); }, []);

  const handleOpenAdd = () => { setEditId(null); setFormData({ name: "", startTime: "08:00", endTime: "17:00", lateThreshold: 15, earlyLeaveThreshold: 15, isActive: true }); setIsModalOpen(true); };
  const handleOpenEdit = (shift: any) => { setEditId(shift.id); setFormData({ name: shift.name, startTime: shift.startTime, endTime: shift.endTime, lateThreshold: shift.lateThreshold, earlyLeaveThreshold: shift.earlyLeaveThreshold, isActive: shift.isActive }); setIsModalOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editId ? `/api/shifts/${editId}` : "/api/shifts";
    const method = editId ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
    if (res.ok) { setIsModalOpen(false); setEditId(null); fetchShifts(); }
    else { const err = await res.json(); alert(err.error || "Failed"); }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this shift?")) {
      const res = await fetch(`/api/shifts/${id}`, { method: "DELETE" });
      if (res.ok) fetchShifts(); else { const err = await res.json(); alert(err.error || "Failed"); }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Work Shifts</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage daily work schedules</p>
        </div>
        <button onClick={handleOpenAdd} className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg px-4 py-2 transition-colors inline-flex items-center gap-2 text-sm">
          <Plus className="h-4 w-4" /> Add Shift
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>
        ) : shifts.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-16 text-center shadow-sm">
            <Clock className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">No shifts found</h3>
            <p className="mt-1 text-slate-500 dark:text-slate-400 text-sm">Get started by creating a new shift.</p>
          </div>
        ) : shifts.map((shift) => (
          <div key={shift.id} className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${!shift.isActive ? 'opacity-50' : ''}`}>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900 dark:text-white">{shift.name}</h3>
                <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${
                  shift.isActive ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20" : "bg-slate-500/10 text-slate-500 ring-slate-500/20"
                }`}>{shift.isActive ? "Active" : "Inactive"}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-50/80 dark:bg-white/[0.03] rounded-xl p-3 border border-slate-100 dark:border-slate-800/40">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Start</span>
                  <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{shift.startTime}</p>
                </div>
                <div className="bg-slate-50/80 dark:bg-white/[0.03] rounded-xl p-3 border border-slate-100 dark:border-slate-800/40">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">End</span>
                  <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{shift.endTime}</p>
                </div>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg px-2.5 py-1 font-medium ring-1 ring-inset ring-amber-500/20">Late: {shift.lateThreshold}m</span>
                <span className="bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-lg px-2.5 py-1 font-medium ring-1 ring-inset ring-orange-500/20">Early: {shift.earlyLeaveThreshold}m</span>
              </div>
            </div>
            <div className="flex border-t border-slate-200/60 dark:border-slate-800/60">
              <button onClick={() => handleOpenEdit(shift)} className="flex-1 flex items-center justify-center gap-2 p-3 text-xs font-medium text-slate-500 hover:bg-slate-50 dark:hover:bg-white/[0.02] hover:text-emerald-500 transition-colors">
                <Edit2 className="h-3.5 w-3.5" /> Edit
              </button>
              <div className="w-px bg-slate-200/60 dark:bg-slate-800/60" />
              <button onClick={() => handleDelete(shift.id)} className="flex-1 flex items-center justify-center gap-2 p-3 text-xs font-medium text-slate-500 hover:bg-red-500/5 hover:text-red-500 transition-colors">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{editId ? "Edit Shift" : "Create Shift"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Shift Name</label><input required type="text" placeholder="e.g. Morning Shift" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input-field" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Start Time</label><input required type="time" value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})} className="input-field" /></div>
                <div><label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">End Time</label><input required type="time" value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})} className="input-field" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Late Threshold (min)</label><input required type="number" min="0" value={formData.lateThreshold} onChange={(e) => setFormData({...formData, lateThreshold: parseInt(e.target.value)})} className="input-field" /></div>
                <div><label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Early Leave (min)</label><input required type="number" min="0" value={formData.earlyLeaveThreshold} onChange={(e) => setFormData({...formData, earlyLeaveThreshold: parseInt(e.target.value)})} className="input-field" /></div>
              </div>
              {editId && (
                <div className="flex items-center gap-3 pt-2">
                  <input id="isActive" type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                  <label htmlFor="isActive" className="text-sm text-slate-700 dark:text-slate-300 font-medium">Shift is active</label>
                </div>
              )}
              <div className="pt-3 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl px-4 py-2 transition-colors text-sm">Cancel</button>
                <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg px-4 py-2 transition-colors text-sm">{editId ? "Update" : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
