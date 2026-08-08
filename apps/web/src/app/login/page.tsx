"use client";

import { ArrowRight, Languages, ShieldCheck, Sparkles, UserPlus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@ccsa-zora/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ccsa-zora/ui/components/card";

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
        setError("Workspace authentication is not configured. Contact your Zora administrator.");
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
          "Unable to verify the session assurance level.",
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
    <main className="grid min-h-screen bg-background lg:grid-cols-[1.1fr_0.9fr]">
      <section className="zora-grid relative hidden overflow-hidden bg-zora-deep p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-28 top-10 size-96 rounded-full bg-zora-sun/15 blur-3xl" />
        <div className="relative w-fit rounded-2xl bg-white px-4 py-3 shadow-2xl">
          <Image
            alt="Zora - Your AI farming companion"
            className="h-auto w-[380px]"
            height={432}
            priority
            src="/brand/zora-wordmark.jpeg"
            width={1080}
          />
        </div>
        <div className="relative max-w-xl">
          <div className="flex items-center gap-2 text-zora-sun">
            <Sparkles className="size-5" />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">
              Agricultural Super Intelligence
            </span>
          </div>
          <h1 className="mt-4 text-5xl font-semibold leading-[1.04] tracking-[-0.04em]">
            Expert farm knowledge, in every farmer&apos;s language.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-emerald-50/65">
            CCSA Zora connects farmers, extension teams, researchers, climate intelligence, GIS, and
            KGML-Ag in one trusted companion.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3">
            <LoginFeature icon={Languages} text="Five Nigerian language experiences" />
            <LoginFeature icon={ShieldCheck} text="Institution-grade data integrity" />
          </div>
        </div>
        <p className="relative text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-50/40">
          Centre for Climate-Smart Agriculture · Cosmopolitan University Abuja
        </p>
      </section>

      <section className="flex items-center justify-center p-5 md:p-10">
        <Card className="w-full max-w-md border-zora-forest/15 shadow-2xl shadow-zora-deep/10">
          <CardHeader>
            <Image
              alt="Zora"
              className="mb-3 h-auto w-16 rounded-xl lg:hidden"
              height={806}
              src="/brand/zora-square.jpeg"
              width={827}
            />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zora-forest">
              CCSA Zora Intelligence
            </p>
            <CardTitle className="text-2xl">
              {factorId
                ? "Secure verification"
                : demoMode
                  ? "Explore the Zora workspace"
                  : "Welcome back"}
            </CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              {enrollmentQrCode
                ? "Scan this QR code in your authenticator app, then enter the six-digit code."
                : factorId
                  ? "Enter your authenticator code to access protected model and verification actions."
                  : demoMode
                    ? "The local demonstration workspace is open without credentials. Production workspaces require an approved organization account."
                    : "Sign in to your approved organization workspace."}
            </p>
          </CardHeader>
          <CardContent>
            {demoMode && !factorId ? (
              <div className="rounded-2xl border border-zora-forest/15 bg-zora-mist/65 p-5">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zora-deep text-zora-sun">
                    <Sparkles className="size-4" />
                  </span>
                  <div>
                    <p className="font-semibold text-zora-deep">Demonstration access</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Explore representative field, advisory, sensor, and digital MRV workflows. No
                      email or password is required.
                    </p>
                  </div>
                </div>
                <Button asChild className="mt-5 h-11 w-full rounded-xl">
                  <Link href="/dashboard">
                    Open demo workspace <ArrowRight />
                  </Link>
                </Button>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={factorId ? verifyMfa : signIn}>
                {factorId ? (
                  <>
                    {enrollmentQrCode ? (
                      <div className="rounded-xl border border-zora-forest/15 bg-white p-3 text-center">
                        {/* Supabase returns a self-contained data URI for this user-specific TOTP QR code. */}
                        <img
                          alt="Authenticator enrollment QR code"
                          className="mx-auto size-44"
                          src={enrollmentQrCode}
                        />
                        <p className="mt-2 text-xs text-muted-foreground">Manual setup key</p>
                        <code className="mt-1 block break-all text-xs font-semibold text-zora-deep">
                          {enrollmentSecret}
                        </code>
                      </div>
                    ) : null}
                    <label className="block text-sm font-semibold">
                      Authenticator code
                      <input
                        autoComplete="one-time-code"
                        className="mt-1.5 h-11 w-full rounded-xl border border-input bg-card px-3 font-mono font-normal tracking-[0.3em] outline-none focus:ring-2 focus:ring-ring"
                        inputMode="numeric"
                        maxLength={6}
                        onChange={(event) =>
                          setVerificationCode(event.target.value.replace(/\D/g, ""))
                        }
                        required
                        value={verificationCode}
                      />
                    </label>
                  </>
                ) : (
                  <>
                    <label className="block text-sm font-semibold">
                      Email
                      <input
                        autoComplete="email"
                        className="mt-1.5 h-11 w-full rounded-xl border border-input bg-card px-3 font-normal outline-none focus:ring-2 focus:ring-ring"
                        onChange={(event) => setEmail(event.target.value)}
                        required
                        type="email"
                        value={email}
                      />
                    </label>
                    <label className="block text-sm font-semibold">
                      Password
                      <input
                        autoComplete="current-password"
                        className="mt-1.5 h-11 w-full rounded-xl border border-input bg-card px-3 font-normal outline-none focus:ring-2 focus:ring-ring"
                        minLength={8}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                        type="password"
                        value={password}
                      />
                    </label>
                  </>
                )}
                {error ? (
                  <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </p>
                ) : null}
                <Button className="h-11 w-full rounded-xl" disabled={submitting} type="submit">
                  {submitting
                    ? "Verifying…"
                    : factorId
                      ? "Verify and continue"
                      : "Enter Zora workspace"}
                </Button>
              </form>
            )}

            {!factorId ? (
              <div className="mt-5 border-t border-zora-forest/10 pt-5 text-center">
                <p className="text-xs text-muted-foreground">Need an organization account?</p>
                <Link
                  className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-zora-forest underline-offset-4 hover:underline"
                  href="/request-access"
                >
                  <UserPlus className="size-4" /> Request workspace access
                </Link>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function LoginFeature({ icon: Icon, text }: { icon: typeof Languages; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/7 p-3.5">
      <span className="flex size-9 items-center justify-center rounded-xl bg-white/10 text-zora-sun">
        <Icon className="size-4" />
      </span>
      <span className="text-xs leading-5 text-emerald-50/75">{text}</span>
    </div>
  );
}
