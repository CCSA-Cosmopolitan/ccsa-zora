"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Building2,
  Check,
  ChevronDown,
  Sparkles,
  User,
  Users2,
  Zap,
} from "lucide-react";
import { useWorkspace, WorkspaceMode } from "@/context/workspace-context";

export function WorkspaceSwitcher({ className = "" }: { className?: string }) {
  const { mode, setMode, enterpriseName } = useWorkspace();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/90 hover:border-emerald-600/50 transition-all text-xs font-semibold text-stone-800 dark:text-stone-200 shadow-2xs cursor-pointer select-none"
      >
        <div
          className={`size-2 rounded-full ${
            mode === "personal"
              ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
              : "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"
          }`}
        />
        {mode === "personal" ? (
          <div className="flex items-center gap-1.5">
            <User className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Personal Assistant</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <Building2 className="size-3.5 text-blue-500 dark:text-blue-400" />
            <span className="truncate max-w-[140px] sm:max-w-[170px]">{enterpriseName}</span>
          </div>
        )}
        <ChevronDown
          className={`size-3 text-stone-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 sm:left-0 top-full mt-2 w-72 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-stone-100 dark:border-stone-800 mb-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Select Workspace Mode
            </p>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
              Switch between your personal assistant and enterprise management.
            </p>
          </div>

          <div className="space-y-1">
            {/* Personal Option */}
            <button
              type="button"
              onClick={() => {
                setMode("personal");
                setOpen(false);
              }}
              className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                mode === "personal"
                  ? "bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200"
                  : "hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
              }`}
            >
              <div
                className={`size-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  mode === "personal"
                    ? "bg-emerald-600 text-white"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-500"
                }`}
              >
                <User className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">Personal Account</span>
                  {mode === "personal" && <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />}
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-tight mt-0.5">
                  Clean voice & chat assistant for individual farmers and agents.
                </p>
              </div>
            </button>

            {/* Enterprise Option */}
            <button
              type="button"
              onClick={() => {
                setMode("enterprise");
                setOpen(false);
              }}
              className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                mode === "enterprise"
                  ? "bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200"
                  : "hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
              }`}
            >
              <div
                className={`size-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  mode === "enterprise"
                    ? "bg-blue-600 text-white"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-500"
                }`}
              >
                <Building2 className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold truncate">Enterprise Co-op</span>
                  {mode === "enterprise" && <Check className="size-3.5 text-blue-600 dark:text-blue-400" />}
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-tight mt-0.5">
                  Manage members, shared token pool, API tokens & multi-user access.
                </p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
