"use client";

import { useState, useEffect } from "react";
import { Loader2, Download, Filter, FileBarChart } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

export default function ReportsPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  
  const currentMonthYear = new Date().toISOString().slice(0, 7); // YYYY-MM
  const [selectedMonth, setSelectedMonth] = useState(currentMonthYear);
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  
  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  // Fetch employees for the filter dropdown
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        // Since API returns all users, filter EMPLOYEES
        setEmployees(data.filter((u: any) => u.role === "EMPLOYEE"));
      } catch (err) {
        console.error("Failed to load employees", err);
      } finally {
        setLoadingEmployees(false);
      }
    };
    fetchEmployees();
  }, []);

  const fetchReports = async () => {
    if (!selectedMonth) return;
    setLoading(true);
    try {
      const payload = new URLSearchParams({
        month: selectedMonth,
        employeeId: selectedEmployee
      });
      const res = await fetch(`/api/reports?${payload}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (err) {
      console.error("Failed to load reports", err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch when filters change
  useEffect(() => {
    fetchReports();
  }, [selectedMonth, selectedEmployee]);

  const exportToPDF = () => {
    if (reports.length === 0) return;
    
    // Create new PDF instance
    const doc = new jsPDF();
    
    // Add title
    const formattedMonth = format(new Date(selectedMonth + "-01"), "MMMM yyyy");
    const docTitle = `Attendance Report - ${formattedMonth}`;
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(docTitle, 14, 22);
    
    // Subtitle if specific employee is filtered
    let subtitle = "All Employees";
    if (selectedEmployee !== "all") {
      const emp = employees.find(e => e.id === selectedEmployee);
      if (emp) subtitle = `Employee: ${emp.name} (${emp.employeeId})`;
    }
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(subtitle, 14, 30);
    doc.text(`Generated on: ${format(new Date(), "PP p")}`, 14, 36);

    // Prepare table data
    const tableData = reports.map(r => [
      format(new Date(r.schedule.date), "dd MMM yyyy"),
      r.user.name,
      r.schedule.shift.name,
      r.checkInTime ? format(new Date(r.checkInTime), "HH:mm") : '-',
      r.checkOutTime ? format(new Date(r.checkOutTime), "HH:mm") : '-',
      r.status.replace(/_/g, " ").toUpperCase()
    ]);

    // Generate table
    autoTable(doc, {
      startY: 42,
      head: [['Date', 'Employee', 'Shift', 'Check In', 'Check Out', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] }, // Emerald-500 equivalent color
      alternateRowStyles: { fillColor: [248, 250, 252] }, // Slate-50 equivalent
    });

    const safeTitle = docTitle.toLowerCase().replace(/\s+/g, '-');
    doc.save(`${safeTitle}.pdf`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileBarChart className="h-6 w-6 text-emerald-500" />
            Reports
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Generate and export attendance reports</p>
        </div>
        
        <button
          onClick={exportToPDF}
          disabled={reports.length === 0 || loading}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg px-4 py-2 transition-colors inline-flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
        >
          <Download className="h-4 w-4" /> Export to PDF
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="w-full sm:w-1/3">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Filter className="h-3 w-3" /> Filter Month
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="input-field"
            />
          </div>
          
          <div className="w-full sm:w-1/3">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Employee Filter
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="input-field"
              disabled={loadingEmployees}
            >
              <option value="all">All Employees</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.employeeId})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Report Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="border-b border-slate-200/60 dark:border-slate-800/60 px-5 sm:px-6 py-4 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">
            {reports.length} Records Found
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
                <th className="px-5 sm:px-6 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Date</th>
                <th className="px-5 sm:px-6 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Employee</th>
                <th className="px-5 sm:px-6 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Shift</th>
                <th className="px-5 sm:px-6 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center">In</th>
                <th className="px-5 sm:px-6 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center">Out</th>
                <th className="px-5 sm:px-6 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-500" />
                    <p className="mt-2 text-sm text-slate-500">Loading records...</p>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-500 dark:text-slate-400">
                    <FileBarChart className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
                    No attendance records found for this period.
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                    <td className="px-5 sm:px-6 py-3.5 text-slate-700 dark:text-slate-300 font-medium">
                      {format(new Date(report.schedule.date), "dd MMM yyyy")}
                    </td>
                    <td className="px-5 sm:px-6 py-3.5">
                      <div className="font-medium text-slate-900 dark:text-white">{report.user.name}</div>
                      <div className="text-[10px] text-slate-400 uppercase">{report.user.department || "General"}</div>
                    </td>
                    <td className="px-5 sm:px-6 py-3.5">
                      <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium">
                        {report.schedule.shift.name}
                      </span>
                    </td>
                    <td className="px-5 sm:px-6 py-3.5 text-center text-slate-600 dark:text-slate-400 font-mono text-xs">
                      {report.checkInTime ? format(new Date(report.checkInTime), "HH:mm") : "-"}
                    </td>
                    <td className="px-5 sm:px-6 py-3.5 text-center text-slate-600 dark:text-slate-400 font-mono text-xs">
                      {report.checkOutTime ? format(new Date(report.checkOutTime), "HH:mm") : "-"}
                    </td>
                    <td className="px-5 sm:px-6 py-3.5">
                      <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset ${
                        report.status === "on_time" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20" :
                        report.status === "absent" ? "bg-red-500/10 text-red-600 dark:text-red-400 ring-red-500/20" :
                        report.status === "incomplete" ? "bg-slate-500/10 text-slate-600 dark:text-slate-400 ring-slate-500/20" :
                        "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20"
                      }`}>
                        {report.status.replace(/_/g, " ")}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
