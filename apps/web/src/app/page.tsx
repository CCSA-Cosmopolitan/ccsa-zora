import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BrainCircuit,
  Check,
  CloudSun,
  DatabaseZap,
  FileCheck2,
  Globe2,
  Languages,
  Leaf,
  MapPinned,
  MessageCircleMore,
  RadioTower,
  ShieldCheck,
  Sparkles,
  Sprout,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@ccsa-zora/ui/components/badge";
import { Button } from "@ccsa-zora/ui/components/button";

export const metadata: Metadata = {
  title: "CCSA Zora | Agricultural Intelligence for Every Field",
  description:
    "Zora connects farmers, extension teams, climate intelligence, GIS, sensors, and trusted digital MRV in one agricultural intelligence platform.",
};

const capabilities = [
  {
    icon: MessageCircleMore,
    eyebrow: "Digital extension",
    title: "Ask in the language of the farm",
    description:
      "Voice-ready, multilingual guidance that turns field context and institutional knowledge into clear next actions.",
  },
  {
    icon: MapPinned,
    eyebrow: "Spatial intelligence",
    title: "See every field in context",
    description:
      "Map boundaries, vegetation signals, scouting evidence, climate exposure, and operational priorities together.",
  },
  {
    icon: BrainCircuit,
    eyebrow: "Knowledge-guided models",
    title: "Reason with evidence, not guesswork",
    description:
      "KGML-Ag combines scientific constraints, field observations, model versions, uncertainty, and transparent traces.",
  },
  {
    icon: RadioTower,
    eyebrow: "Connected agriculture",
    title: "Bring sensor networks into the picture",
    description:
      "Ingest signed LPWAN and IoT measurements while preserving tenant boundaries, provenance, and replay protection.",
  },
  {
    icon: FileCheck2,
    eyebrow: "Digital MRV",
    title: "Build evidence that can be verified",
    description:
      "Link field records, media hashes, sensor readings, model runs, and append-only carbon events into an auditable chain.",
  },
  {
    icon: DatabaseZap,
    eyebrow: "Offline fieldwork",
    title: "Keep working beyond connectivity",
    description:
      "Capture location-aware scouting records offline, then synchronize with idempotency, conflict capture, and integrity checks.",
  },
] satisfies Array<{ icon: LucideIcon; eyebrow: string; title: string; description: string }>;

const audiences = [
  ["Farmers", "Timely, understandable guidance grounded in the reality of each field."],
  ["Extension teams", "Prioritized field visits, shared evidence, and continuity across seasons."],
  ["Researchers", "Structured observations, spatial context, provenance, and model traceability."],
  ["Institutions", "Portfolio intelligence, climate-risk visibility, and defensible impact reporting."],
] as const;

