import Link from "next/link";

export const metadata = {
  title: "Documentation | CCSA Zora",
  description:
    "How CCSA Zora works: voice, KGML-Ag, GPT reasoning, APIs and how to run it locally.",
};

const GITHUB_URL = "https://github.com/CCSA-Cosmopolitan/ccsa-zora";

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="mt-14 scroll-mt-24 text-2xl font-bold tracking-tight text-slate-900">
      {children}
    </h2>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-900 p-4 text-sm leading-relaxed text-slate-100">
      <code>{children}</code>
    </pre>
  );
}

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white text-slate-700">
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
          <Link href="/" className="text-lg font-bold text-emerald-800">
            ← Zora
          </Link>
          <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="text-sm font-semibold hover:text-emerald-800">
            GitHub repository
          </a>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-12 px-5 py-14 lg:grid-cols-[200px_1fr]">
        <aside className="hidden lg:block">
          <nav className="sticky top-24 space-y-2 text-sm">
            {[
              ["overview", "Overview"],
              ["how", "How an answer is made"],
              ["voice", "Voice and languages"],
              ["api", "API"],
              ["modules", "Platform modules"],
              ["run", "Run locally"],
              ["config", "Configuration"],
            ].map(([id, label]) => (
              <a key={id} href={`#${id}`} className="block text-slate-500 hover:text-emerald-800">
                {label}
              </a>
            ))}
          </nav>
        </aside>

        <article>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Documentation</h1>
          <p className="mt-4 text-lg leading-relaxed">
            This page holds the technical detail that the farmer never needs to see. The product itself is one
            button.
          </p>

          <H2 id="overview">Overview</H2>
          <p className="mt-3 leading-relaxed">
            Zora lets farmers with no formal education ask questions by voice in Hausa, Yorùbá, Igbo, Nigerian
            Pidgin or English, and hear a detailed, practical answer. Answers combine verified crop science from
            the <strong>KGML-Ag</strong> engine with the reasoning and language ability of <strong>OpenAI GPT</strong>.
          </p>

          <H2 id="how">How an answer is made</H2>
          <ol className="mt-4 list-decimal space-y-3 pl-6 leading-relaxed">
            <li>
              <strong>Listen.</strong> The farmer&apos;s voice is turned into text (OpenAI Whisper, or the browser
              speech engine as a fallback).
            </li>
            <li>
              <strong>Ground.</strong> The question goes to the KGML-Ag service, which returns verified diagnosis
              patterns, recommended actions, safety limits and live weather for the farm location.
            </li>
            <li>
              <strong>Explain.</strong> GPT receives the question plus the KGML-Ag facts. It must stay inside the
              verified safety limits, but expands them into a full explanation, step-by-step actions with
              amounts and timing, practical tips with how to apply each one, a low-cost option and a follow-up
              check, written in the farmer&apos;s language.
            </li>
            <li>
              <strong>Speak.</strong> A short spoken version is generated with a natural Nigerian-accented voice
              and played back. The full written answer stays on screen.
            </li>
          </ol>
          <p className="mt-4 leading-relaxed">
            If no OpenAI key is configured or the network is down, Zora automatically falls back to the built-in
            multilingual knowledge base so it never goes silent.
          </p>

          <H2 id="voice">Voice and languages</H2>
          <ul className="mt-4 list-disc space-y-2 pl-6 leading-relaxed">
            <li>
              Speech to text: <code>whisper-1</code> (Hausa, Yorùbá, English) with browser SpeechRecognition fallback.
            </li>
            <li>
              Text to speech: <code>gpt-4o-mini-tts</code> with accent and tone instructions, falling back to{" "}
              <code>tts-1</code>, then the device voice.
            </li>
            <li>Languages: English, Hausa, Yorùbá, Igbo, Nigerian Pidgin (Fulfulde supported in the API).</li>
          </ul>

          <H2 id="api">API</H2>
          <p className="mt-3">Public assistant endpoint (rate limited per IP):</p>
          <Code>{`POST /api/assistant
{
  "message": "Holes in my maize leaves",
  "language": "ha",           // en | ha | yo | ig | pcm | ff
  "history": []               // optional previous turns
}

→ {
  "spoken": "...",            // read aloud
  "diagnosis": "...",
  "severity": "high",
  "explanation": "...",
  "steps": ["..."],
  "tips": [{ "tip": "...", "howToApply": "..." }],
  "organicAlternative": "...",
  "safety": "...",
  "followUp": "...",
  "sources": ["IITA", "FAO"],
  "engine": { "kgml": true, "gpt": true, "model": "gpt-4o-mini" }
}`}</Code>
          <p className="mt-4">Supporting endpoints:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>
              <code>POST /api/assistant/transcribe</code>: multipart audio to text
            </li>
            <li>
              <code>POST /api/audio/speech</code>: text to natural speech (mp3)
            </li>
            <li>
              <code>POST /api/advisory</code>: authenticated advisory with audit logging (dashboard)
            </li>
          </ul>

          <H2 id="modules">Platform modules</H2>
          <p className="mt-3 leading-relaxed">
            Behind the assistant, the staff dashboard offers a command centre, field registry, IoT sensors,
            digital MRV for carbon credits and model management.{" "}
            <Link href="/login" className="font-semibold text-emerald-800 underline underline-offset-4">
              Staff sign in
            </Link>
            .
          </p>

          <H2 id="run">Run locally</H2>
          <Code>{`git clone ${GITHUB_URL}.git
cd ccsa-zora
pnpm install

# web app (http://localhost:3001)
pnpm --filter @ccsa-zora/web dev

# KGML-Ag service (http://127.0.0.1:8100)
cd apps/kgml-api
python -m venv .venv && .venv\\Scripts\\activate
pip install -e .
uvicorn app.main:app --port 8100`}</Code>

          <H2 id="config">Configuration</H2>
          <p className="mt-3">
            Set these in <code>apps/web/.env.local</code>:
          </p>
          <Code>{`OPENAI_API_KEY=sk-...        # enables GPT answers, Whisper and natural voice
OPENAI_MODEL=gpt-4o-mini     # or gpt-4o for higher quality
KGML_API_URL=http://127.0.0.1:8100
KGML_SERVICE_KEY=...`}</Code>

          <div className="mt-16 rounded-2xl bg-emerald-50 p-6">
            <p className="font-semibold text-emerald-900">Source code</p>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-block text-emerald-800 underline underline-offset-4"
            >
              {GITHUB_URL}
            </a>
          </div>
        </article>
      </main>
    </div>
  );
}
