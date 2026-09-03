import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, ShieldCheck, Sprout, UsersRound } from "lucide-react";

import { Button } from "@ccsa-zora/ui/components/button";

export const metadata: Metadata = {
  title: "Stakeholder Solutions | CCSA Zora",
  description: "Impact use cases for smallholder farmers, extension agents, agronomists, and carbon credit verifiers.",
};

export default function WhoItServesPage() {
  return (
    <div className="bg-[#0a0b0d] text-stone-100 font-sans antialiased min-h-screen py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4 font-mono">
          <span className="text-xs uppercase tracking-widest text-purple-400 block font-bold">
            [ STAKEHOLDER ECOSYSTEM ]
          </span>
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl tracking-tight">
            Who Zora Empowers
          </h1>
          <p className="text-neutral-400 text-sm leading-relaxed font-sans">
            Bridging rural field reality with institutional governance and global carbon credit markets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="border border-neutral-800 bg-[#0d0e10] p-8 space-y-6 flex flex-col justify-between font-mono">
            <div className="space-y-4">
              <div className="p-3.5 bg-neutral-900 border border-neutral-700 text-emerald-400 w-fit">
                <Sprout className="h-7 w-7" />
              </div>
              <span className="text-[10px] uppercase tracking-widest px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-500/30 inline-block font-bold">
                SMALLHOLDER FARMERS
              </span>
              <h3 className="text-2xl font-bold text-white tracking-tight">Multilingual Voice Advisory</h3>
              <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                Farmers in remote agricultural zones ask questions in their native language (Hausa, Yorùbá, Igbo, Fulfulde). Zora provides natural speech playback, overriding literacy barriers and giving immediate steps for crop disease, pest control, and weather safety.
              </p>
            </div>
            <ul className="space-y-2 pt-4 border-t border-neutral-800 text-xs font-sans text-neutral-300">
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Voice recognition & speech synthesis</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Actionable 3-step field instructions</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Climate risk alerts & weather warnings</li>
            </ul>
          </div>

          {/* Card 2 */}
          <div className="border border-neutral-800 bg-[#0d0e10] p-8 space-y-6 flex flex-col justify-between font-mono">
            <div className="space-y-4">
              <div className="p-3.5 bg-neutral-900 border border-neutral-700 text-cyan-400 w-fit">
                <UsersRound className="h-7 w-7" />
              </div>
              <span className="text-[10px] uppercase tracking-widest px-2.5 py-1 bg-cyan-950 text-cyan-300 border border-cyan-500/30 inline-block font-bold">
                FIELD EXTENSION AGENTS
              </span>
              <h3 className="text-2xl font-bold text-white tracking-tight">Offline Scouting & GPS Mapping</h3>
              <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                Extension officers operating in off-grid rural areas use the mobile companion app to plot farm boundary polygons, log soil conditions, and capture photo evidence with on-device SHA-256 hashes before syncing with the cloud.
              </p>
            </div>
            <ul className="space-y-2 pt-4 border-t border-neutral-800 text-xs font-sans text-neutral-300">
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-400" /> Offline Expo SQLite storage</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-400" /> On-device camera photo hashing</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-400" /> Idempotent outbox queue synchronization</li>
            </ul>
          </div>

          {/* Card 3 */}
          <div className="border border-neutral-800 bg-[#0d0e10] p-8 space-y-6 flex flex-col justify-between font-mono">
            <div className="space-y-4">
              <div className="p-3.5 bg-neutral-900 border border-neutral-700 text-purple-400 w-fit">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <span className="text-[10px] uppercase tracking-widest px-2.5 py-1 bg-purple-950 text-purple-300 border border-purple-500/30 inline-block font-bold">
                CARBON VERIFIERS & INSTITUTIONS
              </span>
              <h3 className="text-2xl font-bold text-white tracking-tight">Tamper-Proof Audit Vault</h3>
              <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                Institutional operators and verifiers audit field events, compare satellite vegetation index trends with IoT sensor telemetry, and confirm SHA-256 hash chains before signing soil carbon certificates.
              </p>
            </div>
            <ul className="space-y-2 pt-4 border-t border-neutral-800 text-xs font-sans text-neutral-300">
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-purple-400" /> Append-only cryptographic event logs</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-purple-400" /> Transparent scientific trace citations</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-purple-400" /> Exportable MRV JSON certificates</li>
            </ul>
          </div>
        </div>

        <div className="text-center pt-4 font-mono">
          <Link href="/request-access">
            <Button className="border border-neutral-700 bg-white text-black hover:bg-neutral-200 font-mono text-xs uppercase tracking-wider px-8 h-12 rounded-none font-bold">
              Request Institutional Access <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
