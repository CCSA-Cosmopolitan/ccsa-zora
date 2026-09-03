import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BrainCircuit, Code, Database, Layers, Lock, ShieldCheck } from "lucide-react";

import { Button } from "@ccsa-zora/ui/components/button";

export const metadata: Metadata = {
  title: "KGML Science & Technology | CCSA Zora",
  description: "Technical stack overview of CCSA Zora monorepo, Next.js 16.2, FastAPI KGML-Ag, Neon PostGIS, and Drizzle ORM.",
};

export default function TechnologyPage() {
  return (
    <div className="bg-[#0a0b0d] text-stone-100 font-sans antialiased min-h-screen py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4 font-mono">
          <span className="text-xs uppercase tracking-widest text-emerald-400 block font-bold">
            [ ARCHITECTURE & SCIENCE ]
          </span>
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl tracking-tight">
            Technology & Science Stack
          </h1>
          <p className="text-neutral-400 text-sm leading-relaxed font-sans">
            Built on modern, production-grade monorepo architecture, type-safe data modeling, and transparent science reasoning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
          <div className="border border-neutral-800 bg-[#0d0e10] p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-neutral-900 border border-neutral-700 text-emerald-400">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">Monorepo & Web Frontend</h3>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed font-sans">
              Managed via <strong>pnpm workspaces</strong> and <strong>Turborepo</strong>. The Command Centre web dashboard is built using <strong>Next.js 16.2</strong>, React 19, Tailwind CSS, and MapLibre GL for spatial polygon visualization.
            </p>
          </div>

          <div className="border border-neutral-800 bg-[#0d0e10] p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-neutral-900 border border-neutral-700 text-cyan-400">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">KGML-Ag Intelligence API</h3>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed font-sans">
              Python <strong>FastAPI</strong> microservice encapsulating Knowledge-Grounded Machine Learning. Combines soil physics constraints with statistical learning to compute Soil Organic Carbon (SOC) stock changes.
            </p>
          </div>

          <div className="border border-neutral-800 bg-[#0d0e10] p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-neutral-900 border border-neutral-700 text-purple-400">
                <Database className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">PostgreSQL + PostGIS & Drizzle ORM</h3>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed font-sans">
              Serverless PostgreSQL on <strong>Neon</strong> with PostGIS extensions for spatial MultiPolygon calculations. Schema defined using <strong>Drizzle ORM</strong> with Supabase RLS policies and immutable record triggers.
            </p>
          </div>

          <div className="border border-neutral-800 bg-[#0d0e10] p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-neutral-900 border border-neutral-700 text-teal-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">Cryptographic Audit Hashes</h3>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed font-sans">
              Every photo taken in the Expo mobile app is hashed on-device with SHA-256 before upload. Modifying carbon status appends a new hash-chained record citing the previous event hash.
            </p>
          </div>
        </div>

        <div className="text-center pt-4 font-mono">
          <Link href="/dashboard">
            <Button className="border border-neutral-700 bg-white text-black hover:bg-neutral-200 font-mono text-xs uppercase tracking-wider px-8 h-12 rounded-none font-bold">
              Launch Command Centre <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
