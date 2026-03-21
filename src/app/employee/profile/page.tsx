"use client";

import { useSession } from "next-auth/react";
import { UserCircle, Mail, Briefcase, Hash } from "lucide-react";

export default function ProfilePage() {
  const { data: session } = useSession();
  if (!session?.user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Your Profile</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage your employment details</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="relative bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 px-8 py-16">
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5 blur-2xl" />
          <div className="mx-auto h-24 w-24 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center border-4 border-white/20 shadow-2xl text-3xl font-bold text-emerald-600 dark:text-emerald-400 relative z-10 -mb-20">
            {session.user.name?.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="px-6 sm:px-8 pt-16 pb-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{session.user.name}</h3>
            <span className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold mt-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
              {session.user.role}
            </span>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 mt-8">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 flex-shrink-0">
                <Mail className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</p>
                <p className="mt-1 text-slate-900 dark:text-white font-medium">{session.user.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 flex-shrink-0">
                <Hash className="h-4 w-4 text-violet-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Employee ID</p>
                <p className="mt-1 text-slate-900 dark:text-white font-medium font-mono">{session.user.employeeId || "—"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 col-span-full">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 flex-shrink-0">
                <Briefcase className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Department</p>
                <p className="mt-1 text-slate-900 dark:text-white font-medium">{session.user.department || "General Staff"}</p>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-200/60 dark:border-slate-800/60">
            <p className="text-sm text-slate-400 text-center">
              If your information is incorrect, please contact your administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
