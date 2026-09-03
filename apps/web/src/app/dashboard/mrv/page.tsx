"use client";

import { Download, FileCheck2, Lock, ShieldCheck } from "lucide-react";

import { Badge } from "@ccsa-zora/ui/components/badge";
import { Button } from "@ccsa-zora/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ccsa-zora/ui/components/card";
import { useDashboard } from "@/hooks/use-dashboard";

export default function MrvPage() {
  const dashboard = useDashboard();

  if (dashboard.isLoading) {
    return <div className="flex h-96 items-center justify-center text-sm text-slate-400">Loading MRV audit certificate stream…</div>;
  }

  if (dashboard.isError || !dashboard.data) {
    return <div className="text-center text-sm text-red-400 p-8">Unable to load MRV certificate log.</div>;
  }

  const data = dashboard.data;
  const mrv = data.mrv;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <FileCheck2 className="h-6 w-6 text-teal-400" />
            Impact & Cryptographic MRV Vault
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tamper-evident audit trails, append-only SHA-256 event chains, and verifiable soil carbon certificates.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            const blob = new Blob([JSON.stringify(mrv, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `zora-mrv-audit-certificate.json`;
            a.click();
          }}
          className="bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs"
        >
          <Download className="h-4 w-4 mr-1.5" /> Export MRV Certificate JSON
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900/80 border-slate-800 p-5 space-y-3">
          <span className="text-xs font-semibold text-slate-400">Verifier Status</span>
          <p className="text-2xl font-black text-emerald-400">{mrv.verifierStatus.toUpperCase()}</p>
          <Badge className="bg-emerald-950 text-emerald-300">Third-Party Audited</Badge>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800 p-5 space-y-3">
          <span className="text-xs font-semibold text-slate-400">Sequestration Removal</span>
          <p className="text-2xl font-black text-cyan-400">{data.metrics.verifiedRemovalsTco2e} tCO₂e</p>
          <Badge className="bg-cyan-950 text-cyan-300">Verified Removals</Badge>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800 p-5 space-y-3">
          <span className="text-xs font-semibold text-slate-400">Boundary Validation</span>
          <p className="text-2xl font-black text-purple-400">{mrv.boundaryValidationPercent}%</p>
          <Badge className="bg-purple-950 text-purple-300">PostGIS Polygon Proof</Badge>
        </Card>
      </div>

      {/* Audit Readiness Progress Card */}
      <Card className="bg-slate-900/80 border-slate-800">
        <CardHeader className="border-b border-slate-800 pb-4">
          <CardTitle className="text-base font-bold text-white flex items-center justify-between">
            <span>MRV Practice Evidence Audit Vault</span>
            <Badge variant="outline" className="border-teal-500/40 text-teal-300 text-xs font-mono">
              SHA-256 Chained
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
            <div className="flex justify-between text-slate-400 border-b border-slate-900 pb-2">
              <span>Practice Evidence Completed:</span>
              <span className="text-emerald-400 font-bold">{mrv.practiceEvidenceComplete} / {mrv.practiceEvidenceRequired} Photos Hashed</span>
            </div>
            <div className="flex justify-between text-slate-400 border-b border-slate-900 pb-2">
              <span>Sensor Continuity Index:</span>
              <span className="text-cyan-400 font-bold">{mrv.sensorContinuityPercent}% Availability</span>
            </div>
            <div className="flex justify-between text-slate-400 border-b border-slate-900 pb-2">
              <span>Signed Audit Records:</span>
              <span className="text-purple-400 font-bold">{data.metrics.signedRecordCount} Hash Signed Events</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
