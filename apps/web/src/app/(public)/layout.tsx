import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Button } from "@ccsa-zora/ui/components/button";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0b0d] text-stone-100 font-sans antialiased selection:bg-emerald-500/30 selection:text-emerald-200 flex flex-col">
      {/* Sleek Dark Header Bar with Official Zora Wordmark Logo */}
      <header className="sticky top-0 z-50 border-b border-neutral-800/80 bg-[#0a0b0d]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          {/* Official Zora Wordmark Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-9 w-36 overflow-hidden rounded border border-neutral-800 bg-white p-1 shadow-sm transition-transform group-hover:scale-105">
              <Image
                src="/brand/zora-wordmark.jpeg"
                alt="CCSA Zora Wordmark Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 font-mono text-xs uppercase tracking-wider text-neutral-400">
            <Link href="/capabilities" className="hover:text-white transition-colors">
              Platform
            </Link>
            <Link href="/how-it-works" className="hover:text-white transition-colors">
              Device & IoT
            </Link>
            <Link href="/who-it-serves" className="hover:text-white transition-colors">
              Solutions
            </Link>
            <Link href="/technology" className="hover:text-white transition-colors">
              KGML Science
            </Link>
            <Link href="/impact" className="hover:text-white transition-colors">
              MRV Audit
            </Link>
          </nav>

          {/* Right CTAs */}
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button
                variant="outline"
                className="border-neutral-700 bg-white text-black hover:bg-neutral-200 font-mono text-xs uppercase tracking-wider h-10 px-5 rounded-none transition-all font-bold"
              >
                Launch Platform <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Page Body */}
      <main className="flex-1 bg-[#0a0b0d]">{children}</main>

      {/* Minimalist Footer */}
      <footer className="border-t border-neutral-800/80 bg-[#070809] py-16 text-neutral-400 font-mono text-xs">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="relative h-8 w-32 overflow-hidden rounded border border-neutral-800 bg-white p-1">
                <Image
                  src="/brand/zora-wordmark.jpeg"
                  alt="Zora"
                  fill
                  className="object-contain"
                />
              </div>
              <p className="text-neutral-500 text-[11px] leading-relaxed">
                Cosmopolitan University Abuja • CCSA Center for Climate Smart Agriculture
              </p>
            </div>
            <div>
              <p className="text-white font-bold mb-3 uppercase tracking-widest text-[11px]">Platform</p>
              <ul className="space-y-2">
                <li><Link href="/capabilities" className="hover:text-white">Field Intelligence</Link></li>
                <li><Link href="/how-it-works" className="hover:text-white">IoT Sensors</Link></li>
                <li><Link href="/technology" className="hover:text-white">KGML-Ag Models</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-white font-bold mb-3 uppercase tracking-widest text-[11px]">Verification</p>
              <ul className="space-y-2">
                <li><Link href="/impact" className="hover:text-white">Soil Organic Carbon</Link></li>
                <li><Link href="/impact" className="hover:text-white">SHA-256 Event Chain</Link></li>
                <li><Link href="/dashboard/mrv" className="hover:text-white">MRV Certificates</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-white font-bold mb-3 uppercase tracking-widest text-[11px]">Languages</p>
              <p className="text-neutral-500 text-[11px]">
                Hausa • Yorùbá • Igbo • Fulfulde • English
              </p>
            </div>
          </div>

          <div className="border-t border-neutral-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-500 text-[11px]">
            <span>© 2026 CCSA Zora Platform. All rights reserved.</span>
            <span>[INTELLIGENT AGRICULTURAL SUPER-PLATFORM]</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
