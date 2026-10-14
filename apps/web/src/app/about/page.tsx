import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  BrainCircuit,
  CheckCircle2,
  Cpu,
  Globe2,
  HeartHandshake,
  Languages,
  Leaf,
  Mic,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";

export const metadata: Metadata = {
  title: "About Us | CCSA Zora — Centre for Climate-Smart Agriculture",
  description:
    "Learn about Zora, our mission at Cosmopolitan University Abuja, and our sovereign AI platform for smallholder farmers across Nigeria and West Africa.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 antialiased transition-colors flex flex-col justify-between">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-stone-200 dark:border-stone-900 bg-stone-50/60 dark:bg-black/60 py-20 px-5 sm:px-6">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-3.5 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 mb-6">
              <Sparkles className="size-3.5" />
              <span>Cosmopolitan University Abuja Initiative</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl text-stone-900 dark:text-white leading-[1.1]">
              Bridging the agricultural literacy gap with voice-first sovereign AI.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
              At the Centre for Climate-Smart Agriculture (CCSA), we believe no farmer should lose a crop simply
              because expert advice was written in a language or format they cannot read.
            </p>
          </div>
        </section>

        {/* The Institutional Genesis & Mission */}
        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                Our Genesis & Institution
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-stone-900 dark:text-white">
                Born at Cosmopolitan University Abuja
              </h2>
              <p className="text-base leading-relaxed text-stone-600 dark:text-stone-400">
                The Centre for Climate-Smart Agriculture (CCSA) was established at Cosmopolitan University Abuja
                to spearhead applied AI research addressing food security, environmental resilience, and smallholder empowerment
                across Nigeria and sub-Saharan Africa.
              </p>
              <p className="text-base leading-relaxed text-stone-600 dark:text-stone-400">
                Nigeria is home to over 38 million smallholder farmers who produce more than 80% of the domestic food supply.
                Yet the extension agent to farmer ratio is approximately 1 to 5,000. Zora is our breakthrough response: an
                autonomous agronomic helper that speaks fluent Hausa, Yorùbá, Igbo, Nigerian Pidgin, and English.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900">
                  <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">38M+</div>
                  <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">Smallholder Farmers in Nigeria</div>
                </div>
                <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900">
                  <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">5 Languages</div>
                  <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">Indigenous Voice Dialects</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-stone-100 dark:bg-stone-900 shadow-xl border border-stone-200 dark:border-stone-800">
                <Image
                  src="/hero/farmer.jpg"
                  alt="Farmer receiving AI agronomic guidance"
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 560px, 100vw"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 3 Scientific Pillars */}
        <section className="border-y border-stone-200 dark:border-stone-900 bg-stone-50 dark:bg-black/50 py-20 px-5 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                Scientific Innovation
              </span>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl text-stone-900 dark:text-white">
                How Zora Combines Science & Speech
              </h2>
              <p className="mt-4 text-base text-stone-600 dark:text-stone-400">
                Three complementary research foundations power every piece of guidance Zora speaks.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-3">
              <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-8 space-y-4 shadow-xs">
                <div className="size-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold">
                  <Mic className="size-6" />
                </div>
                <h3 className="text-xl font-bold text-stone-900 dark:text-white">Voice-First Accessibility</h3>
                <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                  Zero reading and zero typing required. Built specifically for rural dialects with fine-tuned Whisper speech recognition and natural sounding vernacular synthesis.
                </p>
              </div>

              <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-8 space-y-4 shadow-xs">
                <div className="size-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold">
                  <BrainCircuit className="size-6" />
                </div>
                <h3 className="text-xl font-bold text-stone-900 dark:text-white">KGML-Ag Engine</h3>
                <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                  Knowledge-Guided Machine Learning that integrates physical crop models, agro-ecological weather data, and soil chemistry constraints to ensure advice is strictly factual.
                </p>
              </div>

              <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-8 space-y-4 shadow-xs">
                <div className="size-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold">
                  <ShieldCheck className="size-6" />
                </div>
                <h3 className="text-xl font-bold text-stone-900 dark:text-white">Digital MRV & Soil Carbon</h3>
                <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                  Append-only SHA-256 event chains and PostGIS spatial validation certifying regenerative agricultural practices for farmer carbon dividends.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-4xl px-5 py-20 text-center sm:px-6">
          <h2 className="text-3xl font-extrabold text-stone-900 dark:text-white sm:text-4xl">
            Experience Zora in Action
          </h2>
          <p className="mt-4 text-base text-stone-600 dark:text-stone-400 max-w-xl mx-auto">
            Test the live multilingual voice assistant right in your browser or explore our technical documentation.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/#talk"
              className="rounded-full bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 px-8 py-3.5 text-sm font-bold text-white shadow-xs transition"
            >
              Talk to Zora Now
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-stone-300 dark:border-stone-800 px-8 py-3.5 text-sm font-bold text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-900 transition"
            >
              Partner with CCSA
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
