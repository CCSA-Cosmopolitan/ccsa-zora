"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  BrainCircuit,
  CloudRain,
  Download,
  FileCheck2,
  Globe2,
  LogOut,
  MapPinned,
  MessageCircleMore,
  RadioTower,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Badge } from "@ccsa-zora/ui/components/badge";
import { Button } from "@ccsa-zora/ui/components/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useDashboard } from "@/hooks/use-dashboard";

const navigation = [
  { name: "OVERVIEW", href: "/dashboard", icon: Sparkles },
  { name: "ASK ZORA AI", href: "/dashboard/assistant", icon: MessageCircleMore },
  { name: "FARM MAPS", href: "/dashboard/fields", icon: MapPinned },
  { name: "CLIMATE WATCH", href: "/dashboard/climate", icon: CloudRain },
  { name: "KGML SCIENCE", href: "/dashboard/knowledge", icon: BrainCircuit },
  { name: "MRV AUDIT", href: "/dashboard/mrv", icon: FileCheck2 },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const dashboard = useDashboard();

  return (
    <div className="flex h-screen bg-slate-50 text-neutral-900 dark:bg-[#08090a] dark:text-stone-100 font-sans antialiased overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-200 transition-colors duration-200">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-neutral-200 bg-white dark:border-neutral-800/80 dark:bg-[#0a0b0d] flex flex-col justify-between flex-shrink-0 z-30 font-mono transition-colors duration-200">
        <div>
          {/* Brand Header with Zora Wordmark Logo */}
          <div className="p-5 border-b border-neutral-200 dark:border-neutral-800/80 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative h-9 w-36 overflow-hidden rounded border border-neutral-200 dark:border-neutral-800 bg-white p-1 shadow-sm transition-transform group-hover:scale-105">
                <Image
                  src="/brand/zora-wordmark.jpeg"
                  alt="Zora Wordmark Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <div className="px-3 py-2 text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">
              NAVIGATION MATRIX
            </div>
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-none text-xs tracking-wider transition-all border ${
                    isActive
                      ? "bg-black text-white font-bold border-black dark:bg-white dark:text-black dark:border-white shadow-sm"
                      : "bg-transparent text-neutral-600 dark:text-neutral-400 border-transparent hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-white dark:text-black" : "text-neutral-500"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / Tenant Details */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800/80 space-y-3 bg-neutral-50 dark:bg-[#08090a]">
          <div className="p-3 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 flex items-center gap-3">
            <div className="h-7 w-7 bg-neutral-900 text-white dark:bg-neutral-800 dark:text-emerald-400 font-bold text-xs flex items-center justify-center border border-neutral-700">
              CU
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-black dark:text-white truncate">Abuja Tenant</span>
              <span className="text-[9px] text-neutral-500 dark:text-neutral-400">ID: #CCSA-001</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <Link
              href="/"
              className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors text-[10px] uppercase tracking-wider"
            >
              <ArrowLeft className="h-3 w-3" /> Public Site
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-colors text-[10px] uppercase tracking-wider"
            >
              <LogOut className="h-3 w-3" /> Sign Out
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Container Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Dashboard Top Navigation Bar */}
        <header className="h-16 border-b border-neutral-200 bg-white/90 dark:border-neutral-800/80 dark:bg-[#0a0b0d]/90 backdrop-blur-md px-6 flex items-center justify-between flex-shrink-0 z-20 font-mono transition-colors duration-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 text-xs uppercase tracking-wider">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>KGML-AG ENGINE ONLINE</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={() => dashboard.refetch()}
              className="border-neutral-300 dark:border-neutral-800 bg-transparent text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-xs h-9 rounded-none uppercase font-mono tracking-wider"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${dashboard.isFetching ? "animate-spin text-emerald-500" : ""}`} />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (dashboard.data) {
                  const blob = new Blob([JSON.stringify(dashboard.data.mrv, null, 2)], {
                    type: "application/json",
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "zora-mrv-certificate.json";
                  a.click();
                }
              }}
              className="border border-neutral-700 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-mono text-xs uppercase tracking-wider font-bold h-9 px-4 rounded-none"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" /> Export MRV Certificate
            </Button>
          </div>
        </header>

        {/* Dashboard Page Body */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
