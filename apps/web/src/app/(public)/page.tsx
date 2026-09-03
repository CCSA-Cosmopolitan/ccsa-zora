import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  CloudRain,
  Cpu,
  Database,
  FileCheck2,
  Globe2,
  Languages,
  Leaf,
  Lock,
  MapPinned,
  RadioTower,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Button } from "@ccsa-zora/ui/components/button";
import { InteractiveAiSandbox } from "@/features/home/interactive-ai-sandbox";

export const metadata: Metadata = {
  title: "AI-Powered Field Intelligence | CCSA Zora",
  description:
    "Monitor crop health, detect risks early, and make better agronomic decisions with real-time data - all in one intelligent platform.",
};

export default function LandingPage() {
  return (
    <div className="bg-[#0a0b0d] text-stone-100 font-sans antialiased overflow-hidden">
      {/* 1. HERO SECTION (Directly inspired by Screenshot 1) */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8 pt-16 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
          {/* Left Column: Eyebrow + Subtext */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-2 font-mono text-xs text-neutral-400 uppercase tracking-widest">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>@CCSA ZORA SOLUTION</span>
            </div>

            <p className="text-neutral-400 text-sm leading-relaxed max-w-md font-sans">
              Monitor crop health, detect risks early, and make better decisions with real-time data - all in one <span className="font-mono text-white">[intelligent platform]</span>.
            </p>

            <div className="flex items-center gap-4 pt-2">
              <Link href="/dashboard">
                <Button className="border border-neutral-700 bg-white text-black hover:bg-neutral-200 font-mono text-xs uppercase tracking-wider px-6 h-12 rounded-none font-bold">
                  Get Started <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/capabilities">
                <Button variant="outline" className="border-neutral-800 bg-transparent text-neutral-300 hover:bg-neutral-900 font-mono text-xs uppercase tracking-wider px-6 h-12 rounded-none">
                  Explore Device
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: Massive Headline */}
          <div className="lg:col-span-7">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight text-white leading-[1.05]">
              AI-Powered <br />
              <span className="font-extrabold text-white">Field Intelligence</span>
            </h1>
          </div>
        </div>
      </section>

      {/* 2. FEATURED SPLIT CONTRAST BLOCK (Directly inspired by Screenshot 1 bottom half) */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 overflow-hidden rounded-none border border-neutral-800">
          {/* Left Cream Box */}
          <div className="lg:col-span-4 bg-[#f4f3ed] text-neutral-950 p-10 lg:p-14 flex flex-col justify-between space-y-12">
            <div className="space-y-4">
              <span className="font-mono text-xs uppercase tracking-widest text-neutral-600 block">
                • POWERED BY REAL FIELD SENSORS
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-neutral-950 leading-tight">
                Captured Directly in the Field
              </h2>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-neutral-700 leading-relaxed font-sans">
                Deployed LPWAN hardware nodes measure volumetric water content, soil temperature, and nutrient leaching in real-time.
              </p>
              <Link href="/how-it-works" className="inline-block font-mono text-xs uppercase tracking-widest text-neutral-950 font-bold border-b-2 border-neutral-950 pb-0.5 hover:text-emerald-700 hover:border-emerald-700 transition-colors">
                LEARN MORE
              </Link>
            </div>
          </div>

          {/* Right Image Box with Telemetry HUD Overlay */}
          <div className="lg:col-span-8 relative min-h-[400px] bg-neutral-900 overflow-hidden">
            <Image
              src="/images/zora-sensor.jpg"
              alt="Zora Smart IoT Soil Sensor Node"
              fill
              className="object-cover"
              priority
            />

            {/* Circular Telemetry HUD Overlays (Matching Screenshot 1 HUD design) */}
            <div className="absolute top-6 left-6 backdrop-blur-xl bg-black/60 border border-white/20 p-4 rounded-full text-center w-36 h-36 flex flex-col items-center justify-center space-y-1 text-white">
              <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">10:15 • MOISTURE</span>
              <span className="font-mono text-3xl font-black text-emerald-400">74%</span>
              <span className="font-mono text-[8px] text-neutral-400 uppercase">NEXT IRR: 6H</span>
            </div>

            <div className="absolute bottom-6 right-6 backdrop-blur-xl bg-black/60 border border-white/20 p-4 rounded-full text-center w-36 h-36 flex flex-col items-center justify-center space-y-1 text-white">
              <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">10:15 • HEAT PEAK</span>
              <span className="font-mono text-3xl font-black text-emerald-400">16.5°</span>
              <span className="font-mono text-[8px] text-neutral-400 uppercase">TEMP OPTIMAL</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DRONE SCANNING & PRECISION AGRICULTURE (Inspired by Screenshot 3 & 2) */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <div className="relative rounded-none border border-neutral-800 bg-neutral-950 overflow-hidden">
          <div className="relative h-[480px] w-full">
            <Image
              src="/images/zora-drone.jpg"
              alt="Autonomous Drone Crop Scanning"
              fill
              className="object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b0d] via-transparent to-black/40" />

            {/* Floating Glass Pill Callout (Screenshot 3 style) */}
            <div className="absolute bottom-10 left-10 max-w-lg backdrop-blur-2xl bg-black/80 border border-neutral-700/80 p-8 rounded-none space-y-4">
              <span className="font-mono text-xs uppercase tracking-widest text-emerald-400 block">
                [ PRECISION REMOTE SENSING ]
              </span>
              <h3 className="text-3xl font-bold text-white tracking-tight leading-tight">
                Smart Farming with AI for Better Yields
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                Use advanced multi-spectral imaging to monitor vegetation indices, forecast yield parameters, and optimize fertilizer placement.
              </p>
              <div className="pt-2">
                <Link href="/capabilities">
                  <Button className="border border-neutral-700 bg-white text-black hover:bg-neutral-200 font-mono text-xs uppercase tracking-wider px-5 h-10 rounded-none font-bold">
                    View Capabilities <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Floating Pill Telemetry Indicators (Screenshot 2 style) */}
            <div className="absolute top-8 right-8 hidden sm:flex flex-col gap-3">
              <div className="backdrop-blur-xl bg-emerald-950/80 border border-emerald-500/40 px-4 py-2 rounded-full flex items-center gap-3 text-xs text-emerald-300 font-mono">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span>93% Plant Health Index</span>
              </div>
              <div className="backdrop-blur-xl bg-cyan-950/80 border border-cyan-500/40 px-4 py-2 rounded-full flex items-center gap-3 text-xs text-cyan-300 font-mono">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                <span>86% Water Retention Depth</span>
              </div>
              <div className="backdrop-blur-xl bg-purple-950/80 border border-purple-500/40 px-4 py-2 rounded-full flex items-center gap-3 text-xs text-purple-300 font-mono">
                <span className="h-2 w-2 rounded-full bg-purple-400" />
                <span>+1.4 tC/ha Carbon Removal</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FIELD SCOUTING & MULTILINGUAL AI SECTION */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Scouting Photo */}
          <div className="lg:col-span-6 relative h-[450px] border border-neutral-800 overflow-hidden">
            <Image
              src="/images/zora-scouting.jpg"
              alt="Extension Agent Field Scouting"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 font-mono text-xs text-neutral-300 space-y-1">
              <p className="font-bold text-white uppercase text-sm">Offline Field Scouting & Photo Hashing</p>
              <p className="text-neutral-400 text-[11px]">SHA-256 evidence hashing directly on device before cloud synchronization.</p>
            </div>
          </div>

          {/* Right Interactive AI Sandbox Component */}
          <div className="lg:col-span-6 space-y-4">
            <div className="font-mono text-xs text-neutral-400 uppercase tracking-widest flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>MULTILINGUAL VOICE DIALECT ENGINE</span>
            </div>
            <h3 className="text-3xl font-bold text-white tracking-tight">
              Talk to Zora in Hausa, Yorùbá, Igbo & Fulfulde
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              Bypassing literacy barriers across rural West African farming communities with real-time speech and agronomic reasoning.
            </p>

            <InteractiveAiSandbox />
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION SECTION */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8 py-20">
        <div className="border border-neutral-800 bg-[#0d0e10] p-12 lg:p-16 text-center space-y-6">
          <span className="font-mono text-xs uppercase tracking-widest text-emerald-400 block">
            [ READY FOR SYSTEM DEPLOYMENT ]
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Launch Zora Command Centre
          </h2>
          <p className="text-neutral-400 text-sm max-w-xl mx-auto font-sans">
            Access PostGIS spatial farm boundaries, KGML-Ag soil carbon models, and tamper-proof MRV certificate streams.
          </p>
          <div className="pt-4">
            <Link href="/dashboard">
              <Button className="border border-neutral-700 bg-white text-black hover:bg-neutral-200 font-mono text-xs uppercase tracking-wider px-8 h-12 rounded-none font-bold">
                Enter Command Centre <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
