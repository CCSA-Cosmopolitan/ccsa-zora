'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sparkles,
  Terminal,
  MapPinned,
  RadioTower,
  BrainCircuit,
  FileCheck2,
  LogOut,
  Activity,
  Layers,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase';

const navigationItems = [
  {
    group: 'AI & Intelligence',
    items: [
      {
        name: 'Command Centre',
        href: '/dashboard',
        icon: Sparkles,
        description: 'System overview & throughput',
      },
      {
        name: 'Diagnostic Playground',
        href: '/dashboard/playground',
        icon: Terminal,
        description: 'Multi-lingual agronomic console',
      },
      {
        name: 'Model Registry',
        href: '/dashboard/models',
        icon: BrainCircuit,
        description: 'KGML-Ag & ViT model specs',
      },
    ],
  },
  {
    group: 'Operations & Verification',
    items: [
      {
        name: 'Geospatial Fields',
        href: '/dashboard/fields',
        icon: MapPinned,
        description: 'PostGIS boundary telemetry',
      },
      {
        name: 'IoT & Climate Stations',
        href: '/dashboard/sensors',
        icon: RadioTower,
        description: 'Soil moisture & Open-Meteo',
      },
      {
        name: 'Digital MRV & Carbon',
        href: '/dashboard/mrv',
        icon: FileCheck2,
        description: 'Cryptographic practice proofs',
      },
    ],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState<string>("Extension Lead");
  const [userOrg, setUserOrg] = useState<string>("Cosmopolitan Abuja");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("zora_user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.full_name) setUserName(parsed.full_name);
          if (parsed.organization) setUserOrg(parsed.organization);
        } catch {}
      }
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        const metadata = data.user.user_metadata || {};
        if (metadata.full_name) {
          setUserName(metadata.full_name);
        } else if (data.user.email) {
          setUserName(data.user.email.split("@")[0] || "User");
        }
        if (metadata.organization) {
          setUserOrg(metadata.organization);
        }
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const metadata = session.user.user_metadata || {};
        if (metadata.full_name) {
          setUserName(metadata.full_name);
        } else if (session.user.email) {
          setUserName(session.user.email.split("@")[0] || "User");
        }
        if (metadata.organization) {
          setUserOrg(metadata.organization);
        }
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        // ignore network error on signout
      }
    }
    router.replace('/login');
  }

  return (
    <div className="min-h-screen bg-[#07131D] text-slate-100 flex overflow-hidden font-sans antialiased">
      {/* 1. AIaaS Dark Enterprise Sidebar */}
      <aside className="w-64 shrink-0 bg-[#0A1926] border-r border-emerald-950/80 flex flex-col justify-between hidden md:flex select-none">
        <div className="flex flex-col">
          {/* Brand Header */}
          <div className="p-4 border-b border-emerald-950/80">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <Image
                src="/ccsa-logo.png"
                alt="CCSA - Cosmopolitan University"
                width={84}
                height={28}
                className="h-7 w-auto object-contain transition-transform group-hover:scale-[1.02]"
              />
              <span className="h-4 w-px bg-slate-700" />
              <div className="relative h-7 w-[76px] overflow-hidden rounded-md bg-white px-1 py-0.5 flex items-center justify-center shadow-2xs transition-transform group-hover:scale-[1.02]">
                <Image
                  src="/brand/zora-wordmark.jpeg"
                  alt="Zora"
                  width={100}
                  height={40}
                  className="h-full w-auto object-contain"
                />
              </div>
            </Link>
          </div>

          {/* Navigation Groups */}
          <div className="px-3 py-4 space-y-6 overflow-y-auto">
            {navigationItems.map((group) => (
              <div key={group.group} className="space-y-1">
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  {group.group}
                </p>
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-500/40 shadow-xs'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                      }`}
                    >
                      <Icon
                        className={`size-4 shrink-0 ${
                          isActive ? 'text-emerald-400' : 'text-slate-500'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="leading-tight truncate">{item.name}</p>
                        <p className="text-[10px] font-normal text-slate-500 truncate">
                          {item.description}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* User Account / Service Health Footer */}
        <div className="p-3 border-t border-emerald-950/80 space-y-2">
          {/* Health Indicator */}
          <div className="px-3 py-2 rounded-xl bg-slate-900/60 border border-emerald-900/40 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-300 font-mono text-[10px]">kgml-api :8100</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase">Online</span>
          </div>

          {/* User Card */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <div className="flex items-center gap-2 min-w-0">
              <div className="size-7 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center text-xs font-bold text-emerald-300 shrink-0 uppercase">
                {userName.charAt(0) || 'Z'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-200 truncate">{userName}</p>
                <p className="text-[10px] text-slate-500 truncate">{userOrg}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800/60 rounded-lg transition-colors shrink-0 cursor-pointer"
            >
              <LogOut className="size-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Main Workspace Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header & Breadcrumbs Toolbar */}
        <header className="h-14 border-b border-emerald-950/80 bg-[#0A1926]/90 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 text-xs">
            <Link href="/dashboard" className="text-slate-400 hover:text-slate-200 transition-colors">
              Zora AIaaS
            </Link>
            <ChevronRight className="size-3.5 text-slate-600" />
            <span className="font-semibold text-emerald-400">
              {navigationItems
                .flatMap((g) => g.items)
                .find((i) => i.href === pathname)?.name || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
              <Activity className="size-3 text-emerald-500" />
              <span>KGML-Ag v1.2 Active</span>
            </div>

            <Link
              href="http://localhost:3000/portal/dashboard"
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors px-2 py-1"
            >
              <Building2 className="size-3.5 text-blue-400" />
              <span className="hidden sm:inline">FIMS Registry</span>
              <ExternalLink className="size-3" />
            </Link>
          </div>
        </header>

        {/* Dynamic Nested Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
