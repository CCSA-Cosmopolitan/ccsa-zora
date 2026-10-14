import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ExternalLink,
  Globe2,
  Heart,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const GITHUB_URL = "https://github.com/CCSA-Cosmopolitan/ccsa-zora";

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-stone-200 dark:border-stone-900 bg-stone-50 dark:bg-black text-stone-600 dark:text-stone-300 transition-colors">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-8">
        {/* Main 4-column Grid */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Column 1 & 2: Brand, Identity & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative size-10 overflow-hidden rounded-xl border border-stone-200 dark:border-stone-800 bg-emerald-950 p-0.5 shadow-xs">
                <Image
                  src="/brand/zora-square.jpeg"
                  alt="CCSA Zora"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black tracking-tight text-emerald-900 dark:text-emerald-400">
                    CCSA Zora
                  </span>
                  <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                    Sovereign AI
                  </span>
                </div>
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  Centre for Climate-Smart Agriculture
                </span>
              </div>
            </Link>

            <p className="max-w-md text-xs leading-relaxed text-stone-600 dark:text-stone-400">
              CCSA Zora is a sovereign agricultural extension intelligence developed at Cosmopolitan
              University Abuja. Designed for non-literate and smallholder farmers to diagnose crop disease,
              combat climate volatility, and receive actionable advice in indigenous languages through a single tap.
            </p>

            <div className="flex flex-col gap-2 pt-2 text-xs text-stone-500 dark:text-stone-400">
              <div className="flex items-center gap-2">
                <MapPin className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Cosmopolitan University Abuja, FCT, Nigeria</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <a
                  href="mailto:ccsa@cosmopolitan.edu.ng"
                  className="hover:text-emerald-700 dark:hover:text-emerald-400 transition"
                >
                  ccsa@cosmopolitan.edu.ng
                </a>
              </div>
            </div>
          </div>

          {/* Column 3: Platform & Intelligence */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/#talk" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition">
                  Voice Assistant Demo
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition">
                  KGML-Ag Science
                </Link>
              </li>
              <li>
                <Link href="/docs#voice" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition">
                  Dialect Recognition
                </Link>
              </li>
              <li>
                <Link href="/docs#modules" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition">
                  Digital MRV & Carbon
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition">
                  Command Centre
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Resources & Organization */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100">
              Centre & Research
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition">
                  About Us & Team
                </Link>
              </li>
              <li>
                <Link href="/docs" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition">
                  Architecture Docs
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition">
                  Contact & Cooperatives
                </Link>
              </li>
              <li>
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-700 dark:hover:text-emerald-400 transition inline-flex items-center gap-1"
                >
                  <span>Open Source GitHub</span>
                  <ExternalLink className="size-3" />
                </a>
              </li>
              <li>
                <Link href="/login" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition">
                  Staff Workspace
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Indigenous Languages */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <Globe2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Languages</span>
            </h4>
            <p className="text-[11px] leading-relaxed text-stone-500 dark:text-stone-400">
              Trained on regional agricultural vocabulary:
            </p>
            <ul className="space-y-1.5 text-xs text-stone-600 dark:text-stone-300">
              <li className="flex items-center justify-between">
                <span>Hausa</span>
                <span className="text-[10px] text-stone-400">Harshen Hausa</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Yorùbá</span>
                <span className="text-[10px] text-stone-400">Èdè Yorùbá</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Igbo</span>
                <span className="text-[10px] text-stone-400">Asụsụ Igbo</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Pidgin</span>
                <span className="text-[10px] text-stone-400">Naija Talk</span>
              </li>
              <li className="flex items-center justify-between">
                <span>English</span>
                <span className="text-[10px] text-stone-400">West African</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Institutional Sub-bar */}
        <div className="mt-14 pt-8 border-t border-stone-200 dark:border-stone-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-500 dark:text-stone-400">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <span>© {currentYear} Centre for Climate-Smart Agriculture (CCSA).</span>
            <span className="hidden sm:inline-block">•</span>
            <span>Cosmopolitan University Abuja, Nigeria.</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <Link href="/about" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition">
              About
            </Link>
            <Link href="/docs" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition">
              Documentation
            </Link>
            <Link href="/contact" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition">
              Contact
            </Link>
            <Link href="/login" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition font-medium">
              Staff Sign In
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
