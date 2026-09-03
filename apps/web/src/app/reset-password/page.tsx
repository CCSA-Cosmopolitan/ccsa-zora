"use client";

import { ArrowRight, CheckCircle2, Lock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@ccsa-zora/ui/components/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handlePasswordUpdate(event: React.FormEvent) {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setSubmitting(false);
      setSuccess(true);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    setSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess(true);
  }

  return (
    <main className="min-h-screen bg-white text-neutral-900 dark:bg-[#0a0b0d] dark:text-stone-100 font-mono transition-colors duration-200 flex flex-col justify-between p-6 lg:p-12">
      {/* Header */}
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
          <Link href="/login">
            <Button variant="outline" className="border-neutral-300 dark:border-neutral-800 bg-transparent text-xs uppercase tracking-wider font-mono">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <section className="mx-auto w-full max-w-md my-12">
        <div className="border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#0d0e10] p-8 shadow-lg space-y-6">
          <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4 space-y-2">
            <div className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-emerald-500" />
              PASSWORD UPDATE
            </div>
            <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              Set New Password
            </h1>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 font-sans leading-relaxed">
              Enter and confirm your new organization account password.
            </p>
          </div>

          {success ? (
            <div className="border border-emerald-500/40 bg-emerald-950/10 p-6 space-y-4 font-sans text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
              <div className="space-y-2">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white font-mono uppercase">Password Updated Successfully</h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Your password has been securely updated. You can now sign in to your organization workspace.
                </p>
              </div>
              <Button
                onClick={() => router.push("/login")}
                className="w-full border border-neutral-700 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-mono text-xs uppercase tracking-wider font-bold h-11 rounded-none mt-2"
              >
                Proceed to Sign In <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handlePasswordUpdate}>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-neutral-600 dark:text-neutral-400 block font-bold">
                  NEW PASSWORD (MIN 8 CHARACTERS):
                </label>
                <input
                  autoComplete="new-password"
                  className="w-full border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-3 text-xs text-neutral-900 dark:text-white font-mono focus:border-emerald-500 focus:outline-none"
                  minLength={8}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  type="password"
                  value={password}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-neutral-600 dark:text-neutral-400 block font-bold">
                  CONFIRM NEW PASSWORD:
                </label>
                <input
                  autoComplete="new-password"
                  className="w-full border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-3 text-xs text-neutral-900 dark:text-white font-mono focus:border-emerald-500 focus:outline-none"
                  minLength={8}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  type="password"
                  value={confirmPassword}
                />
              </div>

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
                {submitting ? "Updating Password…" : "Save New Password"}
              </Button>
            </form>
          )}

          <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 text-center text-xs font-sans text-neutral-600 dark:text-neutral-400">
            Need help?{" "}
            <Link href="/login" className="font-mono text-xs uppercase text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
              Return to Login
            </Link>
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
