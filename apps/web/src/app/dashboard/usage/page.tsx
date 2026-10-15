"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Zap,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Mic,
  Camera,
  WifiOff,
  Check,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { useWorkspace } from "@/context/workspace-context";

export default function UsagePage() {
  const { personalQueriesUsed, personalWeeklyQuota, consultations, setMode } = useWorkspace();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradedSuccess, setUpgradedSuccess] = useState(false);

  const remaining = Math.max(0, personalWeeklyQuota - personalQueriesUsed);
  const percentageUsed = Math.min(
    100,
    Math.round((personalQueriesUsed / personalWeeklyQuota) * 100)
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              <Zap className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Voice Usage & Personal Quota
            </h1>
          </div>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Track your weekly subsidized AI voice queries and manage your farmer subscription tier.
          </p>
        </div>

        <button
          onClick={() => setShowUpgradeModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Upgrade to Zora Pro</span>
        </button>
      </div>

      {/* Main Quota Card */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>CCSA Sovereign Grant Tier</span>
            </div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
              Weekly Voice Diagnosis Quota
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Subsidized by Cosmopolitan University Center for Climate-Smart Agriculture.
            </p>
          </div>

          <div className="text-right">
            <div className="text-3xl font-extrabold text-stone-900 dark:text-stone-100 font-mono">
              {remaining} <span className="text-sm font-normal text-stone-400">left</span>
            </div>
            <div className="text-xs text-stone-500 dark:text-stone-400">
              {personalQueriesUsed} of {personalWeeklyQuota} queries used
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-stone-100 dark:bg-stone-800 h-3 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentageUsed > 80
                  ? "bg-amber-500"
                  : percentageUsed > 95
                  ? "bg-red-500"
                  : "bg-emerald-600"
              }`}
              style={{ width: `${percentageUsed}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-stone-400">
            <span>0 queries</span>
            <span>Resets every Monday at 00:00 UTC</span>
            <span>{personalWeeklyQuota} queries / wk</span>
          </div>
        </div>

        {/* What queries include */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-stone-100 dark:border-stone-800">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-950/50 border border-stone-200/80 dark:border-stone-800/80">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                Voice Queries
              </div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                Full two-way speech recognition & speech synthesis in 5 local languages.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-950/50 border border-stone-200/80 dark:border-stone-800/80">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                Crop Leaf Pathology
              </div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                Visual symptom confirmation for fall armyworm, blast, and blight.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-950/50 border border-stone-200/80 dark:border-stone-800/80">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <WifiOff className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                Offline Auto-Sync
              </div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                Record voice questions in the bush; answers process automatically upon signal.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cooperative Sponsor Callout */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-stone-900 to-stone-900 rounded-2xl border border-emerald-800/40 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-stone-100 text-base">
              Belong to an Agricultural Cooperative or Outgrower Scheme?
            </h3>
          </div>
          <p className="text-xs text-stone-400 max-w-xl">
            Cooperative unions and agribusinesses can sponsor unlimited Zora tokens for all member farmers. Switch to Enterprise mode to manage pooled quotas or link your cooperative.
          </p>
        </div>

        <button
          onClick={() => setMode("enterprise")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-100 text-xs font-medium border border-stone-700 transition-all shrink-0"
        >
          <span>Switch to Enterprise Workspace</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Farmer & Extension Agent Pro
                </span>
                <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                  Unlock Unlimited Zora Voice AI
                </h3>
              </div>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-sm p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-base text-stone-900 dark:text-stone-100">
                    Zora Pro License
                  </span>
                  <span className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400">
                    ₦4,500 <span className="text-xs font-normal text-stone-400">/ month</span>
                  </span>
                </div>
                <ul className="text-xs space-y-1.5 text-stone-600 dark:text-stone-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    Unlimited daily voice & text diagnosis queries
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    Instant high-priority voice synthesis queue
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    Full offline model pack download for deep rural areas
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    Direct WhatsApp & SMS bot integration for your farm
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all"
              >
                Maybe Later
              </button>
              <button
                onClick={() => {
                  setUpgradedSuccess(true);
                  setTimeout(() => {
                    setShowUpgradeModal(false);
                    setUpgradedSuccess(false);
                  }, 1500);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
              >
                {upgradedSuccess ? "Activating Pro..." : "Proceed with Activation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
