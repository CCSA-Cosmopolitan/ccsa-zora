"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import {
  Activity,
  BadgeCheck,
  Bell,
  Bot,
  BrainCircuit,
  CloudRain,
  Download,
  FileCheck2,
  Globe2,
  Leaf,
  MapPinned,
  Menu,
  MessageCircleMore,
  RadioTower,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Sprout,
  TriangleAlert,
  UsersRound,
} from "lucide-react";

import type { DashboardSnapshot, FieldSummary } from "@ccsa-zora/utils/api";
import { Badge } from "@ccsa-zora/ui/components/badge";
import { Button } from "@ccsa-zora/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ccsa-zora/ui/components/card";

import { ZoraAssistant } from "@/features/assistant/zora-assistant";
import { FarmPulseChart } from "@/features/dashboard/farm-pulse-chart";
import { useDashboard } from "@/hooks/use-dashboard";
import { useWorkspaceStore } from "@/stores/workspace";

const FieldMap = dynamic(
  () => import("@/features/maps/field-map").then((module) => module.FieldMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-muted text-sm text-muted-foreground">
        Preparing geospatial intelligence…
      </div>
    ),
  },
);

const navigation = [
  ["Command centre", "overview", Sparkles],
  ["Ask Zora", "assistant", MessageCircleMore],
  ["Farm intelligence", "fields", MapPinned],
  ["Climate watch", "climate", CloudRain],
  ["KGML-Ag", "knowledge", BrainCircuit],
  ["Impact & MRV", "mrv", FileCheck2],
] as const;

