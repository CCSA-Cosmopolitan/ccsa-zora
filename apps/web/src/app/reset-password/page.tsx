"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

import { getSupabaseBrowserClient } from "@/lib/supabase";
import { ThemeToggle } from "@/components/theme-toggle";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handlePasswordUpdate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify both fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setSubmitting(true);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Authentication client is not configured.");
      setSubmitting(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
        setSubmitting(false);
        return;
      }

      setSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        router.replace("/dashboard");
      }, 2000);
    } catch (err: any) {
      setError(err?.message || "Failed to update password. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FBFDFB] dark:bg-[#071711] flex flex-col justify-between text-slate-800 dark:text-slate-100 antialiased transition-colors">
      {/* Top Brand Bar */}
      <header className="border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#0A1F17]">
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
            <span className="h-5 w-px bg-slate-200 dark:bg-slate-700" />
            <span className="text-lg font-bold tracking-tight text-emerald-800 dark:text-emerald-400">
              Zora
            </span>
          </Link>

          <ThemeToggle />
        </div>
      </header>

      {/* Main Centered Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-[420px] bg-white dark:bg-[#0B2118] border border-slate-200/90 dark:border-emerald-950/80 rounded-2xl p-7 sm:p-9 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
          {success ? (
            /* Success State */
            <div className="text-center py-4 space-y-5">
              <div className="size-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800/80">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Password updated
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Your new password has been saved. Redirecting you to the dashboard...
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => router.replace("/dashboard")}
                  className="w-full h-10 rounded-lg bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center justify-center shadow-xs cursor-pointer"
                >
                  Continue to dashboard
                </button>
              </div>
            </div>
          ) : (
            /* Update Form */
            <div>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Set new password
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Choose a new password for your account (minimum 8 characters).
                </p>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="mb-5 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full h-10 pl-9 pr-10 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071711] text-slate-900 dark:text-white text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-600/15 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071711] text-slate-900 dark:text-white text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-600/15 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-10 rounded-lg bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving password...</span>
                    </>
                  ) : (
                    <span>Update password</span>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="py-6 border-t border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#0A1F17] text-center text-xs text-slate-400 dark:text-slate-500">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Centre for Climate-Smart Agriculture · Cosmopolitan University Abuja</p>
          <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500">
            <Link href="/" className="hover:text-emerald-800 dark:hover:text-emerald-400 transition">About Zora</Link>
            <Link href="/docs" className="hover:text-emerald-800 dark:hover:text-emerald-400 transition">Docs</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
