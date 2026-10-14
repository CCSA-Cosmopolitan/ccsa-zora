"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Lang = "en" | "ha" | "yo" | "ig" | "pcm";
type Phase = "idle" | "listening" | "thinking" | "speaking";

interface Tip {
  tip: string;
  howToApply: string;
}

interface Reply {
  spoken: string;
  diagnosis: string;
  severity: "information" | "low" | "medium" | "high";
  explanation: string;
  steps: string[];
  tips: Tip[];
  organicAlternative?: string;
  safety?: string;
  followUp: string;
  sources: string[];
  engine: { kgml: boolean; gpt: boolean; model: string };
}

interface Turn {
  id: number;
  question: string;
  reply?: Reply;
  error?: string;
}

const LANGUAGES: { code: Lang; label: string; native: string; recognition: string }[] = [
  { code: "en", label: "English", native: "English", recognition: "en-NG" },
  { code: "ha", label: "Hausa", native: "Hausa", recognition: "ha-NG" },
  { code: "yo", label: "Yoruba", native: "Yorùbá", recognition: "yo-NG" },
  { code: "ig", label: "Igbo", native: "Igbo", recognition: "ig-NG" },
  { code: "pcm", label: "Pidgin", native: "Pidgin", recognition: "en-NG" },
];

const EXAMPLES: Record<Lang, string[]> = {
  en: ["Holes in my maize leaves", "My cassava leaves are curling and yellow", "When should I apply fertilizer?"],
  ha: ["Ganyen masara na yana da ramuka", "Ganyen rogo na ya yi rawaya ya nade", "Yaushe zan saka taki?"],
  yo: ["Ihò wà lára ewé àgbàdo mi", "Ewé rógó mi ń yí, ó sì ń pọ́n", "Ìgbà wo ni mo yẹ kí n fi àjílẹ̀ sí oko?"],
  ig: ["Ọka m nwere oghere n'akwụkwọ", "Akwụkwọ akpụ m na-agbagọ na-acha odo odo", "Oge ole ka m ga-etinye fatalaịza?"],
  pcm: ["Holes dey my maize leaf", "My cassava leaf dey curl and turn yellow", "Which time I go put fertilizer?"],
};

const COPY: Record<Lang, { tap: string; listening: string; thinking: string; speaking: string }> = {
  en: { tap: "Tap and ask your question", listening: "Listening… tap when you finish", thinking: "Zora is thinking…", speaking: "Zora is speaking" },
  ha: { tap: "Danna ka yi tambayarka", listening: "Ina sauraro… danna idan ka gama", thinking: "Zora na tunani…", speaking: "Zora na magana" },
  yo: { tap: "Tẹ̀ kí o béèrè ìbéèrè rẹ", listening: "Mò ń gbọ́… tẹ̀ tí o bá parí", thinking: "Zora ń ronú…", speaking: "Zora ń sọ̀rọ̀" },
  ig: { tap: "Pịa jụọ ajụjụ gị", listening: "Ana m ege ntị… pịa mgbe ị mechara", thinking: "Zora na-eche echiche…", speaking: "Zora na-ekwu okwu" },
  pcm: { tap: "Tap and ask your question", listening: "I dey hear you… tap when you don finish", thinking: "Zora dey think…", speaking: "Zora dey talk" },
};

const SEVERITY_STYLE: Record<Reply["severity"], string> = {
  high: "bg-red-50 dark:bg-red-950/70 text-red-700 dark:text-red-300 ring-red-200 dark:ring-red-900/60",
  medium: "bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 ring-amber-200 dark:ring-amber-900/60",
  low: "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 ring-emerald-200 dark:ring-emerald-900/60",
  information: "bg-slate-100 dark:bg-stone-800 text-slate-700 dark:text-stone-300 ring-slate-200 dark:ring-stone-700",
};