export function DashboardShell() {
  const dashboard = useDashboard();
  const selectedFieldId = useWorkspaceStore((state) => state.selectedFieldId);
  const setSelectedFieldId = useWorkspaceStore((state) => state.setSelectedFieldId);
  const [search, setSearch] = useState("");

  if (dashboard.isLoading) return <LoadingDashboard />;
  if (dashboard.isError || !dashboard.data) {
    return (
      <DashboardError
        message={dashboard.error?.message ?? "Zora intelligence is unavailable"}
        retry={() => dashboard.refetch()}
      />
    );
  }

  const data = dashboard.data;
  const filteredFields = data.fields.filter((field) =>
    `${field.name} ${field.cropCode ?? ""}`.toLowerCase().includes(search.toLowerCase()),
  );
  const selectedField = data.fields.find((field) => field.id === selectedFieldId) ?? data.fields[0];

  function exportMrv() {
    const payload = JSON.stringify(
      {
        product: "CCSA Zora",
        exportedAt: new Date().toISOString(),
        organization: data.organization,
        metrics: data.metrics,
        mrv: data.mrv,
        fields: data.fields,
      },
      null,
      2,
    );
    const url = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `ccsa-zora-mrv-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="grid min-h-screen lg:grid-cols-[268px_1fr]">
        <aside className="hidden bg-zora-deep text-white lg:flex lg:flex-col">
          <Brand />
          <div className="px-4 pt-4">
            <div className="rounded-2xl border border-white/10 bg-white/7 p-3.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-50">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
                </span>
                Intelligence fabric online
              </div>
              <p className="mt-2 text-[11px] leading-4 text-emerald-50/55">
                Voice, climate, GIS, sensors, and KGML-Ag are connected.
              </p>
            </div>
          </div>
          <nav className="flex-1 space-y-1 p-3" aria-label="Primary navigation">
            {navigation.map(([label, target, Icon], index) => (
              <a
                key={target}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  index === 0
                    ? "bg-white text-zora-deep shadow-lg shadow-black/10"
                    : "text-emerald-50/70 hover:bg-white/8 hover:text-white"
                }`}
                href={`#${target}`}
              >
                <Icon className={`size-4 ${index === 0 ? "text-zora-forest" : ""}`} />
                {label}
              </a>
            ))}
          </nav>
          <div className="border-t border-white/10 p-4">
            <div className="rounded-2xl border border-white/10 bg-black/10 p-3.5">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <BadgeCheck className="size-4 text-zora-sun" />
                Trusted evidence memory
              </div>
              <p className="mt-1.5 text-[11px] leading-4 text-emerald-50/55">
                {data.metrics.signedRecordCount.toLocaleString()} signed records across this FIMS tenant.
              </p>
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border/80 bg-white/88 px-4 backdrop-blur-xl md:px-6">
            <Button aria-label="Open navigation" className="lg:hidden" size="icon" variant="ghost">
              <Menu />
            </Button>
            <div className="relative hidden max-w-lg flex-1 sm:block">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                aria-label="Search farms, farmers, or crops"
                className="h-10 w-full rounded-xl border border-input bg-zora-mist/50 pl-9 pr-3 text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-ring"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search farms, farmers, crops, evidence…"
                value={search}
              />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Badge variant={data.source === "demo" ? "warning" : "outline"}>
                {data.source === "demo" ? "Live product preview" : data.organization.name}
              </Badge>
              <Button aria-label="Refresh intelligence" onClick={() => dashboard.refetch()} size="icon" variant="ghost">
                <RefreshCw className={dashboard.isFetching ? "animate-spin" : ""} />
              </Button>
              <Button aria-label="Notifications" className="relative" size="icon" variant="ghost">
                <Bell />
                <span className="absolute right-2 top-2 size-1.5 rounded-full bg-zora-sun" />
              </Button>
            </div>
          </header>

          <div className="mx-auto max-w-[1680px] space-y-5 p-4 md:p-6">
            <section
              className="zora-panel-glow zora-grid relative overflow-hidden rounded-[1.3rem] border border-zora-forest/15 bg-white p-5 md:p-7"
              id="overview"
            >
              <div className="absolute -right-20 -top-28 size-72 rounded-full bg-zora-sun/15 blur-3xl" />
              <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-zora-forest">
                    <Sparkles className="size-4 text-zora-sun" />
                    Agricultural Super Intelligence
                  </div>
                  <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-[-0.035em] text-zora-deep md:text-4xl">
                    Every field can speak. Zora helps you listen.
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                    A multilingual digital extension officer for farmers, researchers, institutions, and climate-smart operations across Africa.
                  </p>
                </div>
                <div className="grid min-w-[330px] gap-2 sm:grid-cols-2">
                  <BriefStat label="Active fields" value={data.fields.length.toString()} icon={MapPinned} />
                  <BriefStat label="Languages" value="5 live" icon={Globe2} />
                  <BriefStat label="Sensor fabric" value={`${data.metrics.sensorAvailabilityPercent.toFixed(1)}%`} icon={RadioTower} />
                  <BriefStat label="Evidence trust" value="Verified" icon={ShieldCheck} />
                </div>
              </div>
            </section>

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Key agricultural metrics">
              <MetricCard icon={Leaf} label="Vegetation vitality" value={formatNumber(data.metrics.meanNdvi, 2)} detail="Portfolio mean NDVI" trend="+4.2% this cycle" />
              <MetricCard icon={CloudRain} label="Climate exposure" value={`${data.metrics.heatRiskDays} days`} detail="Heat-risk outlook" trend="Rain likely in 24h" tone="sun" />
              <MetricCard icon={RadioTower} label="Connected agriculture" value={`${data.sensors.reporting}/${data.sensors.total}`} detail="LPWAN nodes reporting" trend="Network stable" />
              <MetricCard icon={UsersRound} label="Extension reach" value="1,248" detail="Farmers with active guidance" trend="+86 this month" />
            </section>

            {selectedField ? (
              <section className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(340px,0.85fr)]">
                <Card className="overflow-hidden border-zora-forest/15 shadow-sm">
                  <CardHeader className="flex-row items-start justify-between border-b border-border bg-white">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zora-forest">Live spatial context</p>
                      <CardTitle className="mt-1">{selectedField.name}</CardTitle>
                      <CardDescription>Boundary, crop vitality, evidence, and operational hotspots</CardDescription>
                    </div>
                    <Badge variant="secondary">{selectedField.areaHectares.toFixed(1)} ha</Badge>
                  </CardHeader>
                  <CardContent className="h-[450px] p-0"><FieldMap field={selectedField} /></CardContent>
                </Card>
                <div className="space-y-4">
                  <DailyBrief field={selectedField} />
                  <FieldCondition field={selectedField} />
                </div>
              </section>
            ) : (
              <Card><CardContent className="p-8 text-center text-muted-foreground">No active field is available for this organization.</CardContent></Card>
            )}

            <section id="assistant">
              <ZoraAssistant fields={data.fields} />
            </section>

            <section className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(340px,0.7fr)]" id="climate">
              <Card className="border-zora-forest/15">
                <CardHeader className="flex-row items-start justify-between">
                  <div>
                    <CardTitle>Farm pulse</CardTitle>
                    <CardDescription>Seven-day vegetation and soil-moisture intelligence</CardDescription>
                  </div>
                  <div className="flex gap-3 text-[10px] font-semibold text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-field" />Vegetation</span>
                    <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-zora-sun" />Moisture</span>
                  </div>
                </CardHeader>
                <CardContent><FarmPulseChart /></CardContent>
              </Card>
              <KnowledgeGraphCard />
            </section>

            <section id="fields">
              <FieldTable fields={filteredFields} selectedFieldId={selectedField?.id ?? ""} select={setSelectedFieldId} />
            </section>

            <section className="grid gap-4 lg:grid-cols-2" id="mrv">
              <Card>
                <CardHeader>
                  <CardTitle>Connected farm network</CardTitle>
                  <CardDescription>LPWAN, satellite, and field-device operational health</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  <SmallMetric label="Reporting" value={data.sensors.reporting} />
                  <SmallMetric label="Total nodes" value={data.sensors.total} />
                  <SmallMetric label="Degraded" value={data.sensors.degraded} />
                  <SmallMetric label="Offline" value={data.sensors.offline} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex-row items-start justify-between">
                  <div>
                    <CardTitle>Impact and digital MRV</CardTitle>
                    <CardDescription>Evidence completeness and climate-finance readiness</CardDescription>
                  </div>
                  <Button onClick={exportMrv} size="sm" variant="outline"><Download />Export</Button>
                </CardHeader>
                <CardContent><MrvChecklist data={data} /></CardContent>
              </Card>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <div className="border-b border-white/10 px-4 py-3.5">
      <div className="flex h-12 items-center rounded-xl bg-white px-3">
        <Image alt="Zora - Your AI farming companion" className="h-auto w-[190px]" height={432} priority src="/brand/zora-wordmark.jpeg" width={1080} />
      </div>
      <p className="mt-2 px-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-emerald-50/45">Centre for Climate-Smart Agriculture</p>
    </div>
  );
}

