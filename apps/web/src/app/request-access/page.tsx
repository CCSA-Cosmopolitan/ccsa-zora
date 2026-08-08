import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, Building2, ShieldCheck, Sprout } from "lucide-react";

import { AccessRequestForm } from "./request-access-form";

export const metadata: Metadata = {
  title: "Request access | CCSA Zora",
  description: "Request institutional access to the CCSA Zora agricultural intelligence workspace.",
};

export default function RequestAccessPage() {
  return (
    <main className="grid min-h-screen bg-[#f7faf5] lg:grid-cols-[0.82fr_1.18fr]">
      <section className="zora-grid relative overflow-hidden bg-zora-deep px-6 py-8 text-white sm:px-10 lg:flex lg:min-h-screen lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute -right-32 top-16 size-96 rounded-full bg-zora-sun/12 blur-3xl" />
        <div className="relative flex items-center justify-between gap-5">
          <Link
            aria-label="CCSA Zora home"
            className="rounded-xl bg-white px-3 py-2 shadow-xl"
            href="/"
          >
            <Image
              alt="Zora"
              className="h-auto w-36"
              height={432}
              priority
              src="/brand/zora-wordmark.jpeg"
              width={1080}
            />
          </Link>
          <Link
            className="flex items-center gap-2 text-xs font-semibold text-emerald-50/70 transition hover:text-white"
            href="/"
          >
            <ArrowLeft className="size-4" /> Back home
          </Link>
        </div>

        <div className="relative mt-20 max-w-xl lg:my-20">
          <div className="flex items-center gap-2 text-zora-sun">
            <Sprout className="size-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
              Institutional access
            </span>
          </div>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-5xl">
            Bring your team into the Zora workspace.
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-emerald-50/68 sm:text-base">
            Tell us how you work across farming, extension, research, climate programmes, or digital
            MRV. Every request is reviewed before an organization workspace is provisioned.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <AccessBenefit icon={Building2} text="Organization-scoped workspaces" />
            <AccessBenefit icon={ShieldCheck} text="Verified roles and tenant isolation" />
            <AccessBenefit icon={BadgeCheck} text="Guided onboarding and MFA" />
          </div>
        </div>

        <p className="relative mt-16 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-50/40 lg:mt-0">
          Centre for Climate-Smart Agriculture · Cosmopolitan University Abuja
        </p>
      </section>

      <section className="flex items-center justify-center px-5 py-12 sm:px-10 lg:py-16">
        <div className="w-full max-w-2xl">
          <div className="mb-7">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zora-forest">
              Request access
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-zora-deep">
              Start an institutional review
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Already provisioned?{" "}
              <Link
                className="font-semibold text-zora-forest underline-offset-4 hover:underline"
                href="/login"
              >
                Sign in to your workspace
              </Link>
              .
            </p>
          </div>
          <AccessRequestForm />
        </div>
      </section>
    </main>
  );
}

function AccessBenefit({ icon: Icon, text }: { icon: typeof Building2; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/7 p-3.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-zora-sun">
        <Icon className="size-4" />
      </span>
      <span className="text-xs font-semibold leading-5 text-emerald-50/75">{text}</span>
    </div>
  );
}
