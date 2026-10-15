"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";

import { getSupabaseBrowserClient } from "@/lib/supabase";
import { ThemeToggle } from "@/components/theme-toggle";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentSuccess, setSentSuccess] = useState(false);

  async function handleResetRequest(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Authentication client is not configured.");
      setSubmitting(false);
      return;
    }

    try {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback?type=recovery`
          : undefined;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      });

      if (resetError) {
        setError(resetError.message);
        setSubmitting(false);
        return;
      }

      setSubmitting(false);
      setSentSuccess(true);
    } catch (err: any) {
      setError(err?.message || "Failed to dispatch reset email. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col justify-between text-slate-800 dark:text-stone-100 antialiased transition-colors">
      {/* Top Brand Bar */}
      <header className="border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/ccsa-logo.png"
              alt="CCSA"
              width={96}
              height={32}
              className="h-8 w-auto"
              priority
            />
            <span className="h-5 w-px bg-stone-300 dark:bg-stone-700" />
            <div className="relative h-8 w-[88px] overflow-hidden rounded-lg bg-white px-1.5 py-0.5 flex items-center justify-center shadow-2xs">
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

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to sign in</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Centered Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-[420px] bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-7 sm:p-9 shadow-sm">
          {sentSuccess ? (
            /* Success State */
            <div className="text-center py-4 space-y-5">
              <div className="size-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800/80">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Check your email
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  We sent password reset instructions to:
                </p>
                <p className="mt-1 font-semibold text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 font-mono">
                  {email}
                </p>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                If the email is registered, you will receive a link to set a new password shortly.
              </p>

              <div className="pt-2">
                <Link
                  href="/login"
                  className="w-full h-10 rounded-lg bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center justify-center shadow-xs"
                >
                  Return to sign in
                </Link>
              </div>
            </div>
          ) : (
            /* Request Form */
            <div>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Reset password
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Enter your registered email address to receive password reset instructions.
                </p>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="mb-5 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              <form onSubmit={handleResetRequest} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@organization.com"
                      className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-slate-900 dark:text-white text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-stone-500 focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-600/15 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-10 rounded-lg bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending link...</span>
                    </>
                  ) : (
                    <span>Send reset link</span>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center text-xs text-slate-500 dark:text-stone-400">
                Remember your password?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 transition"
                >
                  Sign in
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="py-6 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/80 text-center text-xs text-slate-400 dark:text-stone-500">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Centre for Climate-Smart Agriculture · Cosmopolitan University Abuja</p>
          <div className="flex items-center gap-4 text-slate-400 dark:text-stone-500">
            <Link href="/" className="hover:text-emerald-800 dark:hover:text-emerald-400 transition">About Zora</Link>
            <Link href="/docs" className="hover:text-emerald-800 dark:hover:text-emerald-400 transition">Docs</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
