"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, MapPin, Loader2, X, Navigation } from "lucide-react";

export default function LocationsPage() {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", address: "", latitude: "", longitude: "", radiusMeters: 100 });

  const fetchLocations = async () => {
    setLoading(true);
    try { const res = await fetch(`/api/locations`); setLocations(await res.json()); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLocations(); }, []);

  const handleOpenAdd = () => { setEditId(null); setFormData({ name: "", address: "", latitude: "", longitude: "", radiusMeters: 100 }); setIsModalOpen(true); };
  const handleOpenEdit = (loc: any) => { setEditId(loc.id); setFormData({ name: loc.name, address: loc.address || "", latitude: loc.latitude.toString(), longitude: loc.longitude.toString(), radiusMeters: loc.radiusMeters }); setIsModalOpen(true); };

  const handleAutoLocate = () => {
    if (!navigator.geolocation) { alert("Geolocation not supported"); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => setFormData({ ...formData, latitude: pos.coords.latitude.toString(), longitude: pos.coords.longitude.toString() }),
      (err) => alert("Failed: " + err.message)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editId ? `/api/locations/${editId}` : "/api/locations";
    const method = editId ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
    if (res.ok) { setIsModalOpen(false); setEditId(null); fetchLocations(); }
    else { const err = await res.json(); alert(err.error || "Failed"); }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this location?")) {
      const res = await fetch(`/api/locations/${id}`, { method: "DELETE" });
      if (res.ok) fetchLocations(); else { const err = await res.json(); alert(err.error || "Failed"); }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Work Locations</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage office branches and allowed areas</p>
        </div>
        <button onClick={handleOpenAdd} className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg px-4 py-2 transition-colors inline-flex items-center gap-2 text-sm">
          <Plus className="h-4 w-4" /> Add Location
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/60">
                <th className="px-5 sm:px-6 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Location</th>
                <th className="px-5 sm:px-6 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 hidden sm:table-cell">Coordinates</th>
                <th className="px-5 sm:px-6 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 hidden md:table-cell">Radius</th>
                <th className="px-5 sm:px-6 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr><td colSpan={4} className="py-12 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-emerald-500" /></td></tr>
              ) : locations.length === 0 ? (
                <tr><td colSpan={4} className="py-16 text-center">
                  <MapPin className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700 mb-3" />
                  <p className="text-slate-400">No locations defined.</p>
                </td></tr>
              ) : locations.map((loc) => (
                <tr key={loc.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 sm:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/20 flex-shrink-0">
                        <MapPin className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{loc.name}</div>
                        <div className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-[300px]">{loc.address}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 sm:px-6 py-4 hidden sm:table-cell">
                    <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg text-slate-500 dark:text-slate-400 font-mono">
                      {loc.latitude}, {loc.longitude}
                    </code>
                  </td>
                  <td className="px-5 sm:px-6 py-4 font-medium text-slate-700 dark:text-slate-300 hidden md:table-cell">{loc.radiusMeters}m</td>
                  <td className="px-5 sm:px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => handleOpenEdit(loc)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-500 transition-colors"><Edit2 className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(loc.id)} className="p-2 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 my-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{editId ? "Edit Location" : "Add Location"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Location Name</label><input required type="text" placeholder="e.g. Headquarters" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input-field" /></div>
              <div><label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Address</label><input type="text" placeholder="123 Main St, City" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="input-field" /></div>

              <div className="bg-slate-50/80 dark:bg-white/[0.03] p-4 rounded-xl border border-slate-100 dark:border-slate-800/40">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Coordinates</label>
                  <button type="button" onClick={handleAutoLocate} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 ring-1 ring-inset ring-emerald-500/20 transition-colors">
                    <Navigation className="h-3 w-3" /> Auto Locate
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Latitude</label><input required type="number" step="any" placeholder="-6.200000" value={formData.latitude} onChange={(e) => setFormData({...formData, latitude: e.target.value})} className="input-field font-mono text-sm" /></div>
                  <div><label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Longitude</label><input required type="number" step="any" placeholder="106.816666" value={formData.longitude} onChange={(e) => setFormData({...formData, longitude: e.target.value})} className="input-field font-mono text-sm" /></div>
                </div>
              </div>

              <div><label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Allowed Radius (meters)</label>
                <div className="flex items-center gap-3">
                  <input required type="number" min="10" value={formData.radiusMeters} onChange={(e) => setFormData({...formData, radiusMeters: parseInt(e.target.value) || 0})} className="input-field w-32" />
                  <span className="text-xs text-slate-400 flex-1">Employees must check in within this distance.</span>
                </div>
              </div>
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
