"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BrainCircuit,
  CloudRain,
  FileCheck2,
  Leaf,
  MapPinned,
  MessageCircleMore,
  RadioTower,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Button } from "@ccsa-zora/ui/components/button";
import { FarmPulseChart } from "@/features/dashboard/farm-pulse-chart";
import { useDashboard } from "@/hooks/use-dashboard";

export default function DashboardOverviewPage() {
  const dashboard = useDashboard();

  if (dashboard.isLoading) {
    return (
      <div className="flex h-96 items-center justify-center font-mono text-xs uppercase tracking-wider text-neutral-500">
        INITIALIZING SYSTEM METRICS…
      </div>
    );
  }

  if (dashboard.isError || !dashboard.data) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 text-center">
        <p className="font-mono text-xs text-red-500">
          {dashboard.error?.message ?? "Zora intelligence service unavailable."}
        </p>
        <Button size="sm" onClick={() => dashboard.refetch()} className="border border-neutral-300 dark:border-neutral-800 bg-black text-white dark:bg-white dark:text-black font-mono text-xs uppercase rounded-none">
          Retry Connection
        </Button>
      </div>
    );
  }

  const data = dashboard.data;

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-mono">
      {/* Header Summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-1">
            [ COMMAND CENTRE OVERVIEW ]
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight flex items-center gap-2">
            Field Intelligence Summary
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/assistant">
            <Button size="sm" className="border border-neutral-700 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-mono text-xs uppercase tracking-wider font-bold h-9 px-4 rounded-none">
              <MessageCircleMore className="h-4 w-4 mr-1.5" /> Ask Zora AI
            </Button>
          </Link>
          <Link href="/dashboard/fields">
            <Button size="sm" variant="outline" className="border-neutral-300 dark:border-neutral-800 bg-transparent text-neutral-800 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 font-mono text-xs uppercase tracking-wider h-9 px-4 rounded-none">
              <MapPinned className="h-4 w-4 mr-1.5" /> Farm Maps
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0d0e10] p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500 text-[10px] uppercase tracking-widest">
            <span>REGISTERED FIELDS</span>
            <MapPinned className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-4xl font-black text-neutral-900 dark:text-white">{data.fields.length}</p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-bold">POSTGIS POLYGONS OK</p>
        </div>

        <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0d0e10] p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500 text-[10px] uppercase tracking-widest">
            <span>VERIFIED REMOVALS</span>
            <Leaf className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          </div>
          <p className="text-4xl font-black text-neutral-900 dark:text-white">{data.metrics.verifiedRemovalsTco2e} <span className="text-sm font-normal text-neutral-500">tCO₂e</span></p>
          <p className="text-[10px] text-teal-600 dark:text-teal-400 uppercase tracking-wider font-bold">SOIL CARBON AUDITED</p>
        </div>

        <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0d0e10] p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500 text-[10px] uppercase tracking-widest">
            <span>LPWAN NODES</span>
            <RadioTower className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <p className="text-4xl font-black text-neutral-900 dark:text-white">{data.sensors.reporting} / {data.sensors.total}</p>
          <p className="text-[10px] text-cyan-600 dark:text-cyan-400 uppercase tracking-wider font-bold">{data.metrics.sensorAvailabilityPercent}% AVAILABILITY RATE</p>
        </div>

        <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0d0e10] p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500 text-[10px] uppercase tracking-widest">
            <span>AUDIT RECORDS</span>
            <ShieldCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-4xl font-black text-neutral-900 dark:text-white">{data.metrics.signedRecordCount}</p>
          <p className="text-[10px] text-purple-600 dark:text-purple-400 uppercase tracking-wider font-bold">SHA-256 HASH SIGNED</p>
        </div>
      </div>

      {/* Main Charts & Quick Links Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0d0e10] p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Farm Vitality & NDVI Telemetry
                </h3>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Vegetation index trends and volumetric moisture curves.
                </p>
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 px-2 py-0.5 uppercase font-bold">
                REALTIME STREAM
              </span>
            </div>
            <div className="pt-2">
              <FarmPulseChart />
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0d0e10] p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-widest border-b border-neutral-200 dark:border-neutral-800 pb-3">
              QUICK MATRIX ACCESS
            </h3>

            <div className="space-y-2.5 font-sans">
              <Link href="/dashboard/assistant">
                <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <MessageCircleMore className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300">Ask Zora AI</span>
                      <span className="text-[10px] text-neutral-500 font-mono">Multilingual Voice</span>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-neutral-500 group-hover:text-black dark:group-hover:text-white" />
                </div>
              </Link>

              <Link href="/dashboard/fields">
                <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <MapPinned className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300">Farm Intelligence Map</span>
                      <span className="text-[10px] text-neutral-500 font-mono">PostGIS Polygons</span>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-neutral-500 group-hover:text-black dark:group-hover:text-white" />
                </div>
              </Link>

              <Link href="/dashboard/knowledge">
                <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <BrainCircuit className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300">KGML Science</span>
                      <span className="text-[10px] text-neutral-500 font-mono">Soil Carbon Traces</span>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-neutral-500 group-hover:text-black dark:group-hover:text-white" />
                </div>
              </Link>

              <Link href="/dashboard/mrv">
                <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <FileCheck2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-300">MRV Audit Vault</span>
                      <span className="text-[10px] text-neutral-500 font-mono">SHA-256 Event Chain</span>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-neutral-500 group-hover:text-black dark:group-hover:text-white" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
