"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-10 w-full rounded-xl bg-slate-900/20 animate-pulse" />;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex w-full items-center gap-2.5 rounded-lg border border-slate-200/60 dark:border-white/5 bg-slate-100 dark:bg-slate-900/50 px-2.5 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-300 transition-all hover:bg-slate-200/80 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-white"
    >
      {isDark ? (
        <>
          <Sun className="h-[18px] w-[18px] text-amber-500" />
          <span>Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="h-[18px] w-[18px] text-slate-500" />
          <span>Dark Mode</span>
        </>
      )}
    </button>
  );
}