function BriefStat({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Leaf }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-zora-forest/10 bg-zora-mist/80 p-3">
      <span className="flex size-9 items-center justify-center rounded-xl bg-white text-zora-forest shadow-sm"><Icon className="size-4" /></span>
      <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p><p className="text-sm font-bold text-zora-deep">{value}</p></div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, detail, trend, tone = "green" }: { icon: typeof Leaf; label: string; value: string; detail: string; trend: string; tone?: "green" | "sun" }) {
  return (
    <Card className="border-zora-forest/10 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
          <span className={`flex size-8 items-center justify-center rounded-xl ${tone === "sun" ? "bg-zora-sun/15 text-ochre-foreground" : "bg-zora-mist text-zora-forest"}`}><Icon className="size-4" /></span>
        </div>
        <p className="mt-2 text-2xl font-semibold tracking-tight text-zora-deep">{value}</p>
        <div className="mt-2 flex items-center justify-between gap-2 text-[11px]"><span className="text-muted-foreground">{detail}</span><span className="font-semibold text-field">{trend}</span></div>
      </CardContent>
    </Card>
  );
}

function DailyBrief({ field }: { field: FieldSummary }) {
  return (
    <Card className="overflow-hidden border-zora-forest/20 bg-zora-deep text-white">
      <CardHeader>
        <div className="flex items-center gap-2 text-zora-sun"><Bot className="size-4" /><span className="text-[10px] font-bold uppercase tracking-[0.16em]">Zora daily brief</span></div>
        <CardTitle className="text-white">Three actions need attention</CardTitle>
        <CardDescription className="text-emerald-50/60">Prioritized from field, climate, and evidence signals.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <ActionRow priority="Now" text={field.condition === "water_stress" ? "Inspect irrigation coverage in the western zone." : "Validate crop condition in the latest scouting zone."} />
        <ActionRow priority="24h" text="Delay fertilizer if rainfall probability remains above 70%." />
        <ActionRow priority="Week" text="Complete two missing MRV practice evidence records." />
      </CardContent>
    </Card>
  );
}