const SEVERITY_LABEL: Record<Reply["severity"], string> = {
  high: "Act today",
  medium: "Act soon",
  low: "Keep watching",
  information: "Good to know",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyWindow = any;

export function ZoraAssistant() {
  const [language, setLanguage] = useState<Lang>("en");
  const [phase, setPhase] = useState<Phase>("idle");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [typed, setTyped] = useState("");
  const [useWhisper, setUseWhisper] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<AnyWindow>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const turnId = useRef(0);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch("/api/assistant")
      .then((r) => r.json())
      .then((d: { openai?: boolean }) => setUseWhisper(Boolean(d.openai)))
      .catch(() => setUseWhisper(false));
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [turns]);

  const stopSpeaking = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    setPhase("idle");
  }, []);

  const speak = useCallback(
    async (text: string, lang: Lang) => {
      setPhase("speaking");
      try {
        const res = await fetch("/api/audio/speech", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ text, language: lang }),
        });
        if (res.ok && res.headers.get("content-type")?.includes("audio")) {
          const url = URL.createObjectURL(await res.blob());
          const audio = new Audio(url);
          audioRef.current = audio;
          audio.onended = () => setPhase("idle");
          audio.onerror = () => setPhase("idle");
          await audio.play();
          return;
        }
      } catch {
        /* fall through to the browser voice */
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = lang === "en" || lang === "pcm" ? "en-NG" : "en-NG";
        utter.rate = 0.92;
        utter.onend = () => setPhase("idle");
        utter.onerror = () => setPhase("idle");
        window.speechSynthesis.speak(utter);
      } else {
        setPhase("idle");
      }
    },
    [],
  );

  const ask = useCallback(
    async (question: string) => {
      const text = question.trim();
      if (text.length < 2) {
        setPhase("idle");
        return;
      }
      const id = ++turnId.current;
      const history = turns
        .filter((t) => t.reply)
        .slice(-3)
        .flatMap((t) => [
          { role: "user" as const, content: t.question },
          { role: "assistant" as const, content: t.reply!.spoken },
        ]);

      setTurns((prev) => [...prev, { id, question: text }]);
      setPhase("thinking");
      try {
        const res = await fetch("/api/assistant", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ message: text, language, history }),
        });
        const data = (await res.json()) as Reply & { error?: string };
        if (!res.ok) throw new Error(data.error ?? "Zora could not answer.");
        setTurns((prev) => prev.map((t) => (t.id === id ? { ...t, reply: data } : t)));
        void speak(data.spoken, language);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Something went wrong.";
        setTurns((prev) => prev.map((t) => (t.id === id ? { ...t, error: message } : t)));
        setPhase("idle");
      }
    },
    [language, speak, turns],
  );

  const transcribe = useCallback(
    async (blob: Blob) => {
      setPhase("thinking");
      try {
        const form = new FormData();
        form.append("audio", new File([blob], "question.webm", { type: blob.type || "audio/webm" }));
        form.append("language", language);
        const res = await fetch("/api/assistant/transcribe", { method: "POST", body: form });
        const data = (await res.json()) as { text?: string; error?: string };
        if (!res.ok || !data.text) throw new Error(data.error ?? "Could not hear that. Please try again.");
        await ask(data.text);
      } catch (error) {
        setMicError(error instanceof Error ? error.message : "Could not hear that.");
        setPhase("idle");
      }
    },
    [ask, language],
  );

  const startListening = useCallback(async () => {
    setMicError(null);
    stopSpeaking();

    if (useWhisper) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        chunksRef.current = [];
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
        recorder.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
          void transcribe(new Blob(chunksRef.current, { type: recorder.mimeType }));
        };
        recorderRef.current = recorder;
        recorder.start();
        setPhase("listening");
      } catch {
        setMicError("Please allow the microphone, or type your question below.");
      }
      return;
    }

    const SR = (window as AnyWindow).SpeechRecognition || (window as AnyWindow).webkitSpeechRecognition;
    if (!SR) {
      setMicError("Voice is not supported in this browser. Please type your question below.");
      return;
    }
    const recognition = new SR();
    recognition.lang = LANGUAGES.find((l) => l.code === language)?.recognition ?? "en-NG";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: AnyWindow) => {
      void ask(event.results[0][0].transcript as string);
    };
    recognition.onerror = () => {
      setMicError("Could not hear that. Please try again or type your question.");
      setPhase("idle");
    };
    recognition.onend = () => setPhase((p) => (p === "listening" ? "idle" : p));
    recognitionRef.current = recognition;
    recognition.start();
    setPhase("listening");
  }, [ask, language, stopSpeaking, transcribe, useWhisper]);

  const stopListening = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") recorderRef.current.stop();
    recognitionRef.current?.stop?.();
  }, []);

  const onMic = () => {
    if (phase === "listening") stopListening();
    else if (phase === "speaking") stopSpeaking();
    else if (phase === "idle") void startListening();
  };

  const copy = COPY[language];
  const label =
    phase === "listening" ? copy.listening : phase === "thinking" ? copy.thinking : phase === "speaking" ? copy.speaking : copy.tap;

  return (
    <div className="w-full">
      {/* Language choice */}
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Choose language">
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => setLanguage(l.code)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              language === l.code
                ? "bg-emerald-700 dark:bg-emerald-600 text-white shadow-sm"
                : "bg-white dark:bg-stone-900 text-slate-700 dark:text-stone-300 ring-1 ring-slate-200 dark:ring-stone-800 hover:ring-emerald-300 dark:hover:ring-emerald-600"
            }`}
          >
            {l.native}
          </button>
        ))}
      </div>

      {/* Big mic button */}
      <div className="mt-10 flex flex-col items-center">
        <div className="relative">
          {phase === "listening" && (
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/40" aria-hidden />
          )}
          <button
            id="zora-mic-button"
            type="button"
            onClick={onMic}
            disabled={phase === "thinking"}
            aria-label={label}
            className={`relative flex h-28 w-28 items-center justify-center rounded-full text-white shadow-lg transition focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 ${
              phase === "listening"
                ? "bg-red-600 hover:bg-red-700"
                : phase === "thinking"
                  ? "cursor-wait bg-emerald-600/70"
                  : "bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            }`}
          >
            {phase === "thinking" ? (
              <span className="h-8 w-8 animate-spin rounded-full border-4 border-white/40 border-t-white" />
            ) : phase === "listening" || phase === "speaking" ? (
              <svg viewBox="0 0 24 24" className="h-10 w-10" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-11 w-11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="3" width="6" height="12" rx="3" fill="currentColor" />
                <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
              </svg>
            )}
          </button>
        </div>
        <p className="mt-4 text-base font-medium text-slate-700 dark:text-stone-300" aria-live="polite">
          {label}
        </p>
        {micError && <p className="mt-2 max-w-md text-center text-sm text-red-600 dark:text-red-400">{micError}</p>}
      </div>

      {/* Quick examples + typing */}
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {EXAMPLES[language].map((q) => (
          <button
            key={q}
            type="button"
            disabled={phase !== "idle"}
            onClick={() => void ask(q)}
            className="rounded-full bg-white dark:bg-stone-900 px-3.5 py-1.5 text-sm text-slate-600 dark:text-stone-300 ring-1 ring-slate-200 dark:ring-stone-800 transition hover:text-emerald-800 dark:hover:text-emerald-400 hover:ring-emerald-300 dark:hover:ring-emerald-600 disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      <form
        className="mx-auto mt-5 flex max-w-xl gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const q = typed;
          setTyped("");
          void ask(q);
        }}
      >
        <input
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder="Or type your question here"
          className="min-w-0 flex-1 rounded-lg bg-white dark:bg-stone-900 px-4 py-2.5 text-sm text-slate-900 dark:text-stone-100 ring-1 ring-slate-200 dark:ring-stone-800 placeholder:text-slate-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-600"
        />
        <button
          type="submit"
          disabled={phase !== "idle" || typed.trim().length < 2}
          className="rounded-lg bg-slate-900 dark:bg-stone-800 hover:bg-slate-700 dark:hover:bg-stone-700 px-5 py-2.5 text-sm font-semibold text-white transition disabled:opacity-40"
        >
          Ask
        </button>
      </form>

      {/* Conversation */}
      <div className="mt-10 space-y-8">
        {turns.map((turn) => (
          <article key={turn.id} className="space-y-4">
            <div className="flex justify-end">
              <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-emerald-700 px-4 py-2.5 text-sm text-white">
                {turn.question}
              </p>
            </div>

            {!turn.reply && !turn.error && (
              <p className="text-sm text-slate-500">{COPY[language].thinking}</p>
            )}
            {turn.error && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">{turn.error}</p>
            )}

            {turn.reply && <ReplyCard reply={turn.reply} onReplay={() => void speak(turn.reply!.spoken, language)} />}
          </article>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}

function ReplyCard({ reply, onReplay }: { reply: Reply; onReplay: () => void }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-stone-900/90 p-6 text-left shadow-sm ring-1 ring-slate-200 dark:ring-stone-800 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-stone-400">What Zora found</p>
          <h3 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{reply.diagnosis}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${SEVERITY_STYLE[reply.severity]}`}>
            {SEVERITY_LABEL[reply.severity]}
          </span>
          <button
            type="button"
            onClick={onReplay}
            className="rounded-full px-3 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-800 transition hover:bg-emerald-50 dark:hover:bg-emerald-950"
          >
            Listen again
          </button>
        </div>
      </div>

      <p className="mt-4 leading-relaxed text-slate-700 dark:text-stone-300">{reply.explanation}</p>

      {reply.steps.length > 0 && (
        <Section title="What to do">
          <ol className="space-y-3">
            {reply.steps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                  {i + 1}
                </span>
                <span className="text-slate-700 dark:text-stone-300">{step}</span>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {reply.tips.length > 0 && (
        <Section title="Helpful tips and how to use them">
          <ul className="space-y-4">
            {reply.tips.map((t, i) => (
              <li key={i} className="rounded-xl bg-emerald-50/60 dark:bg-stone-950 p-4 border border-emerald-100/60 dark:border-stone-800">
                <p className="font-semibold text-slate-900 dark:text-white">{t.tip}</p>
                {t.howToApply && (
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-stone-400">
                    <span className="font-semibold text-emerald-800 dark:text-emerald-400">How to do it: </span>
                    {t.howToApply}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {reply.organicAlternative && (
        <Section title="Low-cost option">
          <p className="text-slate-700 dark:text-stone-300">{reply.organicAlternative}</p>
        </Section>
      )}

      {reply.safety && (
        <Section title="Stay safe">
          <p className="text-slate-700 dark:text-stone-300">{reply.safety}</p>
        </Section>
      )}

      {reply.followUp && (
        <Section title="Check again">
          <p className="text-slate-700 dark:text-stone-300">{reply.followUp}</p>
        </Section>
      )}

      <p className="mt-6 border-t border-slate-100 dark:border-stone-800 pt-4 text-xs text-slate-400 dark:text-stone-500">
        Answer built from {reply.engine.kgml ? "CCSA KGML-Ag crop science" : "CCSA crop knowledge"}
        {reply.engine.gpt ? " and OpenAI GPT" : ""}. {reply.sources.slice(0, 3).join(" · ")}
      </p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-emerald-800 dark:text-emerald-400">{title}</h4>
      {children}
    </div>
  );
}
