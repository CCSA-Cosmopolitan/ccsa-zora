"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Mail,
  User,
  Building2,
  Phone,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [organization, setOrganization] = useState("");
  const [role, setRole] = useState("extension_officer");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [useCase, setUseCase] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleRequestAccess(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/access-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          organizationName: organization.trim(),
          requestedRole: role,
          phone: phone.trim() || undefined,
          useCase: useCase.trim() || `Agricultural extension and field advisory for ${organization.trim()}`,
          consent: true,
        }),
      });

      const data = await res.json();
      if (!res.ok && res.status !== 202) {
        throw new Error(data.error || "Failed to submit access request");
      }

      setSubmitting(false);
      setSuccess(true);
    } catch (err: any) {
      setError(
        err?.message || "Unable to submit your request. Please check your connection and try again."
      );
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
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      {/* Main Centered Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-[500px] bg-white dark:bg-[#0B2118] border border-slate-200/90 dark:border-emerald-950/80 rounded-2xl p-7 sm:p-9 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
          {success ? (
            /* Access Request Submitted Success State */
            <div className="text-center py-4 space-y-5">
              <div className="size-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800/80">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Access Request Submitted
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Your application has been received for institutional review. An administrator will verify your organization and send your secure login credentials to:
                </p>
                <p className="mt-1 font-semibold text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 font-mono">
                  {email}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#071711] border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 text-left space-y-1.5">
                <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Next Steps:</span>
                </div>
                <p className="leading-relaxed">
                  1. Our operations team reviews your organization and assigns appropriate workspace permissions.
                </p>
                <p className="leading-relaxed">
                  2. You will receive an automated email containing your generated credentials and login link.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2.5">
                <Link
                  href="/dashboard"
                  className="w-full h-10 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>Explore Demo Workspace Meanwhile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/login"
                  className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition flex items-center justify-center"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            /* Request Access Form */
            <div>
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-2">
                  Institutional Access
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Request Workspace Access
                </h1>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Apply for Zora agricultural super intelligence credentials.
                </p>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="mb-5 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              <form onSubmit={handleRequestAccess} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Dr. Amina Bello"
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071711] text-slate-900 dark:text-white text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-600/15 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Organization / State ADP
                    </label>
                    <input
                      type="text"
                      required
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="e.g. Kano State ADP"
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071711] text-slate-900 dark:text-white text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-600/15 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Role in Agriculture
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071711] text-slate-900 dark:text-white text-sm outline-none focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-600/15 transition cursor-pointer"
                    >
                      <option value="extension_officer">Agricultural Extension Officer</option>
                      <option value="lead_agronomist">Lead Agronomist</option>
                      <option value="research_fellow">Research Fellow / Academic</option>
                      <option value="cooperative_lead">Farmer Cooperative Lead</option>
                      <option value="policy_administrator">Agricultural Policy Administrator</option>
                      <option value="mrv_verifier">Digital MRV & Carbon Verifier</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Phone / WhatsApp (Optional)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +234 803 123 4567"
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071711] text-slate-900 dark:text-white text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-600/15 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Work Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@organization.com"
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071711] text-slate-900 dark:text-white text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-600/15 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Operational Focus & Intended Use
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={useCase}
                    onChange={(e) => setUseCase(e.target.value)}
                    placeholder="Briefly describe your farm cluster, extension coverage, or research focus..."
                    className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071711] text-slate-900 dark:text-white text-xs outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-600/15 transition resize-none"
                  />
                </div>

                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 size-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600 cursor-pointer"
                  />
                  <label
                    htmlFor="terms"
                    className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed cursor-pointer"
                  >
                    I agree to the terms of service and acknowledge institutional NDPR data governance.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-10 rounded-lg bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 mt-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting request...</span>
                    </>
                  ) : (
                    <span>Submit Access Request</span>
                  )}
                </button>
              </form>

              <div className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
                Already have credentials?{" "}
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
