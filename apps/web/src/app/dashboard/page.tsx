'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Terminal,
  Activity,
  ShieldCheck,
  MapPinned,
  RadioTower,
  ArrowRight,
  TrendingUp,
  CloudRain,
  Cpu,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@ccsa-zora/ui/components/card';
import { Badge } from '@ccsa-zora/ui/components/badge';
import { Button } from '@ccsa-zora/ui/components/button';
import { FarmPulseChart } from '@/features/dashboard/farm-pulse-chart';

const recentInferences = [
  {
    id: 'inf-901',
    crop: 'Maize',
    location: 'Zaria Cluster, Kaduna',
    symptoms: 'Yellowing leaf margins, nitrogen deficit',
    language: 'Hausa (ha)',
    confidence: '94.2%',
    status: 'Verified',
    time: '4 mins ago',
  },
  {
    id: 'inf-902',
    crop: 'Rice',
    location: 'Makurdi Riverine, Benue',
    symptoms: 'Bacterial leaf blight, high humidity',
    language: 'English (en)',
    confidence: '91.8%',
    status: 'Verified',
    time: '18 mins ago',
  },
  {
    id: 'inf-903',
    crop: 'Cassava',
    location: 'Iseyin Basin, Oyo',
    symptoms: 'Cassava Mosaic Virus early spotting',
    language: 'Yorùbá (yo)',
    confidence: '88.5%',
    status: 'Verified',
    time: '42 mins ago',
  },
  {
    id: 'inf-904',
    crop: 'Sorghum',
    location: 'Bichi LGA, Kano',
    symptoms: 'Stem borer infestation risk',
    language: 'Hausa (ha)',
    confidence: '95.0%',
    status: 'Verified',
    time: '1 hr ago',
  },
];

export default function DashboardOverviewPage() {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-2 border-b border-emerald-950/60">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
            Command Centre Overview
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time inference telemetry, climate risk monitoring, and institutional agricultural intelligence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl shadow-xs">
            <Link href="/dashboard/playground">
              <Terminal className="size-3.5 mr-1.5" />
              Open AI Playground
            </Link>
          </Button>
          <Button asChild variant="outline" className="text-xs h-9 border-slate-800 bg-slate-900 text-slate-300 hover:text-white rounded-xl">
            <Link href="/dashboard/fields">
              <MapPinned className="size-3.5 mr-1.5" />
              Explore Fields
            </Link>
          </Button>
        </div>
      </div>

      {/* 4 Top Executive AIaaS KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="p-5 rounded-2xl bg-[#0A1624] border border-emerald-950/80 space-y-2 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">24h Inferences</span>
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">14,820</span>
            <span className="text-xs font-semibold text-emerald-400">+18.4%</span>
          </div>
          <p className="text-[11px] text-slate-500">₦444,600 metered quota value</p>
        </div>

        {/* KPI 2 */}
        <div className="p-5 rounded-2xl bg-[#0A1624] border border-emerald-950/80 space-y-2 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Monitored Acreage</span>
            <MapPinned className="size-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">1,840.6</span>
            <span className="text-xs font-medium text-slate-400">Hectares</span>
          </div>
          <p className="text-[11px] text-slate-500">Across 36 demarcated LGA clusters</p>
        </div>

        {/* KPI 3 */}
        <div className="p-5 rounded-2xl bg-[#0A1624] border border-emerald-950/80 space-y-2 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Agro-Climate Risk</span>
            <CloudRain className="size-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-emerald-400">Optimal Window</span>
          </div>
          <p className="text-[11px] text-slate-500">Open-Meteo live: 29.4°C • 62% RH</p>
        </div>

        {/* KPI 4 */}
        <div className="p-5 rounded-2xl bg-[#0A1624] border border-emerald-950/80 space-y-2 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">MRV Assurance</span>
            <ShieldCheck className="size-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">100%</span>
            <span className="text-xs font-semibold text-emerald-400">Tamper-Proof</span>
          </div>
          <p className="text-[11px] text-slate-500">SHA-256 Merkle root verification active</p>
        </div>
      </div>

      {/* Main Grid: Telemetry Chart & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Farm Pulse Telemetry Graph */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#0A1624] border border-emerald-950/80 space-y-4 shadow-xs">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-white">Farm Pulse Telemetry & Soil Moisture</h3>
              <p className="text-[11px] text-slate-400">Volumetric Water Content vs. Vegetation Health (NDVI)</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
              Real-time Feed
            </span>
          </div>
          <div className="h-64 w-full">
            <FarmPulseChart />
          </div>
        </div>

        {/* AI & Infrastructure Health */}
        <div className="p-5 rounded-2xl bg-[#0A1624] border border-emerald-950/80 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-white">Intelligence Service Infrastructure</h3>
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-200">KGML-Ag Inference Engine</span>
                <span className="text-[10px] font-bold text-emerald-400 uppercase">Port 8100 Online</span>
              </div>
              <p className="text-[10px] text-slate-400">FastAPI microservice • 11/11 tests passing • 118ms latency</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-200">Open-Meteo Agro-Climate</span>
                <span className="text-[10px] font-bold text-emerald-400 uppercase">Live Connected</span>
              </div>
              <p className="text-[10px] text-slate-400">Direct spatial satellite telemetry without API key limits</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-200">PostGIS Geospatial Engine</span>
                <span className="text-[10px] font-bold text-emerald-400 uppercase">Active</span>
              </div>
              <p className="text-[10px] text-slate-400">Polygon boundaries demarcated across 36 Nigerian states</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-200">5 Localized Languages</span>
                <span className="text-[10px] font-bold text-emerald-400 uppercase">Ready</span>
              </div>
              <p className="text-[10px] text-slate-400">English, Hausa, Yorùbá, Igbo, Nigerian Pidgin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Diagnostic Inferences Table */}
      <div className="p-5 rounded-2xl bg-[#0A1624] border border-emerald-950/80 space-y-4 shadow-xs">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-white">Live Diagnostic Inferences</h3>
            <p className="text-[11px] text-slate-400">Real-time agronomic query processing from web & mobile agents</p>
          </div>
          <Button asChild size="sm" variant="ghost" className="text-xs text-emerald-400 hover:text-emerald-300">
            <Link href="/dashboard/playground">
              Run New Query <ArrowRight className="size-3.5 ml-1" />
            </Link>
          </Button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#070F18]">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="p-3">Query ID</th>
                <th className="p-3">Crop</th>
                <th className="p-3">Location</th>
                <th className="p-3">Symptoms / Diagnosis</th>
                <th className="p-3">Language</th>
                <th className="p-3">Confidence</th>
                <th className="p-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {recentInferences.map((inf) => (
                <tr key={inf.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-3 font-mono font-medium text-emerald-400">{inf.id}</td>
                  <td className="p-3 font-bold text-white">{inf.crop}</td>
                  <td className="p-3 text-slate-300">{inf.location}</td>
                  <td className="p-3 text-slate-400">{inf.symptoms}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-200">
                      {inf.language}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {inf.confidence}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500 font-mono text-[11px]">{inf.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