export default function LandingPage() {
  const demoMode = process.env.NEXT_PUBLIC_ZORA_DEMO_MODE === "true";
  const workspaceHref = demoMode ? "/dashboard" : "/login";
  const workspaceLabel = demoMode ? "Open live demo" : "Sign in";

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7faf5] text-zora-deep">
      <a className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2" href="#main-content">
        Skip to content
      </a>

      <header className="absolute inset-x-0 top-0 z-30 border-b border-white/10">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center gap-6 px-5 lg:px-8">
          <Link aria-label="CCSA Zora home" className="flex h-11 items-center rounded-xl bg-white px-3 shadow-sm" href="/">
            <Image alt="Zora" className="h-auto w-[158px]" height={432} priority src="/brand/zora-wordmark.jpeg" width={1080} />
          </Link>
          <nav aria-label="Landing page" className="ml-auto hidden items-center gap-6 text-sm font-semibold text-emerald-50/72 xl:flex">
            <a className="transition hover:text-white" href="#capabilities">Capabilities</a>
            <a className="transition hover:text-white" href="#how-it-works">How it works</a>
            <a className="transition hover:text-white" href="#trust">Trust fabric</a>
            <a className="transition hover:text-white" href="#who-it-serves">Who it serves</a>
          </nav>
          <div className="ml-auto flex items-center gap-2 xl:ml-0">
            <Button asChild className="hidden border-white/20 bg-white/6 text-white hover:bg-white/12 sm:inline-flex" size="lg" variant="outline">
              <Link href="/request-access">Request access</Link>
            </Button>
            <Button asChild className="border border-white/15 bg-white text-zora-deep hover:bg-zora-mist" size="lg">
              <Link href={workspaceHref}>{workspaceLabel} <ArrowRight /></Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="zora-hero-landscape relative overflow-hidden bg-zora-deep pb-20 pt-36 text-white lg:min-h-[820px] lg:pb-28 lg:pt-44" id="main-content">
        <div className="absolute inset-0 zora-contours opacity-30" />
        <div className="absolute -right-32 top-12 size-[34rem] rounded-full bg-zora-sun/12 blur-3xl" />
        <div className="absolute -left-36 bottom-0 size-[30rem] rounded-full bg-zora-leaf/12 blur-3xl" />
        <div className="relative mx-auto grid max-w-[1440px] gap-14 px-5 lg:grid-cols-[minmax(0,1.02fr)_minmax(500px,0.98fr)] lg:items-center lg:px-8">
          <div className="max-w-3xl">
            <Badge className="border-white/15 bg-white/8 text-emerald-50" variant="outline">
              <Sparkles className="mr-1 size-3 text-zora-sun" /> Agricultural Super Intelligence
            </Badge>
            <h1 className="mt-7 text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-[5.35rem]">
              Every field has a story. <span className="text-zora-sun">Zora helps it speak.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-emerald-50/68 sm:text-lg sm:leading-8">
              One trusted agricultural companion connecting farmers, extension teams, climate intelligence, field evidence, GIS, sensors, and knowledge-guided models.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-12 rounded-xl bg-zora-sun px-6 text-zora-deep shadow-xl shadow-black/15 hover:bg-[#f5bf3f]" size="lg">
                <Link href={workspaceHref}>{workspaceLabel} <ArrowRight /></Link>
              </Button>
              <Button asChild className="h-12 rounded-xl border-white/20 bg-white/6 px-6 text-white hover:bg-white/12" size="lg" variant="outline">
                <Link href="/request-access">Request workspace access</Link>
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/10 pt-6 text-xs font-semibold text-emerald-50/65">
              <HeroProof icon={Languages} label="Multilingual by design" />
              <HeroProof icon={ShieldCheck} label="Tenant-isolated data" />
              <HeroProof icon={Sprout} label="Built for field conditions" />
            </div>
          </div>

          <HeroIntelligencePanel />
        </div>

        <div className="relative mx-auto mt-16 grid max-w-[1440px] gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 px-0 sm:grid-cols-3 lg:mt-24 lg:rounded-3xl">
          <Pillar number="01" title="Productivity" copy="Improve decisions, yields, and operational efficiency without losing field context." />
          <Pillar number="02" title="Adaptation" copy="Anticipate climate pressure and turn risk signals into practical action." />
          <Pillar number="03" title="Mitigation" copy="Measure practices and evidence with traceability fit for climate programmes." />
        </div>
      </section>

      <section className="relative py-24 sm:py-28" id="capabilities">
        <div className="mx-auto max-w-[1440px] px-5 lg:px-8">
          <SectionIntro
            eyebrow="One connected platform"
            title="Intelligence that reaches from the soil to the institution."
            copy="Zora is designed as useful agricultural infrastructure: clear enough for field operations, rigorous enough for research, and accountable enough for institutional programmes."
          />
          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {capabilities.map((capability, index) => (
              <article className={`group rounded-[1.4rem] border p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-zora-deep/8 ${index === 0 || index === 4 ? "border-zora-forest/18 bg-zora-mist/75" : "border-zora-forest/10 bg-white"}`} key={capability.title}>
                <span className="flex size-11 items-center justify-center rounded-2xl bg-zora-deep text-zora-sun transition group-hover:bg-zora-forest">
                  <capability.icon className="size-5" />
                </span>
                <p className="mt-7 text-[10px] font-black uppercase tracking-[0.18em] text-zora-forest">{capability.eyebrow}</p>
                <h3 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-zora-deep">{capability.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{capability.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#e9f1e7] py-24 sm:py-28" id="how-it-works">
        <div className="mx-auto grid max-w-[1440px] gap-14 px-5 lg:grid-cols-[0.82fr_1.18fr] lg:items-start lg:px-8">
          <div className="lg:sticky lg:top-28">
            <SectionIntro
              eyebrow="From signal to action"
              title="A continuous intelligence loop for agriculture."
              copy="Zora preserves the evidence behind each decision, while making the outcome understandable to the people who must act on it."
              narrow
            />
            <Button asChild className="mt-8 h-11 rounded-xl" size="lg">
              <Link href={workspaceHref}>{workspaceLabel} <ArrowRight /></Link>
            </Button>
          </div>
          <div className="space-y-3">
            <WorkflowStep icon={Globe2} number="01" title="Understand the field" copy="Combine farm records, boundaries, scouting notes, images, climate conditions, and sensor measurements." />
            <WorkflowStep icon={BrainCircuit} number="02" title="Reason with knowledge" copy="Apply agricultural knowledge, explicit constraints, model versions, uncertainty, and local operating context." />
            <WorkflowStep icon={Leaf} number="03" title="Guide, learn, and verify" copy="Deliver a practical recommendation, capture what happened next, and preserve the evidence for learning and reporting." />
          </div>
        </div>
      </section>

      <section className="bg-white py-24 sm:py-28" id="trust">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-5 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:px-8">
          <div className="relative min-h-[500px] overflow-hidden rounded-[2rem] bg-zora-deep p-6 text-white shadow-2xl shadow-zora-deep/15 sm:p-8">
            <div className="absolute inset-0 zora-contours opacity-25" />
            <div className="relative">
              <div className="flex items-center gap-2 text-zora-sun">
                <ShieldCheck className="size-5" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Zora trust fabric</span>
              </div>
              <p className="mt-5 max-w-md text-3xl font-semibold tracking-[-0.035em]">Evidence should remain trustworthy long after the field visit.</p>
              <div className="mt-9 space-y-3">
                <TrustRow label="Field observation" value="Location + media SHA-256" />
                <TrustRow label="Sensor measurement" value="Signed tenant gateway" />
                <TrustRow label="Model inference" value="Version + uncertainty" />
                <TrustRow label="MRV record" value="Append-only audit event" />
              </div>
              <div className="mt-8 flex items-center gap-3 rounded-2xl border border-zora-sun/25 bg-zora-sun/10 p-4">
                <BadgeCheck className="size-6 shrink-0 text-zora-sun" />
                <p className="text-xs leading-5 text-emerald-50/75">Tenant isolation, idempotent synchronization, provenance, and immutable lifecycle events are part of the architecture—not an afterthought.</p>
              </div>
            </div>
          </div>
          <div>
            <SectionIntro
              eyebrow="Digital MRV and integrity"
              title="Built for decisions that must stand up to scrutiny."
              copy="Zora keeps operational convenience and institutional accountability in the same workflow, from offline evidence capture through reporting."
              narrow
            />
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                "PostGIS field provenance",
                "Private evidence objects",
                "Immutable audit trails",
                "Versioned model records",
                "Human verification states",
                "Explicit tenant boundaries",
              ].map((item) => (
                <li className="flex items-center gap-3 text-sm font-semibold text-zora-deep" key={item}>
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-zora-mist text-zora-forest"><Check className="size-3.5" /></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-y border-zora-forest/10 bg-[#f4f0e5] py-24 sm:py-28" id="who-it-serves">
        <div className="mx-auto max-w-[1440px] px-5 lg:px-8">
          <SectionIntro eyebrow="Designed for the whole agricultural system" title="One shared picture. Different views for every role." copy="Zora connects the people who grow, advise, study, finance, and verify—without flattening their different responsibilities." />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {audiences.map(([title, copy], index) => (
              <article className="relative overflow-hidden rounded-2xl border border-soil/12 bg-white p-5" key={title}>
                <span className="text-5xl font-semibold tracking-[-0.06em] text-zora-sun/35">0{index + 1}</span>
                <h3 className="mt-5 text-lg font-semibold text-zora-deep">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-zora-deep px-5 py-20 text-white lg:px-8">
        <div className="zora-grid relative mx-auto max-w-[1440px] overflow-hidden rounded-[2rem] border border-white/10 bg-white/6 px-6 py-14 text-center sm:px-10 sm:py-16">
          <div className="absolute left-1/2 top-0 size-80 -translate-x-1/2 rounded-full bg-zora-sun/12 blur-3xl" />
          <div className="relative mx-auto max-w-3xl">
            <Sprout className="mx-auto size-8 text-zora-sun" />
            <h2 className="mt-6 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">Bring every field into focus.</h2>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-emerald-50/65 sm:text-base">Enter the Zora workspace to coordinate climate-smart operations, field intelligence, advisory, and trusted evidence.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild className="h-12 rounded-xl bg-zora-sun px-7 text-zora-deep hover:bg-[#f5bf3f]" size="lg">
                <Link href={workspaceHref}>{workspaceLabel} <ArrowRight /></Link>
              </Button>
              <Button asChild className="h-12 rounded-xl border-white/20 bg-white/6 px-7 text-white hover:bg-white/12" size="lg" variant="outline">
                <Link href="/request-access">Request access</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#042c20] text-emerald-50/60">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-5 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <p className="font-semibold text-white">CCSA Zora</p>
            <p className="mt-1 text-xs">Centre for Climate-Smart Agriculture · Cosmopolitan University Abuja</p>
          </div>
          <div className="flex flex-wrap gap-5 text-xs font-semibold">
            <a className="hover:text-white" href="#capabilities">Capabilities</a>
            <a className="hover:text-white" href="#trust">Trust</a>
            <Link className="hover:text-white" href="/request-access">Request access</Link>
            <Link className="hover:text-white" href="/login">Sign in</Link>
          </div>
          <p className="text-xs">© {new Date().getFullYear()} CCSA. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}

function HeroProof({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return <span className="flex items-center gap-2"><Icon className="size-4 text-zora-sun" />{label}</span>;
}

function HeroIntelligencePanel() {
  return (
    <div className="relative mx-auto w-full max-w-[610px] lg:ml-auto">
      <div className="absolute -inset-5 rounded-[2.4rem] border border-white/8" />
      <div className="relative overflow-hidden rounded-[1.8rem] border border-white/15 bg-[#f7faf5] p-3 text-zora-deep shadow-2xl shadow-black/30 sm:p-4">
        <div className="flex items-center justify-between px-2 pb-3 pt-1">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zora-forest">Illustrative field intelligence</p>
            <p className="mt-1 text-sm font-semibold">North demonstration field</p>
          </div>
          <span className="flex items-center gap-2 rounded-full bg-zora-mist px-3 py-1.5 text-[10px] font-bold text-zora-forest">
            <span className="size-1.5 rounded-full bg-zora-leaf" /> Live context
          </span>
        </div>
        <div className="zora-field-plot relative h-[260px] overflow-hidden rounded-2xl bg-[#dfe9d2] sm:h-[310px]">
          <div className="absolute inset-x-[16%] inset-y-[12%] rotate-[-5deg] rounded-[38%_62%_46%_54%/48%_40%_60%_52%] border-[3px] border-white/90 bg-zora-leaf/55 shadow-xl">
            <div className="absolute inset-[12%] rounded-[inherit] border border-dashed border-white/70" />
          </div>
          <span className="absolute left-[23%] top-[30%] flex size-9 items-center justify-center rounded-full border-4 border-white bg-zora-sun text-zora-deep shadow-lg"><Leaf className="size-4" /></span>
          <span className="absolute bottom-[21%] right-[26%] flex size-9 items-center justify-center rounded-full border-4 border-white bg-terra text-white shadow-lg"><CloudSun className="size-4" /></span>
          <div className="absolute bottom-3 left-3 rounded-xl border border-white/60 bg-white/88 px-3 py-2 shadow-lg backdrop-blur">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Field pulse</p>
            <p className="mt-0.5 text-xs font-bold text-zora-deep">Inspect western moisture zone</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <IntelligenceMetric icon={Leaf} label="NDVI" value="0.72" />
          <IntelligenceMetric icon={CloudSun} label="Rain outlook" value="68%" />
          <IntelligenceMetric icon={BarChart3} label="MRV ready" value="86%" />
        </div>
      </div>
      <div className="absolute -bottom-7 -left-5 hidden w-64 rounded-2xl border border-zora-forest/10 bg-white p-4 text-zora-deep shadow-2xl sm:block">
        <div className="flex items-center gap-2 text-zora-forest"><Sparkles className="size-4" /><span className="text-[9px] font-black uppercase tracking-[0.16em]">Zora priority</span></div>
        <p className="mt-2 text-xs font-semibold leading-5">Validate irrigation coverage before the next input application.</p>
      </div>
    </div>
  );
}

function IntelligenceMetric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zora-forest/10 bg-white p-3">
      <Icon className="size-4 text-zora-forest" />
      <p className="mt-3 text-[9px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-zora-deep">{value}</p>
    </div>
  );
}

function Pillar({ number, title, copy }: { number: string; title: string; copy: string }) {
  return (
    <article className="bg-[#0a4934]/92 p-6 sm:p-7">
      <div className="flex items-center gap-3"><span className="font-mono text-xs font-bold text-zora-sun">{number}</span><h2 className="text-lg font-semibold text-white">{title}</h2></div>
      <p className="mt-3 text-xs leading-5 text-emerald-50/58">{copy}</p>
    </article>
  );
}

function SectionIntro({ eyebrow, title, copy, narrow = false }: { eyebrow: string; title: string; copy: string; narrow?: boolean }) {
  return (
    <div className={narrow ? "max-w-xl" : "max-w-3xl"}>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zora-forest">{eyebrow}</p>
      <h2 className="mt-4 text-4xl font-semibold leading-[1.04] tracking-[-0.045em] text-zora-deep sm:text-5xl">{title}</h2>
      <p className="mt-5 text-sm leading-7 text-muted-foreground sm:text-base">{copy}</p>
    </div>
  );
}

function WorkflowStep({ icon: Icon, number, title, copy }: { icon: LucideIcon; number: string; title: string; copy: string }) {
  return (
    <article className="grid gap-5 rounded-[1.4rem] border border-zora-forest/10 bg-white p-6 shadow-sm sm:grid-cols-[64px_1fr] sm:p-7">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-zora-deep text-zora-sun"><Icon className="size-6" /></span>
      <div>
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-zora-forest">Step {number}</p>
        <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-zora-deep">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
      </div>
    </article>
  );
}

function TrustRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/6 p-4">
      <span className="text-xs font-semibold text-emerald-50/70">{label}</span>
      <span className="text-right font-mono text-[10px] font-bold uppercase tracking-wider text-zora-sun">{value}</span>
    </div>
  );
}
