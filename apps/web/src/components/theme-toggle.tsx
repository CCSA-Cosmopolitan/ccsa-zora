"use client";

import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`size-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 ${className}`}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme mode"
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      className={`size-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-600/40 dark:hover:border-emerald-500/40 transition flex items-center justify-center cursor-pointer ${className}`}
    >
      {theme === "light" ? (
        <Moon className="size-4 transition-transform hover:-rotate-12" />
      ) : (
        <Sun className="size-4 text-amber-400 transition-transform hover:rotate-45" />
      )}
    </button>
  );
}
