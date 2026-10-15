"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  CloudRain,
  CheckCircle2,
  AlertTriangle,
  History,
  Sprout,
  Users2,
  Coins,
  KeyRound,
  ShieldCheck,
  Send,
  Volume2,
  Mic,
  Plus,
  Building2,
  User,
  Zap,
} from "lucide-react";

import { useWorkspace } from "@/context/workspace-context";
import { ZoraAssistant } from "@/components/zora-assistant";

export default function DashboardMainPage() {
  const {
    mode,
    enterpriseName,
    members,
    tokensUsed,
    totalTokens,
    consultations,
    selectedCrops,
    selectedState,
    personalWeeklyQuota,
    personalQueriesUsed,
  } = useWorkspace();

  if (mode === "personal") {
    return <PersonalAssistantDashboard />;
  }

  return <EnterpriseOverviewDashboard />;
}

// ==========================================
// 1. PERSONAL DASHBOARD: THE CLEAN ZORA ASSISTANT
// ==========================================
function PersonalAssistantDashboard() {
  const {
    selectedCrops,
    selectedState,
    consultations,
    personalWeeklyQuota,
    personalQueriesUsed,
  } = useWorkspace();

  return (
    <div className="space-y-8">
      {/* Welcome Banner with Crops & Savanna Location context */}
      <div className="rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/60 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
              <Sparkles className="size-3.5" />
              <span>Personal Agronomic Assistant</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight">
              Ask Zora about your farm
            </h1>
            <p className="text-sm text-stone-600 dark:text-stone-400 max-w-xl">
              Voice-first, native language diagnosis for crop pests, plant disease, soil health, and weather advice.
            </p>
          </div>

          {/* Quick Context Card */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 bg-stone-50 dark:bg-stone-950 p-4 rounded-2xl border border-stone-200 dark:border-stone-800">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Your Saved Crops
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {selectedCrops.map((c) => (
                  <span
                    key={c}
                    className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="h-8 w-px bg-stone-200 dark:bg-stone-800 hidden sm:block" />

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Savanna Weather Window
              </span>
              <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                <CloudRain className="size-3.5 text-blue-500" />
                <span>Optimal morning spray</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Assistant */}
      <div className="rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/60 p-6 sm:p-10 shadow-xs">
        <ZoraAssistant />
      </div>

      {/* Recent Farm Inquiries & Quick Review */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-white">
              Recent Consultations
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Your saved diagnoses and treatment steps
            </p>
          </div>
          <Link
            href="/dashboard/history"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
          >
            <span>View All Saved Advice</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {consultations.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/80 p-5 space-y-3 shadow-xs hover:border-emerald-600/40 transition"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                  {item.crop}
                </span>
                <span className="text-[10px] text-stone-400">{item.date}</span>
              </div>
              <p className="text-xs font-bold text-stone-900 dark:text-white line-clamp-1">
                {item.diagnosis}
              </p>
              <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed line-clamp-2">
                {item.treatment}
              </p>
              <div className="pt-2 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-[11px]">
                <span className="text-stone-400">{item.language}</span>
                <Link
                  href="/dashboard/history"
                  className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  Read steps →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. ENTERPRISE DASHBOARD: COOPERATIVE MANAGEMENT
// ==========================================
function EnterpriseOverviewDashboard() {
  const { enterpriseName, members, tokensUsed, totalTokens } = useWorkspace();

  const totalMembersCount = 1840;
  const activeAgentsCount = 24;
  const monthlyInquiries = 4392;
  const tokensRemaining = totalTokens - tokensUsed;

  const topDiseases = [
    { name: "Fall Armyworm (Spodoptera frugiperda)", crop: "Maize", percentage: 38, count: 1668 },
    { name: "Cassava Mosaic Geminivirus (CMD)", crop: "Cassava", percentage: 26, count: 1141 },
    { name: "Rice Blast (Magnaporthe oryzae)", crop: "Rice", percentage: 18, count: 790 },
    { name: "Tomato Fruit Borer (Tuta absoluta)", crop: "Tomato", percentage: 11, count: 483 },
    { name: "Nitrogen / Zinc Soil Deficit", crop: "General", percentage: 7, count: 310 },
  ];

  return (
    <div className="space-y-8">
      {/* Enterprise Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-950/80 px-3 py-1 text-xs font-bold text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 mb-2">
            <Building2 className="size-3.5" />
            <span>Cooperative Organization Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight">
            {enterpriseName}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Aggregate smallholder monitoring, shared token bank, and field agent performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/members"
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold shadow-xs transition"
          >
            <Plus className="size-3.5" />
            <span>Add Member / Agent</span>
          </Link>
          <Link
            href="/dashboard/tokens"
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 px-4 py-2 text-xs font-bold shadow-xs transition"
          >
            <Coins className="size-3.5 text-blue-500" />
            <span>Refill Tokens</span>
          </Link>
        </div>
      </div>

      {/* 4 Macro KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/60 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Registered Farmers</span>
            <Users2 className="size-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-stone-900 dark:text-white">
            {totalMembersCount.toLocaleString()}
          </p>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
            Across 14 village clusters in Kano
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/60 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Field Extension Agents</span>
            <User className="size-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-black text-stone-900 dark:text-white">{activeAgentsCount}</p>
          <p className="text-[11px] text-stone-500 dark:text-stone-400">Equipped with Zora mobile scout</p>
        </div>

        <div className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/60 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Queries Handled (30d)</span>
            <Sparkles className="size-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-stone-900 dark:text-white">
            {monthlyInquiries.toLocaleString()}
          </p>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
            <TrendingUp className="size-3" />
            <span>+24.6% vs last month</span>
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/60 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Token Bank Balance</span>
            <Coins className="size-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-stone-900 dark:text-white">
            {tokensRemaining.toLocaleString()}
          </p>
          <div className="w-full bg-stone-100 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full"
              style={{ width: `${(tokensRemaining / totalTokens) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Two Column Grid: Top Disease Trends & Live Cooperative Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Disease Trends in Cooperative (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/60 p-6 space-y-5 shadow-xs">
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-white">
              Disease & Pest Hotspots
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Aggregated from member farmer voice questions this month
            </p>
          </div>

          <div className="space-y-4">
            {topDiseases.map((d) => (
              <div key={d.name} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-stone-800 dark:text-stone-200 truncate max-w-[240px]">
                    {d.name}
                  </span>
                  <span className="text-[11px] font-bold text-stone-600 dark:text-stone-400">
                    {d.count} inquiries ({d.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${d.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/20 p-4 text-xs text-emerald-900 dark:text-emerald-300">
            <p className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="size-3.5 text-amber-500" />
              <span>Fall Armyworm Advisory Alert</span>
            </p>
            <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
              High density reported in Bichi & Gwarzo clusters. Consider dispatching communal neem extract spray teams.
            </p>
          </div>
        </div>

        {/* Right: Member Field Team Roster Snippet (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/60 p-6 space-y-5 shadow-xs">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-white">
                Cooperative Extension Team
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Active extension officers and farmer leaders
              </p>
            </div>
            <Link
              href="/dashboard/members"
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Manage All Members →
            </Link>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 text-stone-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Cluster</th>
                  <th className="py-3 px-4">Queries (30d)</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                {members.slice(0, 5).map((m) => (
                  <tr key={m.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/40 transition">
                    <td className="py-3 px-4 font-semibold text-stone-900 dark:text-white">
                      {m.fullName}
                      <span className="block text-[10px] text-stone-400 font-normal">{m.phone}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60">
                        {m.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-stone-600 dark:text-stone-400">{m.cluster}</td>
                    <td className="py-3 px-4 font-mono font-medium">{m.queriesUsed}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        <span>{m.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
