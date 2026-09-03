import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BrainCircuit,
  FileCheck2,
  Globe2,
  Languages,
  Leaf,
  Lock,
  MapPinned,
  MessageCircleMore,
  RadioTower,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Button } from "@ccsa-zora/ui/components/button";

export const metadata: Metadata = {
  title: "Platform Matrix | CCSA Zora",
  description: "Comprehensive capabilities matrix of CCSA Zora digital extension, spatial maps, and KGML-Ag engine.",
};

const fullMatrix = [
  {
    icon: Languages,
    title: "Multilingual Advisory",
    description: "Generates localized agronomic feedback in Hausa (ha), Yorùbá (yo), Igbo (ig), Fulfulde (ff), and English (en).",
    details: "Translates technical nitrogen, pest, and climate risks into clear localized steps accessible to all farmers.",
  },
  {
    icon: MessageCircleMore,
    title: "Voice & Audio Synthesis",
    description: "Supports Speech Recognition API and native audio playback for hands-free field usage.",
    details: "Bypasses literacy barriers in rural agricultural zones through voice audio output.",
  },
  {
    icon: MapPinned,
    title: "Geospatial & NDVI Mapping",
    description: "PostGIS MultiPolygon boundaries with real-time vegetation vitality index overlay.",
    details: "Renders satellite health indicators and field polygon boundaries with sub-meter spatial precision.",
  },
  {
    icon: BrainCircuit,
    title: "KGML-Ag Science Engine",
    description: "Combines soil science rules with machine learning for Soil Organic Carbon (SOC) stock estimations.",
    details: "Outputs transparent scientific traces, 95% confidence intervals, and reference stock changes.",
  },
  {
    icon: RadioTower,
    title: "Signed IoT Telemetry Ingestion",
    description: "Ingests HMAC-signed telemetry from LoRaWAN and NB-IoT field sensors.",
    details: "Verifies sensor payload integrity and soil moisture readings before entering the data pipeline.",
  },
  {
    icon: Lock,
    title: "Evidence Cryptography Vault",
    description: "On-device computation of SHA-256 hashes of field scouting photo evidence.",
    details: "Guarantees untampered media files are uploaded to private Supabase storage for verifiers.",
  },
];

export default function CapabilitiesPage() {
  return (
    <div className="bg-[#0a0b0d] text-stone-100 font-sans antialiased min-h-screen py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4 font-mono">
          <span className="text-xs uppercase tracking-widest text-emerald-400 block font-bold">
            [ SYSTEM MATRIX ]
          </span>
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl tracking-tight">
            Platform Capabilities
          </h1>
          <p className="text-neutral-400 text-sm leading-relaxed font-sans">
            CCSA Zora integrates multi-modal voice AI, spatial remote sensing, soil science, and cryptographic auditability into an enterprise agricultural architecture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono">
          {fullMatrix.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="border border-neutral-800 bg-[#0d0e10] p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="p-3 bg-neutral-900 border border-neutral-700 text-emerald-400 w-fit">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">{item.title}</h3>
                  <p className="text-xs text-emerald-400 font-sans">{item.description}</p>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed font-sans pt-3 border-t border-neutral-900">
                  {item.details}
                </p>
              </div>
            );
          })}
        </div>

        <div className="border border-neutral-800 bg-[#0d0e10] p-10 text-center space-y-4 max-w-3xl mx-auto font-mono">
          <h3 className="text-2xl font-bold text-white tracking-tight">Experience Zora Capabilities Live</h3>
          <p className="text-xs text-neutral-400 font-sans">
            Access the Zora Command Centre to interact with spatial maps, test advisory queries, and inspect MRV certificate streams.
          </p>
          <div className="pt-2">
            <Link href="/dashboard">
              <Button className="border border-neutral-700 bg-white text-black hover:bg-neutral-200 font-mono text-xs uppercase tracking-wider px-6 h-11 rounded-none font-bold">
                Go to Command Centre <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
