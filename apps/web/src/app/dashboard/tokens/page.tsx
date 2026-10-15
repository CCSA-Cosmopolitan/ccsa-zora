"use client";

import React, { useState } from "react";
import {
  Coins,
  CreditCard,
  Plus,
  Check,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Sliders,
  ShieldCheck,
  Building2,
  Calendar,
  Zap,
} from "lucide-react";
import { useWorkspace } from "@/context/workspace-context";

export default function TokenBankPage() {
  const { enterpriseName, tokensUsed, totalTokens, refillTokens } = useWorkspace();
  const [farmerCap, setFarmerCap] = useState(50);
  const [officerCap, setOfficerCap] = useState(300);
  const [autoSuspend, setAutoSuspend] = useState(true);
  const [refillSuccess, setRefillSuccess] = useState<number | null>(null);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const remainingTokens = Math.max(0, totalTokens - tokensUsed);
  const percentUsed = Math.min(100, Math.round((tokensUsed / totalTokens) * 100));

  function handleRefill(amount: number) {
    refillTokens(amount);
    setRefillSuccess(amount);
    setTimeout(() => setRefillSuccess(null), 3000);
  }

  function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  }

  const CLUSTERS_USAGE = [
    { name: "Bichi Irrigation Zone", count: "340 farmers", tokens: "2,410", percent: 34 },
    { name: "Gwarzo Maize Cluster", count: "215 farmers", tokens: "1,840", percent: 26 },
    { name: "Danbatta Sorghum Group", count: "180 farmers", tokens: "1,320", percent: 18 },
    { name: "Rano Rice Basin", count: "145 farmers", tokens: "980", percent: 14 },
    { name: "Kano Central HQ Extension Pool", count: "24 agents", tokens: "600", percent: 8 },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              <Coins className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Cooperative Token Bank & Quotas
            </h1>
          </div>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Manage your shared AI token pool, configure member query caps, and top up balance for {enterpriseName}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <Building2 className="w-3.5 h-3.5" />
            Enterprise Tier Active
          </span>
        </div>
      </div>

      {refillSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-emerald-800 dark:text-emerald-300 text-sm animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>
            Successfully added <strong>+{refillSuccess.toLocaleString()} tokens</strong> to {enterpriseName}&apos;s shared pool!
          </span>
        </div>
      )}

      {/* Main Token Overview Card */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wider font-semibold text-stone-400">
              Total Shared Balance
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl md:text-5xl font-black text-stone-900 dark:text-stone-100 font-mono tracking-tight">
                {remainingTokens.toLocaleString()}
              </span>
              <span className="text-stone-400 text-sm font-medium">
                tokens available
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Out of {totalTokens.toLocaleString()} total pooled tokens ({tokensUsed.toLocaleString()} used)
            </p>
          </div>

          <div className="bg-stone-50 dark:bg-stone-950/80 rounded-2xl p-4 border border-stone-200/80 dark:border-stone-800/80 space-y-2 min-w-[220px]">
            <div className="flex justify-between text-xs">
              <span className="text-stone-500 dark:text-stone-400">Daily Burn Rate:</span>
              <span className="font-mono font-bold text-stone-800 dark:text-stone-200">~182 queries</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-stone-500 dark:text-stone-400">Estimated Runway:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">~235 days</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-stone-500 dark:text-stone-400">Auto-Refill:</span>
              <span className="font-medium text-stone-700 dark:text-stone-300">Enabled at 10%</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-stone-100 dark:bg-stone-800 h-3.5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all duration-500"
              style={{ width: `${percentUsed}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-stone-400">
            <span>{percentUsed}% consumed</span>
            <span>{100 - percentUsed}% available for registered farmers</span>
          </div>
        </div>
      </div>

      {/* Refill Packs Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
            Instant Token Refill Packs
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Add queries to your cooperative balance instantly via bank transfer or debit card.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pack 1 */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm space-y-4 hover:border-stone-300 dark:hover:border-stone-700 transition-all">
            <div>
              <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                Field Scout Pack
              </div>
              <div className="text-2xl font-black text-stone-900 dark:text-stone-100 font-mono mt-1">
                +10,000 <span className="text-xs font-normal text-stone-400">tokens</span>
              </div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                ₦25,000 <span className="text-xs font-normal text-stone-400">one-time</span>
              </div>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Ideal for small farmer cooperatives (~200 consultations per month).
            </p>
            <button
              onClick={() => handleRefill(10000)}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-stone-800 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 text-stone-800 dark:text-stone-200 transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Purchase +10k Tokens</span>
            </button>
          </div>

          {/* Pack 2 - Popular */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border-2 border-emerald-500/80 p-5 shadow-md space-y-4 relative">
            <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white shadow-sm">
              Most Popular
            </span>
            <div>
              <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Cluster Union Pack
              </div>
              <div className="text-2xl font-black text-stone-900 dark:text-stone-100 font-mono mt-1">
                +25,000 <span className="text-xs font-normal text-stone-400">tokens</span>
              </div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                ₦55,000 <span className="text-xs font-normal text-stone-400">one-time</span>
              </div>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Recommended for regional farming federations with multiple extension officers.
            </p>
            <button
              onClick={() => handleRefill(25000)}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Purchase +25k Tokens</span>
            </button>
          </div>

          {/* Pack 3 */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm space-y-4 hover:border-stone-300 dark:hover:border-stone-700 transition-all">
            <div>
              <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                State Agribusiness Scheme
              </div>
              <div className="text-2xl font-black text-stone-900 dark:text-stone-100 font-mono mt-1">
                +100,000 <span className="text-xs font-normal text-stone-400">tokens</span>
              </div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                ₦180,000 <span className="text-xs font-normal text-stone-400">one-time</span>
              </div>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              For state agricultural ministries, large outgrower schemes, and NGO programs.
            </p>
            <button
              onClick={() => handleRefill(100000)}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-stone-800 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 text-stone-800 dark:text-stone-200 transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Purchase +100k Tokens</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: 1. Quota Governance Rules, 2. Consumption by Cluster */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Governance Settings */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                Default Member Quota Controls
              </h3>
            </div>
            {settingsSaved && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                Saved!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                <span>Default Monthly Cap per Farmer</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {farmerCap} queries / mo
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={200}
                step={5}
                value={farmerCap}
                onChange={(e) => setFarmerCap(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <p className="text-[11px] text-stone-400 mt-1">
                Registered farmers cannot exceed this limit without extension lead approval.
              </p>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                <span>Default Monthly Cap per Extension Agent</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {officerCap} queries / mo
                </span>
              </div>
              <input
                type="range"
                min={100}
                max={1000}
                step={50}
                value={officerCap}
                onChange={(e) => setOfficerCap(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <p className="text-[11px] text-stone-400 mt-1">
                Field scouts diagnosing entire villages require higher volume.
              </p>
            </div>

            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                  Auto-Pause on Limit Breach
                </div>
                <div className="text-[11px] text-stone-400">
                  Temporarily pause voice queries when a member hits 100% of quota.
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoSuspend}
                onChange={(e) => setAutoSuspend(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold transition-all shadow-sm"
            >
              Save Quota Governance Policies
            </button>
          </form>
        </div>

        {/* Consumption Breakdown by Cluster */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
              Usage by Farming Cluster
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Breakdown of queries across your cooperative regional branches.
            </p>
          </div>

          <div className="space-y-3.5">
            {CLUSTERS_USAGE.map((c) => (
              <div key={c.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                      {c.name}
                    </span>
                    <span className="text-stone-400 ml-2">({c.count})</span>
                  </div>
                  <span className="font-mono font-bold text-stone-700 dark:text-stone-300">
                    {c.tokens} tokens
                  </span>
                </div>
                <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{ width: `${c.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
