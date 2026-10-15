"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Sparkles,
  BookOpen,
  Info,
  Mail,
  ExternalLink,
  LogIn,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";

const GITHUB_URL = "https://github.com/CCSA-Cosmopolitan/ccsa-zora";

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile modal on route change or ESC key
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    }
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: "About Us", href: "/about", icon: Info },
    { label: "Docs", href: "/docs", icon: BookOpen },
    { label: "Contact", href: "/contact", icon: Mail },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-stone-200/80 dark:border-stone-800/80 bg-white/90 dark:bg-stone-950/90 backdrop-blur-md transition-colors">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Left: CCSA Logo | Zora Wordmark */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/ccsa-logo.png"
              alt="CCSA - Cosmopolitan University"
              width={96}
              height={32}
              className="h-8 w-auto object-contain transition-transform group-hover:scale-[1.02]"
              priority
            />
            <span className="h-5 w-px bg-stone-300 dark:bg-stone-700" />
            <div className="relative h-8 w-[88px] overflow-hidden rounded-lg bg-white px-1.5 py-0.5 flex items-center justify-center shadow-2xs transition-transform group-hover:scale-[1.02]">
              <Image
                src="/brand/zora-wordmark.jpeg"
                alt="Zora"
                width={120}
                height={48}
                className="h-full w-auto object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2 text-sm font-medium text-stone-600 dark:text-stone-300">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2 transition-colors ${
                    isActive
                      ? "bg-emerald-50 dark:bg-stone-900 text-emerald-800 dark:text-emerald-400 font-semibold"
                      : "hover:text-emerald-800 dark:hover:text-emerald-400 hover:bg-stone-100 dark:hover:bg-stone-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg px-3 py-2 transition-colors hover:text-emerald-800 dark:hover:text-emerald-400 hover:bg-stone-100 dark:hover:bg-stone-900 inline-flex items-center gap-1"
            >
              <span>GitHub</span>
              <ExternalLink className="size-3 text-stone-400" />
            </a>
          </nav>

          {/* Desktop Right Actions: ThemeToggle + Talk CTA + Staff Sign In */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-emerald-800 dark:hover:text-emerald-400 px-2 py-1.5 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/#talk"
              className="rounded-full bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-xs transition-transform active:scale-95 inline-flex items-center gap-1.5"
            >
              <Sparkles className="size-3.5" />
              <span>Talk to Zora</span>
            </Link>
          </div>

          {/* Mobile Right Controls: ThemeToggle + Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="flex size-9 items-center justify-center rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-200 shadow-xs hover:border-emerald-600/40 active:scale-95 transition"
            >
              <Menu className="size-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Modal with Transition & Backdrop Blur Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:hidden">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div
            className="relative w-full max-w-sm rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-6 shadow-2xl transition-all duration-300 animate-in zoom-in-95 slide-in-from-top-4 text-stone-900 dark:text-stone-100 z-10"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800/80 pb-4">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5"
              >
                <Image
                  src="/ccsa-logo.png"
                  alt="CCSA - Cosmopolitan University"
                  width={84}
                  height={28}
                  className="h-7 w-auto object-contain"
                />
                <span className="h-4 w-px bg-stone-300 dark:bg-stone-700" />
                <div className="relative h-7 w-[76px] overflow-hidden rounded-md bg-white px-1 py-0.5 flex items-center justify-center shadow-2xs">
                  <Image
                    src="/brand/zora-wordmark.jpeg"
                    alt="Zora"
                    width={100}
                    height={40}
                    className="h-full w-auto object-contain"
                  />
                </div>
              </Link>

              <div className="flex items-center gap-1.5">
                <ThemeToggle />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex size-8 items-center justify-center rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-900 transition"
                  aria-label="Close menu"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Navigation Matrix List */}
            <nav className="mt-4 space-y-1.5">
              <Link
                href="/"
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-stone-100 dark:hover:bg-stone-900 transition"
              >
                <span>Home</span>
                <span className="text-xs text-stone-400">Overview</span>
              </Link>

              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                      isActive
                        ? "bg-emerald-50 dark:bg-stone-900 text-emerald-800 dark:text-emerald-400 font-semibold"
                        : "hover:bg-stone-100 dark:hover:bg-stone-900 text-stone-700 dark:text-stone-200"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="size-4 text-emerald-700 dark:text-emerald-400" />
                      <span>{item.label}</span>
                    </div>
                    <ArrowRight className="size-3.5 text-stone-400" />
                  </Link>
                );
              })}

              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-900 transition"
              >
                <div className="flex items-center gap-2.5">
                  <ExternalLink className="size-4 text-stone-400" />
                  <span>GitHub Repository</span>
                </div>
                <ArrowRight className="size-3.5 text-stone-400" />
              </a>

              <Link
                href="/login"
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-900 transition border-t border-stone-100 dark:border-stone-800/80 pt-3"
              >
                <div className="flex items-center gap-2.5">
                  <LogIn className="size-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Staff / Researcher Login</span>
                </div>
                <ArrowRight className="size-3.5 text-stone-400" />
              </Link>
            </nav>

            {/* Action CTA Button */}
            <div className="mt-6 pt-2">
              <Link
                href="/#talk"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 py-3 text-sm font-bold text-white shadow-xs transition"
              >
                <Sparkles className="size-4" />
                <span>Talk to Zora Voice Helper</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
