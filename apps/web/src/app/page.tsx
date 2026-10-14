import Image from "next/image";
import Link from "next/link";

import { ZoraAssistant } from "@/components/zora-assistant";

const GITHUB_URL = "https://github.com/CCSA-Cosmopolitan/ccsa-zora";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      {/* Navigation: deliberately minimal */}
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/ccsa-logo.png" alt="CCSA" width={96} height={32} className="h-8 w-auto" priority />
            <span className="h-5 w-px bg-slate-200" />
            <span className="text-lg font-bold tracking-tight text-emerald-800">Zora</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm font-medium text-slate-600 sm:gap-3">
            <Link href="/docs" className="rounded-md px-3 py-2 hover:text-emerald-800">
              Docs
            </Link>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-md px-3 py-2 hover:text-emerald-800"
            >
              GitHub
            </a>
            <a
              href="#talk"
              className="rounded-full bg-emerald-700 px-5 py-2 font-semibold text-white transition hover:bg-emerald-800"
            >
              Talk to Zora
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-14 lg:grid-cols-2 lg:pt-20">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">
            Centre for Climate-Smart Agriculture
          </p>
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.4rem]">
            Farm advice you can ask for out loud, in your own language.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-600">
            Zora is an AI helper for farmers who never had the chance to go to school. No reading. No typing.
            Press one button, say what is wrong on your farm, and hear clear steps to fix it in Hausa, Yorùbá,
            Igbo, Pidgin or English.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#talk"
              className="rounded-full bg-emerald-700 px-7 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-800"
            >
              Try it now
            </a>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-full px-7 py-3.5 text-base font-semibold text-slate-700 ring-1 ring-slate-300 transition hover:ring-emerald-600"
            >
              View on GitHub
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-slate-100 shadow-xl shadow-emerald-900/10">
            <Image
              src="/hero/farmer.jpg"
              alt="A Nigerian farmer asking her phone a question in her maize field"
              fill
              priority
              sizes="(min-width: 1024px) 560px, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* The problem, in one calm paragraph */}
      <section className="border-y border-slate-100 bg-slate-50/60">
        <div className="mx-auto max-w-3xl px-5 py-16 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">The problem we are solving</h2>
          <p className="mt-5 text-lg leading-relaxed text-slate-600">
            Millions of Nigerian farmers face pests, disease and poor soil with almost no expert help nearby. Most
            advice is written in English and arrives too late. Zora brings an expert to the field, speaking the
            farmer&apos;s own language, the moment the problem appears.
          </p>
        </div>
      </section>

      {/* Featured: the live assistant */}
      <section id="talk" className="scroll-mt-16">
        <div className="mx-auto max-w-3xl px-5 py-20">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">Featured</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Ask Zora anything about your farm</h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-600">
              Choose your language, press the green button and speak. Zora listens, thinks, and answers with
              clear steps, helpful tips and how to use them.
            </p>
          </div>
          <div className="mt-12">
            <ZoraAssistant />
          </div>
        </div>
      </section>

      {/* How it works: three plain steps */}
      <section className="border-t border-slate-100">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">Simple for the farmer</h2>
          <div className="mt-12 grid gap-10 sm:grid-cols-3">
            {[
              { n: "1", t: "Speak", d: "Describe the problem the way you would tell a neighbour. Zora understands your language." },
              { n: "2", t: "Listen", d: "Zora explains what is wrong and why, then tells you exactly what to do, step by step." },
              { n: "3", t: "Act", d: "Get low-cost options, safety advice and when to check again, so you can fix it with confidence." },
            ].map((s) => (
              <div key={s.n} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-800">
                  {s.n}
                </div>
                <h3 className="mt-5 text-lg font-bold">{s.t}</h3>
                <p className="mt-2 leading-relaxed text-slate-600">{s.d}</p>
              </div>
            ))}
          </div>
          <p className="mt-14 text-center text-sm text-slate-500">
            Curious how it works under the hood?{" "}
            <Link href="/docs" className="font-semibold text-emerald-800 underline underline-offset-4">
              Read the documentation
            </Link>
            .
          </p>
        </div>
      </section>

      <footer className="border-t border-slate-100">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Centre for Climate-Smart Agriculture, Cosmopolitan University Abuja</p>
          <div className="flex items-center gap-5">
            <Link href="/docs" className="hover:text-emerald-800">
              Docs
            </Link>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="hover:text-emerald-800">
              GitHub
            </a>
            <Link href="/login" className="hover:text-emerald-800">
              Staff sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
