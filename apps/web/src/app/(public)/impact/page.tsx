import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BarChart3, FileCheck2, Leaf, ShieldCheck, TrendingUp } from "lucide-react";

import { Button } from "@ccsa-zora/ui/components/button";

export const metadata: Metadata = {
  title: "MRV Audit & Impact | CCSA Zora",
  description: "Measurement, Reporting, and Verification (MRV) of Soil Organic Carbon sequestration and climate resilience.",
};

export default function ImpactPage() {
  return (
    <div className="bg-[#0a0b0d] text-stone-100 font-sans antialiased min-h-screen py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4 font-mono">
          <span className="text-xs uppercase tracking-widest text-teal-400 block font-bold">
            [ CLIMATE FINANCE & MRV ]
          </span>
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl tracking-tight">
            Climate Impact & MRV Verification
          </h1>
          <p className="text-neutral-400 text-sm leading-relaxed font-sans">
            Verifiable Measurement, Reporting, and Verification (MRV) connecting smallholder practices to global climate finance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center font-mono">
          <div className="border border-neutral-800 bg-[#0d0e10] p-8 space-y-3">
            <p className="text-4xl font-black text-emerald-400">89.4 tCO₂e</p>
            <h3 className="text-base font-bold text-white tracking-tight uppercase">Estimated Removal</h3>
            <p className="text-xs text-neutral-400 font-sans">Total soil organic carbon stock change calculated for registered demo fields.</p>
          </div>

          <div className="border border-neutral-800 bg-[#0d0e10] p-8 space-y-3">
            <p className="text-4xl font-black text-cyan-400">100% Audit</p>
            <h3 className="text-base font-bold text-white tracking-tight uppercase">Hash Chain Proof</h3>
            <p className="text-xs text-neutral-400 font-sans">Every event includes a SHA-256 hash referencing the previous event log.</p>
          </div>

          <div className="border border-neutral-800 bg-[#0d0e10] p-8 space-y-3">
            <p className="text-4xl font-black text-teal-400">5 Dialects</p>
            <h3 className="text-base font-bold text-white tracking-tight uppercase">Local Accessibility</h3>
            <p className="text-xs text-neutral-400 font-sans">Enabling smallholder climate adaptation across major West African languages.</p>
          </div>
        </div>

        <div className="border border-neutral-800 bg-[#0d0e10] p-10 max-w-4xl mx-auto space-y-6 font-mono">
          <h3 className="text-2xl font-bold text-white tracking-tight">Tamper-Proof MRV Event Chaining</h3>
          <p className="text-xs text-neutral-300 leading-relaxed font-sans">
            The platform operates on append-only event logs (<code className="text-emerald-400">carbon_certificate_events</code>). Any attempt to alter historical certificate status invalidates the subsequent event hash chain, providing carbon credit buyers and verifiers with complete operational transparency.
          </p>
          <div className="pt-2">
            <Link href="/dashboard/mrv">
              <Button className="border border-neutral-700 bg-white text-black hover:bg-neutral-200 font-mono text-xs uppercase tracking-wider px-6 h-11 rounded-none font-bold">
                Inspect Live MRV Certificates <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
