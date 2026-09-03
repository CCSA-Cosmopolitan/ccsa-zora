import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Cpu, Database, MapPinned, MessageSquare, ShieldCheck } from "lucide-react";

import { Button } from "@ccsa-zora/ui/components/button";

export const metadata: Metadata = {
  title: "Device & IoT Pipeline | CCSA Zora",
  description: "End-to-end operational pipeline from voice capture to spatial mapping, KGML-Ag inference, and tamper-evident audit.",
};

export default function HowItWorksPage() {
  return (
    <div className="bg-[#0a0b0d] text-stone-100 font-sans antialiased min-h-screen py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4 font-mono">
          <span className="text-xs uppercase tracking-widest text-emerald-400 block font-bold">
            [ OPERATIONAL PIPELINE ]
          </span>
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl tracking-tight">
            How Zora Intelligence Operates
          </h1>
          <p className="text-neutral-400 text-sm leading-relaxed font-sans">
            From rural offline voice capture to PostGIS boundary resolution, soil carbon inference, and tamper-proof verification.
          </p>
        </div>

        <div className="space-y-8 max-w-4xl mx-auto font-sans">
          {/* Step 1 */}
          <div className="flex flex-col md:flex-row gap-6 p-8 border border-neutral-800 bg-[#0d0e10] items-start">
            <div className="p-3.5 bg-neutral-900 border border-neutral-700 text-emerald-400 flex-shrink-0">
              <MessageSquare className="h-7 w-7" />
            </div>
            <div className="space-y-3 font-mono">
              <span className="text-[10px] uppercase tracking-widest px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-500/30 inline-block font-bold">
                STEP 1 • VOICE & OFFLINE CAPTURE
              </span>
              <h3 className="text-2xl font-bold text-white tracking-tight">Multilingual Field Ingestion</h3>
              <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                Smallholder farmers ask questions in Hausa, Yorùbá, Igbo, Fulfulde, or English. Extension agents use Expo Companion app offline to log farm observations, take photo evidence (hashed instantly on-device via SHA-256), and store records in a local SQLite outbox queue.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col md:flex-row gap-6 p-8 border border-neutral-800 bg-[#0d0e10] items-start">
            <div className="p-3.5 bg-neutral-900 border border-neutral-700 text-cyan-400 flex-shrink-0">
              <MapPinned className="h-7 w-7" />
            </div>
            <div className="space-y-3 font-mono">
              <span className="text-[10px] uppercase tracking-widest px-2.5 py-1 bg-cyan-950 text-cyan-300 border border-cyan-500/30 inline-block font-bold">
                STEP 2 • SPATIAL & TELEMETRY RESOLUTION
              </span>
              <h3 className="text-2xl font-bold text-white tracking-tight">PostGIS Remote Sensing Correlation</h3>
              <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                When network coverage restores, the outbox sync engine pushes boundaries to Neon PostgreSQL + PostGIS. Spatial algorithms overlay field MultiPolygons with satellite vegetation vitality (NDVI) indices and HMAC-signed LPWAN IoT node sensors.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col md:flex-row gap-6 p-8 border border-neutral-800 bg-[#0d0e10] items-start">
            <div className="p-3.5 bg-neutral-900 border border-neutral-700 text-purple-400 flex-shrink-0">
              <Cpu className="h-7 w-7" />
            </div>
            <div className="space-y-3 font-mono">
              <span className="text-[10px] uppercase tracking-widest px-2.5 py-1 bg-purple-950 text-purple-300 border border-purple-500/30 inline-block font-bold">
                STEP 3 • KGML-AG SCIENCE REASONING
              </span>
              <h3 className="text-2xl font-bold text-white tracking-tight">Soil Carbon & Advisory Inference</h3>
              <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                FastAPI KGML-Ag service consumes field features (baseline SOC, bulk density, sampling depth, cover crop, tillage). It calculates Soil Organic Carbon stock changes (tC/ha) and tCO₂e removal estimates with transparent scientific citations.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col md:flex-row gap-6 p-8 border border-neutral-800 bg-[#0d0e10] items-start">
            <div className="p-3.5 bg-neutral-900 border border-neutral-700 text-teal-400 flex-shrink-0">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div className="space-y-3 font-mono">
              <span className="text-[10px] uppercase tracking-widest px-2.5 py-1 bg-teal-950 text-teal-300 border border-teal-500/30 inline-block font-bold">
                STEP 4 • CRYPTOGRAPHIC AUDIT VAULT
              </span>
              <h3 className="text-2xl font-bold text-white tracking-tight">Append-Only MRV Hash Chain</h3>
              <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                Modifications to carbon status write to an append-only cryptographic event log (<code className="text-emerald-400">carbon_certificate_events</code>). Each event includes a SHA-256 hash chaining to the previous event hash. Carbon verifiers inspect these records before certificate issuance.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center pt-4 font-mono">
          <Link href="/dashboard">
            <Button className="border border-neutral-700 bg-white text-black hover:bg-neutral-200 font-mono text-xs uppercase tracking-wider px-8 h-12 rounded-none font-bold">
              Try Interactive Command Centre <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
