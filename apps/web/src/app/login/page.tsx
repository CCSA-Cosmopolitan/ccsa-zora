"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  KeyRound,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

import { getSupabaseBrowserClient } from "@/lib/supabase";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // MFA TOTP State
  const [factorId, setFactorId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Authentication service is not configured. Please check environment configuration.");
      setSubmitting(false);
      return;
    }

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setSubmitting(false);
        return;
      }

      // Check if user has MFA enabled
      const assurance = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      const factors = await supabase.auth.mfa.listFactors();

      if (assurance.data && assurance.data.currentLevel !== "aal2") {
        const verifiedFactor = factors.data?.totp.find((item) => item.status === "verified");
        if (verifiedFactor) {
          setFactorId(verifiedFactor.id);
          setSubmitting(false);
          return;
        }
      }

      router.replace("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Failed to sign in. Please check your credentials and connection.");
      setSubmitting(false);
    }
  }

  async function handleVerifyMfa(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId) return;
    setError(null);
    setSubmitting(true);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    try {
      const result = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code: verificationCode.trim(),
      });

      if (result.error) {
        setError(result.error.message);
        setSubmitting(false);
        return;
      }

      router.replace("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Invalid verification code.");
      setSubmitting(false);
    }
  }

  function handleDemoAccess() {
    router.replace("/dashboard");
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
            <span className="h-5 w-px bg-stone-200 dark:bg-stone-700" />
            <span className="text-lg font-bold tracking-tight text-emerald-800 dark:text-emerald-400">
              Zora
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/signup"
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition"
            >
              Request access
            </Link>
          </div>
        </div>
      </header>

      {/* Main Centered Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-[420px] bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-7 sm:p-9 shadow-sm">
          {/* Header */}
          <div className="text-center mb-7">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {factorId ? "Two-Factor Verification" : "Sign in to Zora"}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {factorId
                ? "Enter the 6-digit authentication code from your authenticator app."
                : "Agricultural super intelligence platform for farmers and extension teams."}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex flex-col gap-1">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
              {(error.toLowerCase().includes("fetch") ||
                error.toLowerCase().includes("network") ||
                error.toLowerCase().includes("enotfound")) && (
                <button
                  type="button"
                  onClick={handleDemoAccess}
                  className="mt-1 text-left text-xs font-semibold text-emerald-700 dark:text-emerald-400 underline hover:text-emerald-800"
                >
                  Click here to explore the Guest Demo Workspace instead.
                </button>
              )}
            </div>
          )}

          {factorId ? (
            /* MFA Form */
            <form onSubmit={handleVerifyMfa} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Authenticator Code
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071711] text-slate-900 dark:text-white text-sm font-mono tracking-widest outline-none focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-600/15 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || verificationCode.length < 6}
                className="w-full h-10 rounded-lg bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Verify code</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setFactorId(null)}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Back to sign in
              </button>
            </form>
          ) : (
            /* Standard Sign-In Form */
            <form onSubmit={handleSignIn} className="space-y-4">
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

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full h-10 pl-9 pr-10 rounded-lg border border-slate-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-slate-900 dark:text-white text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-stone-500 focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-600/15 transition"
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

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-10 rounded-lg bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign in</span>
                )}
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-stone-800" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white dark:bg-stone-900 px-2 text-slate-400 dark:text-stone-400">
                    or
                  </span>
                </div>
              </div>

              {/* Instant Guest Demo Workspace */}
              <button
                type="button"
                onClick={handleDemoAccess}
                className="w-full h-10 rounded-lg border border-slate-200 dark:border-stone-800 bg-white dark:bg-stone-950 hover:bg-slate-50 dark:hover:bg-stone-800 text-slate-700 dark:text-stone-200 font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Open Guest Demo Workspace</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </form>
          )}

          {/* Request access link */}
          <div className="mt-6 text-center text-xs text-slate-500 dark:text-stone-400">
            Need an organization account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 transition"
            >
              Request workspace access
            </Link>
          </div>
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
