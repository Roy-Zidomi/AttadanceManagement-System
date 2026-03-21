"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LayoutDashboard, Users, CalendarDays, Clock, MapPin, CheckCircle, LogOut, Menu, X, FileBarChart } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/Logo";

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Employees", href: "/admin/employees", icon: Users },
  { name: "Shifts", href: "/admin/shifts", icon: Clock },
  { name: "Locations", href: "/admin/locations", icon: MapPin },
  { name: "Schedules", href: "/admin/schedules", icon: CalendarDays },
  { name: "Attendance", href: "/admin/attendance", icon: CheckCircle },
  { name: "Reports", href: "/admin/reports", icon: FileBarChart },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();

  const sidebarContent = (
    <>
      <div className="flex h-14 items-center gap-3 px-5 border-b border-slate-200 dark:border-white/5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 shadow-md shadow-emerald-500/20">
          <Logo className="h-5 w-5 text-white" />
        </div>
        <span className="text-base font-bold tracking-tight text-slate-800 dark:text-white">
          ShiftTrack
        </span>
        <button className="ml-auto lg:hidden text-slate-400 hover:text-slate-600 dark:hover:text-white" onClick={() => setOpen(false)}>
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="px-3 pt-2 pb-1">
        <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Navigation</p>
      </div>

      <nav className="flex-1 space-y-1 px-3 pb-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`group flex items-center rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${isActive
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-white"
                }`}
            >
              <item.icon
                className={`mr-3 h-[18px] w-[18px] flex-shrink-0 transition-colors ${isActive ? "text-white/90" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                  }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-3 py-3 border-t border-slate-200/60 dark:border-white/5 space-y-1.5">
        <div className="hover:bg-slate-100 dark:hover:bg-white/5 transition-colors rounded-lg px-2 py-1.5 flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-xs font-bold text-white flex-shrink-0">
            {session?.user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-medium text-slate-700 dark:text-white truncate">{session?.user?.name || "Admin"}</p>
            <p className="text-[10px] text-slate-400 truncate leading-tight">{session?.user?.email || ""}</p>
          </div>
        </div>
        <ThemeToggle />
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200/60 dark:border-white/5 bg-slate-100 dark:bg-slate-900/50 px-2.5 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-300 transition-all hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-500/20"
        >
          <LogOut className="h-3.5 w-3.5" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="fixed top-0 left-0 right-0 z-30 flex h-16 items-center border-b border-slate-200/60 dark:border-white/5 bg-white/80 dark:bg-[#0B1217]/90 backdrop-blur-xl px-4 lg:hidden">
        <button
          className="flex items-center justify-center p-2 -ml-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="ml-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 shadow-md shadow-emerald-500/20">
            <Logo className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-800 dark:text-white">
            ShiftTrack
          </span>
        </div>
      </div>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <div 
          className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setOpen(false)} 
        />
        <div 
          className={`absolute inset-y-0 left-0 flex w-[280px] flex-col bg-slate-50 dark:bg-gradient-to-b dark:from-slate-950 dark:to-slate-900 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {sidebarContent}
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex h-full w-[260px] flex-col bg-slate-50 dark:bg-gradient-to-b dark:from-slate-950 dark:to-slate-900 border-r border-slate-200/80 dark:border-transparent flex-shrink-0">
        {sidebarContent}
      </div>
    </>
  );
}
