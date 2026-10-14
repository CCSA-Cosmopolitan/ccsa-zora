"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { ThemeToggle } from "@/components/theme-toggle";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function handleAuth() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setStatus("error");
        setErrorMessage("Authentication client is not configured.");
        return;
      }

      // 1. Check for query parameters (PKCE code flow)
      const code = searchParams.get("code");
      const type = searchParams.get("type");
      const error = searchParams.get("error_description") || searchParams.get("error");

      if (error) {
        setStatus("error");
        setErrorMessage(error);
        return;
      }

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setStatus("error");
          setErrorMessage(exchangeError.message);
          return;
        }

        if (type === "recovery") {
          router.replace("/reset-password");
          return;
        }

        setStatus("success");
        setTimeout(() => router.replace("/dashboard"), 1200);
        return;
      }

      // 2. Check for hash fragments (implicit flow)
      if (typeof window !== "undefined" && window.location.hash) {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        const hashType = params.get("type");
        const hashError = params.get("error_description") || params.get("error");

        if (hashError) {
          setStatus("error");
          setErrorMessage(hashError);
          return;
        }

        if (accessToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || "",
          });

          if (sessionError) {
            setStatus("error");
            setErrorMessage(sessionError.message);
            return;
          }

          if (hashType === "recovery" || type === "recovery") {
            router.replace("/reset-password");
            return;
          }

          setStatus("success");
          setTimeout(() => router.replace("/dashboard"), 1200);
          return;
        }
      }

      // 3. Fallback: check existing session
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        if (type === "recovery") {
          router.replace("/reset-password");
          return;
        }
        setStatus("success");
        setTimeout(() => router.replace("/dashboard"), 1000);
        return;
      }

      setStatus("error");
      setErrorMessage("No valid authentication session found. Please try signing in again.");
    }

    handleAuth();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[#FBFDFB] dark:bg-[#071711] flex flex-col justify-center items-center px-4 antialiased text-slate-800 dark:text-slate-100 transition-colors">
      <div className="w-full max-w-[400px] bg-white dark:bg-[#0B2118] rounded-2xl border border-slate-200/90 dark:border-emerald-950/80 p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)] text-center relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className="flex items-center justify-center gap-3 mb-6">
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
        </div>

        {status === "loading" && (
          <div className="space-y-3 py-4">
            <Loader2 className="w-7 h-7 text-emerald-700 dark:text-emerald-400 animate-spin mx-auto" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Verifying authentication</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Please wait while we secure your session...</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-3 py-4">
            <CheckCircle2 className="w-7 h-7 text-emerald-700 dark:text-emerald-400 mx-auto" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Session verified</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Redirecting to your workspace...</p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4 py-2">
            <div className="size-11 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto border border-red-200 dark:border-red-900">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Verification Issue</h2>
              <p className="mt-1.5 text-xs text-red-700 dark:text-red-300 bg-red-50/80 dark:bg-red-950/40 p-2.5 rounded-lg border border-red-200/80 dark:border-red-900">
                {errorMessage}
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/login"
                className="w-full h-10 rounded-lg bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center justify-center shadow-xs cursor-pointer"
              >
                Return to sign in
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBFDFB] dark:bg-[#071711] flex flex-col justify-center items-center px-4">
          <Loader2 className="w-7 h-7 text-emerald-700 animate-spin" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