function ActionRow({ priority, text }: { priority: string; text: string }) {
  return (
    <div className="flex gap-3 rounded-xl border border-white/10 bg-white/7 p-3">
      <span className="mt-0.5 h-fit rounded-md bg-zora-sun px-2 py-1 text-[9px] font-black uppercase tracking-wider text-zora-deep">{priority}</span>
      <p className="text-xs leading-5 text-emerald-50/80">{text}</p>
    </div>
  );
}

function FieldCondition({ field }: { field: FieldSummary }) {
  return (
    <Card>
      <CardHeader><CardTitle>Field condition</CardTitle><CardDescription>Latest evidence-reviewed signals</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <Signal label="NDVI" value={formatNumber(field.ndvi, 2)} percent={(field.ndvi ?? 0) * 100} color="bg-field" />
        <Signal label="Soil moisture" value={field.soilMoisturePercent === null ? "No reading" : `${field.soilMoisturePercent.toFixed(1)}%`} percent={field.soilMoisturePercent ?? 0} color="bg-zora-sun" />
        <div className="rounded-xl border border-terra/20 bg-terra/8 p-3">
          <div className="flex gap-2"><Activity className="mt-0.5 size-4 text-terra" /><div><p className="text-xs font-semibold">Zora interpretation</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{conditionCopy(field.condition)}</p></div></div>
        </div>
      </CardContent>
    </Card>
  );
}

function Signal({ label, value, percent, color }: { label: string; value: string; percent: number; color: string }) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-xs"><span className="font-medium text-muted-foreground">{label}</span><span className="font-mono font-semibold">{value}</span></div>
      <div className="h-2 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} /></div>
    </div>
  );
}

function KnowledgeGraphCard() {
  const domains = ["Crops", "Diseases", "Soils", "Climate", "Pests", "Livestock", "Research", "Inputs"];
  return (
    <Card className="overflow-hidden border-zora-forest/15" id="knowledge">
      <CardHeader className="bg-zora-mist/70"><div className="flex items-center gap-2 text-zora-forest"><BrainCircuit className="size-5" /><CardTitle>KGML-Ag</CardTitle></div><CardDescription>Knowledge graph + machine learning for agriculture</CardDescription></CardHeader>
      <CardContent className="p-5">
        <div className="relative flex min-h-32 items-center justify-center">
          <div className="absolute size-28 rounded-full border border-zora-forest/15 bg-zora-mist" />
          <div className="relative z-10 text-center"><p className="text-2xl font-bold text-zora-deep">8</p><p className="text-[9px] font-bold uppercase tracking-[0.13em] text-zora-forest">Connected domains</p></div>
          {domains.slice(0, 4).map((domain, index) => <span className="absolute rounded-full border border-border bg-white px-2.5 py-1 text-[10px] font-semibold shadow-sm" key={domain} style={{ left: index % 2 ? "auto" : 0, right: index % 2 ? 0 : "auto", top: index < 2 ? 8 : "auto", bottom: index >= 2 ? 8 : "auto" }}>{domain}</span>)}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">{domains.slice(4).map((domain) => <Badge key={domain} variant="secondary">{domain}</Badge>)}</div>
        <p className="mt-4 text-xs leading-5 text-muted-foreground">Transparent, context-aware recommendations grounded in CCSA research, extension guides, field evidence, and climate data.</p>
      </CardContent>
    </Card>
  );
}

function MrvChecklist({ data }: { data: DashboardSnapshot }) {
  return (
    <div className="space-y-3">
      <Checklist label="Boundary validation" value={`${data.mrv.boundaryValidationPercent}%`} />
      <Checklist label="Practice evidence" value={`${data.mrv.practiceEvidenceComplete} / ${data.mrv.practiceEvidenceRequired}`} />
      <Checklist label="Sensor continuity" value={`${data.mrv.sensorContinuityPercent.toFixed(1)}%`} />
      <Checklist label="Verifier review" value={data.mrv.verifierStatus.replaceAll("_", " ")} />
    </div>
  );
}

