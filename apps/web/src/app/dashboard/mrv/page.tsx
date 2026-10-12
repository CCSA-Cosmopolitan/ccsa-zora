'use client';

import React, { useState } from 'react';
import {
  FileCheck2,
  ShieldCheck,
  CheckCircle2,
  Download,
  Copy,
  Check,
  ExternalLink,
  Award,
  Layers,
  Lock,
} from 'lucide-react';
import { Button } from '@ccsa-zora/ui/components/button';

const MRV_RECORDS = [
  {
    id: 'MRV-2026-001',
    fieldName: 'North Ridge Maize (Zaria)',
    practice: 'Reduced Tillage + 60% Crop Residue Retention',
    hectares: 42.8,
    carbonOffset: '+1.84 tCO₂e/ha/yr',
    totalTco2e: '78.7 tCO₂e',
    merkleRoot: '0x8f4b19e20a4b732d89fa3114b09e24a87c1240f93e110b981',
    evidenceCount: '4 On-Site Photographs (SHA-256 Hash Matched)',
    status: 'Verified',
    issuedAt: 'Oct 8, 2026',
  },
  {
    id: 'MRV-2026-002',
    fieldName: 'Sunrise Soybeans (Kaduna)',
    practice: 'Legume Biological Nitrogen Fixation + Biochar Inoculation',
    hectares: 38.5,
    carbonOffset: '+2.10 tCO₂e/ha/yr',
    totalTco2e: '80.8 tCO₂e',
    merkleRoot: '0xe29c80fa312480b1974ef901235687ab241289fe09bc2456',
    evidenceCount: '6 In-Field Observations (GPS Timestamped)',
    status: 'Verified',
    issuedAt: 'Oct 10, 2026',
  },
  {
    id: 'MRV-2026-003',
    fieldName: 'River Bend Rice (Makurdi)',
    practice: 'Alternate Wetting & Drying (AWD) Methane Abatement',
    hectares: 31.2,
    carbonOffset: '+3.45 tCO₂e/ha/yr',
    totalTco2e: '107.6 tCO₂e',
    merkleRoot: '0x712fa980ebc198762340abef91234908efc78192a0129845',
    evidenceCount: '3 Hydrological Probe Logs (HMAC Signed)',
    status: 'Audit Review',
    issuedAt: 'Pending Verifier Signature',
  },
];

export default function DigitalMrvPage() {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-2 border-b border-emerald-950/60">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-[10px] font-bold text-emerald-400 mb-1.5">
            <ShieldCheck className="size-3" />
            <span>Digital MRV & Cryptographic Practice Verification</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
            Digital MRV & Carbon Accounting
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Tamper-proof practice verification, Merkle audit chains, and institutional carbon credit certificates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => alert('Exporting full Merkle Proof audit bundle (JSON)...')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 rounded-xl shadow-xs"
          >
            <Download className="size-3.5 mr-1.5" />
            Export Audit Ledger
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0A1624] border border-emerald-950/80 space-y-1 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Verified Carbon Removal</span>
          <p className="text-2xl font-black text-emerald-400">267.1 <span className="text-sm font-semibold text-slate-400">tCO₂e</span></p>
          <p className="text-[11px] text-slate-500">Across 112.5 verified smallholder hectares</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0A1624] border border-emerald-950/80 space-y-1 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Cryptographic Integrity</span>
          <p className="text-2xl font-black text-white">100% Valid</p>
          <p className="text-[11px] text-slate-500">Zero SHA-256 evidence discrepancies</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0A1624] border border-emerald-950/80 space-y-1 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Verification Authority</span>
          <p className="text-lg font-bold text-slate-200">CCSA Cosmopolitan</p>
          <p className="text-[11px] text-slate-500">Accredited university carbon auditing body</p>
        </div>
      </div>

      {/* Attested Records Table */}
      <div className="p-6 rounded-2xl bg-[#0A1624] border border-emerald-950/80 space-y-4 shadow-xs">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-white">Attested Climate-Smart Practice Ledger</h3>
            <p className="text-[11px] text-slate-400">
              Each record represents an on-farm practice certified with mobile photo evidence and satellite verification.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400">2 Verified • 1 Pending Audit</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#070F18]">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="p-3">Certificate ID</th>
                <th className="p-3">Field & Cluster</th>
                <th className="p-3">Approved Climate Practice</th>
                <th className="p-3">Carbon Yield</th>
                <th className="p-3">Evidence Chain</th>
                <th className="p-3">Status</th>
                <th className="p-3">Merkle Proof</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {MRV_RECORDS.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-3 font-mono font-bold text-white">{rec.id}</td>
                  <td className="p-3 text-slate-200">{rec.fieldName}</td>
                  <td className="p-3 text-slate-300 font-medium">{rec.practice}</td>
                  <td className="p-3 font-mono font-bold text-emerald-400">{rec.totalTco2e}</td>
                  <td className="p-3 text-slate-400">{rec.evidenceCount}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        rec.status === 'Verified'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {rec.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => copyHash(rec.merkleRoot)}
                      className="font-mono text-[10px] text-slate-400 hover:text-emerald-400 flex items-center gap-1"
                      title={rec.merkleRoot}
                    >
                      <span>{rec.merkleRoot.slice(0, 10)}...</span>
                      {copiedHash === rec.merkleRoot ? (
                        <Check className="size-3 text-emerald-400" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
