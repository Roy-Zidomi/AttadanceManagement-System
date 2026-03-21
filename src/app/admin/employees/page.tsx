"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Loader2, X } from "lucide-react";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ employeeId: "", name: "", email: "", password: "", phone: "", department: "", role: "EMPLOYEE" });

  const fetchEmployees = async () => {
    setLoading(true);
    try { const res = await fetch(`/api/users?search=${searchTerm}`); setEmployees(await res.json()); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEmployees(); }, [searchTerm]);

  const handleOpenAdd = () => { setEditId(null); setFormData({ employeeId: "", name: "", email: "", password: "", phone: "", department: "", role: "EMPLOYEE" }); setIsModalOpen(true); };
  const handleOpenEdit = (emp: any) => { setEditId(emp.id); setFormData({ employeeId: emp.employeeId, name: emp.name, email: emp.email, password: "", phone: emp.phone || "", department: emp.department || "", role: emp.role }); setIsModalOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editId ? `/api/users/${editId}` : "/api/users";
    const method = editId ? "PUT" : "POST";
    const payload = { ...formData };
    if (editId && !payload.password) delete (payload as any).password;
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (res.ok) { setIsModalOpen(false); setEditId(null); fetchEmployees(); }
    else { const err = await res.json(); alert(err.error || "Failed"); }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this employee?")) {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) fetchEmployees(); else alert("Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Employees</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your workforce</p>
        </div>
        <button onClick={handleOpenAdd} className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg px-4 py-2 transition-colors inline-flex items-center gap-2 text-sm">
          <Plus className="h-4 w-4" /> Add Employee
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="border-b border-slate-200/60 dark:border-slate-800/60 px-5 sm:px-6 py-4">
          <div className="relative max-w-sm">
            <Search className="absolute inset-y-0 left-3 my-auto h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Search employees..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field pl-10" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/60">
                <th className="px-5 sm:px-6 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Employee</th>
                <th className="px-5 sm:px-6 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 hidden sm:table-cell">Contact</th>
                <th className="px-5 sm:px-6 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 hidden md:table-cell">Department</th>
                <th className="px-5 sm:px-6 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Role</th>
                <th className="px-5 sm:px-6 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr><td colSpan={5} className="py-12 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-emerald-500" /></td></tr>
              ) : employees.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-slate-400">No employees found.</td></tr>
              ) : employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 sm:px-6 py-4">
                    <div className="font-medium text-slate-900 dark:text-white">{emp.name}</div>
                    <div className="text-xs text-slate-400">{emp.employeeId}</div>
                  </td>
                  <td className="px-5 sm:px-6 py-4 hidden sm:table-cell">
                    <div className="text-slate-600 dark:text-slate-300">{emp.email}</div>
                    <div className="text-xs text-slate-400">{emp.phone || "—"}</div>
                  </td>
                  <td className="px-5 sm:px-6 py-4 text-slate-600 dark:text-slate-400 hidden md:table-cell">{emp.department || "—"}</td>
                  <td className="px-5 sm:px-6 py-4">
                    <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                      emp.role === "ADMIN" ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 ring-violet-500/20" : "bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-blue-500/20"
                    }`}>{emp.role}</span>
                  </td>
                  <td className="px-5 sm:px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => handleOpenEdit(emp)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-500 transition-colors"><Edit2 className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(emp.id)} className="p-2 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </div>
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
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{editId ? "Edit Employee" : "Add Employee"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Employee ID</label><input required type="text" value={formData.employeeId} onChange={(e) => setFormData({...formData, employeeId: e.target.value})} className="input-field" /></div>
                <div><label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label><input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input-field" /></div>
              </div>
              <div><label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Email</label><input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="input-field" /></div>
              <div><label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{editId ? "Update Password" : "Password"}</label><input required={!editId} type="password" placeholder={editId ? "Leave blank to keep unchanged" : ""} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="input-field" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Department</label><input type="text" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} className="input-field" /></div>
                <div><label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Phone</label><input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="input-field" /></div>
              </div>
              <div><label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Role</label><select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="input-field"><option value="EMPLOYEE">Employee</option><option value="ADMIN">Admin</option></select></div>
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
