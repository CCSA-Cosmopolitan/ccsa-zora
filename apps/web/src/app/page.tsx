import Image from "next/image";
import Link from "next/link";

import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { ZoraAssistant } from "@/components/zora-assistant";

const GITHUB_URL = "https://github.com/CCSA-Cosmopolitan/ccsa-zora";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 antialiased transition-colors flex flex-col justify-between">
      {/* Navigation: PublicHeader with Zora logo & responsive modal */}
      <PublicHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-14 lg:grid-cols-2 lg:pt-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
              Centre for Climate-Smart Agriculture
            </p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.4rem] text-stone-900 dark:text-white">
              Farm advice you can ask for out loud, in your own language.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-stone-600 dark:text-stone-400">
              Zora is an AI helper for farmers who never had the chance to go to school. No reading. No typing.
              Press one button, say what is wrong on your farm, and hear clear steps to fix it in Hausa, Yorùbá,
              Igbo, Pidgin or English.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href="#talk"
                className="rounded-full bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 px-7 py-3.5 text-base font-semibold text-white shadow-sm transition"
              >
                Try it now
              </a>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                className="rounded-full px-7 py-3.5 text-base font-semibold text-stone-700 dark:text-stone-300 ring-1 ring-stone-300 dark:ring-stone-800 hover:ring-emerald-600 dark:hover:ring-emerald-500 transition"
              >
                View on GitHub
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-stone-100 dark:bg-stone-900 shadow-xl shadow-emerald-900/10 border border-stone-200/60 dark:border-stone-800">
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
        <section className="border-y border-stone-200 dark:border-stone-900 bg-stone-50/70 dark:bg-stone-900/40">
          <div className="mx-auto max-w-3xl px-5 py-16 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-stone-900 dark:text-white">
              The problem we are solving
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-stone-600 dark:text-stone-400">
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
              <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                Featured
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl text-stone-900 dark:text-white">
                Ask Zora anything about your farm
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-stone-600 dark:text-stone-400">
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
        <section className="border-t border-stone-200 dark:border-stone-900 bg-stone-50/40 dark:bg-stone-900/20">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl text-stone-900 dark:text-white">
              Simple for the farmer
            </h2>
            <div className="mt-12 grid gap-10 sm:grid-cols-3">
              {[
                {
                  n: "1",
                  t: "Speak",
                  d: "Describe the problem the way you would tell a neighbour. Zora understands your language.",
                },
                {
                  n: "2",
                  t: "Listen",
                  d: "Zora explains what is wrong and why, then tells you exactly what to do, step by step.",
                },
                {
                  n: "3",
                  t: "Act",
                  d: "Get low-cost options, safety advice and when to check again, so you can fix it with confidence.",
                },
              ].map((s) => (
                <div key={s.n} className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-lg font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                    {s.n}
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-stone-900 dark:text-white">{s.t}</h3>
                  <p className="mt-2 leading-relaxed text-stone-600 dark:text-stone-400 text-sm">{s.d}</p>
                </div>
              ))}
            </div>
            <p className="mt-14 text-center text-sm text-stone-500 dark:text-stone-400">
              Curious how it works under the hood?{" "}
              <Link
                href="/docs"
                className="font-semibold text-emerald-800 dark:text-emerald-400 underline underline-offset-4 hover:text-emerald-700"
              >
                Read the documentation
              </Link>
              .
            </p>
          </div>
        </section>
      </main>

      {/* Bigger, richer footer */}
      <PublicFooter />
    </div>
  );
}
