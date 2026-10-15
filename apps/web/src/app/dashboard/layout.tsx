"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Sparkles,
  MessageSquare,
  History,
  Sprout,
  Zap,
  LayoutDashboard,
  Users2,
  Coins,
  KeyRound,
  LogOut,
  ChevronRight,
  ShieldCheck,
  User,
  Building2,
  Menu,
  X,
} from "lucide-react";

import { getSupabaseBrowserClient } from "@/lib/supabase";
import { useWorkspace } from "@/context/workspace-context";
import { WorkspaceSwitcher } from "@/components/dashboard/workspace-switcher";
import { ThemeToggle } from "@/components/theme-toggle";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    mode,
    enterpriseName,
    personalQueriesUsed,
    personalWeeklyQuota,
    tokensUsed,
    totalTokens,
  } = useWorkspace();

  const [userName, setUserName] = useState<string>("Extension Lead");
  const [userOrg, setUserOrg] = useState<string>("Cosmopolitan University Abuja");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

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
  }, []);

  async function handleSignOut() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("zora_user");
    }
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        // ignore network error
      }
    }
    router.replace("/login");
  }

  // Navigation items dynamically adapted to Workspace Mode
  const personalNav = [
    {
      group: "Zora Assistant",
      items: [
        {
          name: "Ask Zora",
          href: "/dashboard",
          icon: Sparkles,
          description: "Voice & chat agricultural intelligence",
        },
        {
          name: "Saved Consultations",
          href: "/dashboard/history",
          icon: History,
          description: "Past farm diagnoses & treatments",
        },
      ],
    },
    {
      group: "My Farm Context",
      items: [
        {
          name: "My Farm & Crops",
          href: "/dashboard/farm",
          icon: Sprout,
          description: "Saved crops & local savanna climate",
        },
        {
          name: "Usage & Tokens",
          href: "/dashboard/usage",
          icon: Zap,
          description: "Weekly voice query quota & tiers",
        },
      ],
    },
  ];

  const enterpriseNav = [
    {
      group: "Cooperative Governance",
      items: [
        {
          name: "Cooperative Overview",
          href: "/dashboard",
          icon: LayoutDashboard,
          description: "Summary, trends & disease hotspots",
        },
        {
          name: "Farmers & Agents",
          href: "/dashboard/members",
          icon: Users2,
          description: "Member roster, invites & permissions",
        },
      ],
    },
    {
      group: "AIaaS Operations",
      items: [
        {
          name: "Token Bank & Quotas",
          href: "/dashboard/tokens",
          icon: Coins,
          description: "Shared token balance & member caps",
        },
        {
          name: "API & Integrations",
          href: "/dashboard/api-keys",
          icon: KeyRound,
          description: "API tokens for WhatsApp, SMS & apps",
        },
        {
          name: "Test Zora Assistant",
          href: "/dashboard/playground",
          icon: Sparkles,
          description: "Agronomist testing playground",
        },
      ],
    },
  ];

  const currentNav = mode === "personal" ? personalNav : enterpriseNav;

  const activePageTitle =
    currentNav
      .flatMap((g) => g.items)
      .find((i) => i.href === pathname)?.name ||
    (pathname === "/dashboard"
      ? mode === "personal"
        ? "Ask Zora"
        : "Cooperative Overview"
      : "Dashboard");

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex overflow-hidden font-sans antialiased transition-colors">
      {/* 1. Desktop Dark Stone Sidebar */}
      <aside className="w-64 shrink-0 bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 flex flex-col justify-between hidden md:flex select-none">
        <div className="flex flex-col">
          {/* Brand Header */}
          <div className="p-4 border-b border-stone-200 dark:border-stone-800">
            <Link href="/" className="flex items-center gap-2.5 group">
              <Image
                src="/ccsa-logo.png"
                alt="CCSA - Cosmopolitan University"
                width={84}
                height={28}
                className="h-7 w-auto object-contain transition-transform group-hover:scale-[1.02]"
              />
              <span className="h-4 w-px bg-stone-300 dark:bg-stone-700" />
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

          {/* Workspace Switcher in Sidebar */}
          <div className="p-3 border-b border-stone-100 dark:border-stone-800/80">
            <WorkspaceSwitcher className="w-full" />
          </div>

          {/* Navigation Groups */}
          <div className="px-3 py-4 space-y-6 overflow-y-auto max-h-[calc(100vh-250px)]">
            {currentNav.map((group) => (
              <div key={group.group} className="space-y-1">
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-2">
                  {group.group}
                </p>
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? mode === "personal"
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-xs"
                            : "bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 shadow-xs"
                          : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800/60"
                      }`}
                    >
                      <Icon
                        className={`size-4 shrink-0 ${
                          isActive
                            ? mode === "personal"
                              ? "text-emerald-700 dark:text-emerald-400"
                              : "text-blue-600 dark:text-blue-400"
                            : "text-stone-400"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="leading-tight truncate">{item.name}</p>
                        <p className="text-[10px] font-normal text-stone-400 dark:text-stone-500 truncate">
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

        {/* User Account & Usage Footer */}
        <div className="p-3 border-t border-stone-200 dark:border-stone-800 space-y-2">
          {/* Mode-specific Quota / Token Bar */}
          {mode === "personal" ? (
            <Link
              href="/dashboard/usage"
              className="px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 flex flex-col gap-1.5 text-xs hover:border-emerald-600/40 transition group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
                  <Zap className="size-3 text-amber-500" />
                  <span>Weekly Quota</span>
                </span>
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                  {personalWeeklyQuota - personalQueriesUsed} left
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                  style={{
                    width: `${((personalWeeklyQuota - personalQueriesUsed) / personalWeeklyQuota) * 100}%`,
                  }}
                />
              </div>
            </Link>
          ) : (
            <Link
              href="/dashboard/tokens"
              className="px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 flex flex-col gap-1.5 text-xs hover:border-blue-600/40 transition group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
                  <Coins className="size-3 text-blue-500" />
                  <span>Token Bank</span>
                </span>
                <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400">
                  {(totalTokens - tokensUsed).toLocaleString()} tokens
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{
                    width: `${((totalTokens - tokensUsed) / totalTokens) * 100}%`,
                  }}
                />
              </div>
            </Link>
          )}

          {/* User Card */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-stone-50 dark:bg-stone-950/80 border border-stone-200 dark:border-stone-800/80">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`size-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 uppercase ${
                  mode === "personal" ? "bg-emerald-700" : "bg-blue-700"
                }`}
              >
                {userName.charAt(0) || "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate">
                  {userName}
                </p>
                <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                  {mode === "personal" ? "Personal Account" : enterpriseName}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              title="Sign Out"
              className="p-1.5 text-stone-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors shrink-0 cursor-pointer"
            >
              <LogOut className="size-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Main Workspace Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header & Breadcrumbs Toolbar */}
        <header className="h-16 border-b border-stone-200 dark:border-stone-800 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden flex size-9 items-center justify-center rounded-xl border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
              aria-label="Open sidebar menu"
            >
              <Menu className="size-4" />
            </button>

            {/* Breadcrumb Info */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-stone-400 dark:text-stone-500 hidden sm:inline">
                {mode === "personal" ? "Personal Workspace" : enterpriseName}
              </span>
              <ChevronRight className="size-3.5 text-stone-400 hidden sm:inline" />
              <span
                className={`font-bold ${
                  mode === "personal"
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-blue-700 dark:text-blue-400"
                }`}
              >
                {activePageTitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Header Workspace Switcher */}
            <WorkspaceSwitcher />

            <ThemeToggle />

            {/* Exit to Landing */}
            <Link
              href="/"
              className="hidden lg:inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-emerald-700 dark:hover:text-emerald-400 px-2 py-1 transition"
            >
              <span>Public Portal</span>
            </Link>
          </div>
        </header>

        {/* Dynamic Nested Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 flex-1">
          {children}
        </main>
      </div>

      {/* 3. Mobile Sidebar Drawer Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />

          {/* Drawer */}
          <div className="relative w-72 max-w-[80vw] bg-white dark:bg-stone-900 h-full border-r border-stone-200 dark:border-stone-800 flex flex-col justify-between p-4 shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                <Link href="/" className="flex items-center gap-2">
                  <Image
                    src="/ccsa-logo.png"
                    alt="CCSA"
                    width={72}
                    height={24}
                    className="h-6 w-auto object-contain"
                  />
                  <span className="h-3.5 w-px bg-stone-300 dark:bg-stone-700" />
                  <div className="h-6 w-[64px] bg-white rounded flex items-center justify-center">
                    <Image
                      src="/brand/zora-wordmark.jpeg"
                      alt="Zora"
                      width={80}
                      height={32}
                      className="h-full w-auto object-contain"
                    />
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="flex size-7 items-center justify-center rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-white"
                >
                  <X className="size-4" />
                </button>
              </div>

              <WorkspaceSwitcher className="w-full" />

              <nav className="space-y-4 overflow-y-auto max-h-[60vh]">
                {currentNav.map((group) => (
                  <div key={group.group} className="space-y-1">
                    <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      {group.group}
                    </p>
                    {group.items.map((item) => {
                      const isActive = pathname === item.href;
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                            isActive
                              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                              : "text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                          }`}
                        >
                          <Icon className="size-4 shrink-0" />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </nav>
            </div>

            <div className="pt-3 border-t border-stone-200 dark:border-stone-800">
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
              >
                <LogOut className="size-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
