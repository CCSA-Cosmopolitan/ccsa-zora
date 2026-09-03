"use client";

import { ArrowRight, ArrowUpRight, KeyRound, Languages, Lock, Mail, ShieldCheck, Sparkles, UserPlus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@ccsa-zora/ui/components/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const demoMode = process.env.NEXT_PUBLIC_ZORA_DEMO_MODE === "true";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [enrollmentQrCode, setEnrollmentQrCode] = useState<string | null>(null);
  const [enrollmentSecret, setEnrollmentSecret] = useState<string | null>(null);

  async function signIn(event: React.FormEvent) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      if (demoMode) {
        router.replace("/dashboard");
      } else {
        setError("Workspace authentication service is currently unconfigured. Contact your administrator.");
      }
      return;
    }
    setSubmitting(true);
    setError(null);
    const result = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    const assurance = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    const factors = await supabase.auth.mfa.listFactors();
    if (assurance.error || !assurance.data || factors.error || !factors.data) {
      setError(
        assurance.error?.message ??
          factors.error?.message ??
          "Unable to verify session assurance level.",
      );
      return;
    }
    if (assurance.data.currentLevel === "aal2") {
      router.replace("/dashboard");
      return;
    }
    const verifiedFactor = factors.data.totp.find((item) => item.status === "verified");
    if (verifiedFactor) {
      setFactorId(verifiedFactor.id);
      return;
    }
    for (const factor of factors.data.all.filter(
      (item) => item.factor_type === "totp" && item.status === "unverified",
    )) {
      await supabase.auth.mfa.unenroll({ factorId: factor.id });
    }
    const enrollment = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "CCSA Zora",
    });
    if (enrollment.error || !enrollment.data.totp) {
      setError(enrollment.error?.message ?? "Unable to start authenticator enrollment.");
      return;
    }
    setFactorId(enrollment.data.id);
    setEnrollmentQrCode(
      `data:image/svg+xml;utf-8,${encodeURIComponent(enrollment.data.totp.qr_code)}`,
    );
    setEnrollmentSecret(enrollment.data.totp.secret);
  }

  async function verifyMfa(event: React.FormEvent) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !factorId) return;
    setSubmitting(true);
    setError(null);
    const result = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code: verificationCode,
    });
    setSubmitting(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    router.replace("/dashboard");
  }

  return (
    <main className="min-h-screen bg-white text-neutral-900 dark:bg-[#0a0b0d] dark:text-stone-100 font-mono transition-colors duration-200 flex flex-col justify-between p-6 lg:p-12">
      {/* Top Header */}
      <header className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-10 w-40 overflow-hidden rounded border border-neutral-200 dark:border-neutral-800 bg-white p-1 shadow-sm">
            <Image
              src="/brand/zora-wordmark.jpeg"
              alt="CCSA Zora Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/">
            <Button variant="outline" className="border-neutral-300 dark:border-neutral-800 bg-transparent text-xs uppercase tracking-wider font-mono">
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Authentication Card */}
      <section className="mx-auto w-full max-w-md my-12">
        <div className="border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#0d0e10] p-8 shadow-lg space-y-6">
          <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4 space-y-2">
            <div className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              AUTHENTICATION MATRIX
            </div>
            <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              {factorId ? "MFA Security Verification" : "Sign In to Zora Workspace"}
            </h1>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 font-sans leading-relaxed">
              {factorId
                ? "Enter your authenticator 6-digit code to complete login."
                : "Access your organization's spatial fields, soil carbon models, and telemetry streams."}
            </p>
          </div>

          {demoMode && !factorId ? (
            <div className="border border-emerald-500/30 bg-emerald-950/10 p-5 space-y-4 font-sans">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-neutral-900 dark:text-white uppercase font-mono">Local Demo Workspace Active</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    Local demonstration mode is enabled. You can open the full Command Centre without credentials.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => router.push("/dashboard")}
                className="w-full border border-neutral-700 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-mono text-xs uppercase tracking-wider font-bold h-11 rounded-none"
              >
                Open Demo Workspace <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : null}

          {/* Login Form */}
          <form className="space-y-4" onSubmit={factorId ? verifyMfa : signIn}>
            {factorId ? (
              <>
                {enrollmentQrCode ? (
                  <div className="border border-neutral-200 dark:border-neutral-800 bg-white p-4 text-center space-y-2">
                    <img
                      alt="Authenticator QR code"
                      className="mx-auto h-40 w-40"
                      src={enrollmentQrCode}
                    />
                    <p className="text-[10px] uppercase tracking-wider text-neutral-500">Manual Setup Secret:</p>
                    <code className="text-xs font-bold text-black break-all">{enrollmentSecret}</code>
                  </div>
                ) : null}

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-neutral-600 dark:text-neutral-400 block font-bold">
                    AUTHENTICATOR CODE (6-DIGIT):
                  </label>
                  <input
                    autoComplete="one-time-code"
                    className="w-full border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-3 text-sm text-neutral-900 dark:text-white font-mono tracking-widest focus:border-emerald-500 focus:outline-none"
                    inputMode="numeric"
                    maxLength={6}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                    required
                    value={verificationCode}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-neutral-600 dark:text-neutral-400 block font-bold">
                    ORGANIZATION EMAIL:
                  </label>
                  <input
                    autoComplete="email"
                    className="w-full border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-3 text-xs text-neutral-900 dark:text-white font-mono focus:border-emerald-500 focus:outline-none"
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@cooperative.org"
                    required
                    type="email"
                    value={email}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase tracking-wider text-neutral-600 dark:text-neutral-400 font-bold">
                      PASSWORD:
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <input
                    autoComplete="current-password"
                    className="w-full border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-3 text-xs text-neutral-900 dark:text-white font-mono focus:border-emerald-500 focus:outline-none"
                    minLength={8}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    type="password"
                    value={password}
                  />
                </div>
              </>
            )}

            {error ? (
              <div className="border border-red-500/40 bg-red-950/10 p-3 text-xs text-red-600 dark:text-red-400 font-sans">
                {error}
              </div>
            ) : null}

            <Button
              className="w-full border border-neutral-700 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-mono text-xs uppercase tracking-wider font-bold h-11 rounded-none"
              disabled={submitting}
              type="submit"
            >
              {submitting ? "Verifying Credentials…" : factorId ? "Verify Code" : "Sign In to Workspace"}
            </Button>
          </form>

          {/* Quick Links */}
          <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 flex flex-col items-center gap-2 text-xs font-sans text-neutral-600 dark:text-neutral-400">
            <p>Don't have an organization account?</p>
            <div className="flex gap-4 font-mono text-[11px] uppercase tracking-wider">
              <Link href="/signup" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                Create Account
              </Link>
              <span>•</span>
              <Link href="/request-access" className="text-neutral-600 dark:text-neutral-400 hover:underline">
                Request Access
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-[10px] text-neutral-500 uppercase tracking-widest">
        © 2026 CCSA Zora Platform • Cosmopolitan University Abuja
      </footer>
    </main>
  );
}