function Checklist({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between border-b border-border pb-2 last:border-0"><span className="text-xs text-muted-foreground">{label}</span><span className="flex items-center gap-1.5 text-xs font-semibold capitalize"><FileCheck2 className="size-3.5 text-field" />{value}</span></div>;
}

function FieldTable({ fields, selectedFieldId, select }: { fields: FieldSummary[]; selectedFieldId: string; select: (id: string) => void }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-start justify-between border-b border-border">
        <div><CardTitle>FIMS farm intelligence</CardTitle><CardDescription>Select a field to update Zora's spatial and operational context.</CardDescription></div>
        <Badge variant="outline">{fields.length} managed fields</Badge>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-zora-mist/70 text-[10px] uppercase tracking-[0.12em] text-muted-foreground"><tr><th className="px-4 py-3">Field</th><th className="px-4 py-3">Crop</th><th className="px-4 py-3">Area</th><th className="px-4 py-3">NDVI</th><th className="px-4 py-3">Zora condition</th><th className="px-4 py-3">Last evidence</th></tr></thead>
            <tbody>{fields.map((field) => <tr className={`cursor-pointer border-t border-border transition hover:bg-zora-mist/60 ${selectedFieldId === field.id ? "bg-secondary/45" : ""}`} key={field.id} onClick={() => select(field.id)}><td className="px-4 py-3 font-semibold text-zora-deep">{field.name}</td><td className="px-4 py-3 text-muted-foreground">{field.cropCode ?? "—"}</td><td className="px-4 py-3">{field.areaHectares.toFixed(1)} ha</td><td className="px-4 py-3 font-mono">{formatNumber(field.ndvi, 2)}</td><td className="px-4 py-3"><Badge variant={field.condition === "healthy" ? "default" : field.condition === "inspect" ? "warning" : "alert"}>{field.condition.replaceAll("_", " ")}</Badge></td><td className="px-4 py-3 text-muted-foreground">{field.lastEvidenceAt ? formatRelative(field.lastEvidenceAt) : "No evidence"}</td></tr>)}</tbody>
          </table>
          {fields.length === 0 ? <p className="p-6 text-center text-sm text-muted-foreground">No fields match this search.</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}

function SmallMetric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-xl border border-border bg-zora-mist/40 p-4"><p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold text-zora-deep">{value}</p></div>;
}

function LoadingDashboard() {
  return <div className="flex min-h-screen items-center justify-center bg-zora-deep"><div className="text-center"><Image alt="Zora" className="mx-auto h-auto w-[88px] rounded-2xl" height={806} priority src="/brand/zora-square.jpeg" width={827} /><Sprout className="mx-auto mt-4 size-6 animate-pulse text-zora-sun" /><p className="mt-3 text-sm font-semibold text-emerald-50">Connecting Zora intelligence…</p></div></div>;
}

function DashboardError({ message, retry }: { message: string; retry: () => void }) {
  return <div className="flex min-h-screen items-center justify-center bg-background p-4"><Card className="max-w-md"><CardHeader><TriangleAlert className="mb-2 size-7 text-terra" /><CardTitle>Intelligence connection failed</CardTitle><CardDescription>{message}</CardDescription></CardHeader><CardContent className="flex gap-2"><Button onClick={retry}>Retry</Button><Button onClick={() => { window.location.href = "/login"; }} variant="outline">Sign in</Button></CardContent></Card></div>;
}

function formatNumber(value: number | null, digits: number) { return value === null ? "No data" : value.toFixed(digits); }
function formatRelative(value: string) { const minutes = Math.max(0, Math.round((Date.now() - Date.parse(value)) / 60_000)); if (minutes < 1) return "just now"; if (minutes < 60) return `${minutes} min ago`; const hours = Math.round(minutes / 60); if (hours < 24) return `${hours} hr ago`; return new Date(value).toLocaleDateString(); }
function conditionCopy(condition: FieldSummary["condition"]) { if (condition === "healthy") return "Vegetation and moisture signals are within the expected operating range."; if (condition === "water_stress") return "Prioritize a field inspection and validate irrigation coverage within 24 hours."; if (condition === "inspect") return "A scouting review is recommended before the next input application."; return "Evidence is too old for a confident recommendation; schedule a field observation."; }
