"use client";

import { useMutation } from "@tanstack/react-query";
import {
  Camera,
  CheckCircle2,
  Languages,
  Mic,
  Send,
  Sparkles,
  Square,
  Volume2,
} from "lucide-react";
import { useRef, useState } from "react";

import { createZoraClient } from "@ccsa-zora/api-client";
import type { FieldSummary, ZoraAdvisoryResult, ZoraLanguage } from "@ccsa-zora/utils/api";
import { Badge } from "@ccsa-zora/ui/components/badge";
import { Button } from "@ccsa-zora/ui/components/button";

import { activeOrganizationId } from "@/hooks/use-dashboard";
import { getAccessToken } from "@/lib/supabase";

interface SpeechRecognitionResultEvent {
  results: ArrayLike<{ 0: { transcript: string } }>;
}

interface BrowserSpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

declare global {
  interface Window {
    SpeechRecognition?: BrowserSpeechRecognitionConstructor;
    webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
  }
}

const api = createZoraClient({ getAccessToken });

const languages: { id: ZoraLanguage; label: string; locale: string }[] = [
  { id: "en", label: "English", locale: "en-NG" },
  { id: "ha", label: "Hausa", locale: "ha-NG" },
  { id: "yo", label: "Yorùbá", locale: "yo-NG" },
  { id: "ig", label: "Igbo", locale: "ig-NG" },
  { id: "ff", label: "Fulfulde", locale: "ff-NG" },
];

const prompts = [
  "Why are my maize leaves turning yellow?",
  "Should I apply fertilizer before tomorrow's rain?",
  "How do I inspect for Fall Armyworm?",
];

interface ConversationItem {
  id: string;
  role: "farmer" | "zora";
  text: string;
  result?: ZoraAdvisoryResult;
}

export function ZoraAssistant({ fields }: { fields: FieldSummary[] }) {
  const [language, setLanguage] = useState<ZoraLanguage>("en");
  const [fieldId, setFieldId] = useState(fields[0]?.id ?? "");
  const [prompt, setPrompt] = useState("");
  const [listening, setListening] = useState(false);
  const [attachment, setAttachment] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConversationItem[]>([
    {
      id: "welcome",
      role: "zora",
      text: "I am ready. Ask about a crop, livestock concern, field operation, or climate risk.",
    },
  ]);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);

  const advisory = useMutation({
    mutationFn: (message: string) =>
      api.advisory({
        organizationId: activeOrganizationId,
        fieldId: fieldId || null,
        language,
        message,
        channel: listening ? "voice" : "web",
        context: attachment ? { attachmentName: attachment } : undefined,
      }),
  });

  async function submit(message = prompt) {
    const cleaned = message.trim();
    if (cleaned.length < 2 || advisory.isPending) return;
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "farmer", text: cleaned },
    ]);
    setPrompt("");
    try {
      const result = await advisory.mutateAsync(cleaned);
      setMessages((current) => [
        ...current,
        { id: result.advisoryId, role: "zora", text: result.answer, result },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "zora",
          text:
            error instanceof Error
              ? error.message
              : "The advisory service is temporarily unavailable.",
        },
      ]);
    }
  }

  function toggleListening() {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Recognition) {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "zora",
          text: "Voice input is unavailable in this browser. You can still type your question.",
        },
      ]);
      return;
    }
    const recognition = new Recognition();
    recognition.lang = languages.find((item) => item.id === language)?.locale ?? "en-NG";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      setPrompt(event.results[0]?.[0]?.transcript ?? "");
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }

  function speak(text: string) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languages.find((item) => item.id === language)?.locale ?? "en-NG";
    utterance.rate = 0.94;
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div className="overflow-hidden rounded-[1.15rem] border border-zora-forest/20 bg-zora-deep text-white shadow-2xl shadow-zora-deep/20">
      <div className="zora-grid border-b border-white/10 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-zora-sun">
              <Sparkles className="size-4" />
              <span className="text-[11px] font-bold uppercase tracking-[0.18em]">
                Zora Super Intelligence
              </span>
            </div>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">
              Ask the farm, not a search box.
            </h2>
            <p className="mt-1 max-w-xl text-xs leading-5 text-emerald-50/65">
              Voice, field context, climate signals, and KGML-Ag reasoning in one conversation.
            </p>
          </div>
          <Badge className="border-white/15 bg-white/10 text-emerald-50" variant="outline">
            <span className="mr-1.5 size-1.5 rounded-full bg-emerald-400" />
            Reference intelligence online
          </Badge>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Languages className="mr-1 size-4 text-emerald-100/70" />
          {languages.map((item) => (
            <button
              className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition ${
                language === item.id
                  ? "border-zora-sun bg-zora-sun text-zora-deep"
                  : "border-white/15 bg-white/5 text-emerald-50/75 hover:bg-white/10"
              }`}
              key={item.id}
              onClick={() => setLanguage(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
          <select
            aria-label="Field context"
            className="ml-auto h-8 rounded-full border border-white/15 bg-white/10 px-3 text-[11px] text-white outline-none"
            onChange={(event) => setFieldId(event.target.value)}
            value={fieldId}
          >
            {fields.map((field) => (
              <option className="text-zora-deep" key={field.id} value={field.id}>
                {field.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="max-h-[360px] space-y-3 overflow-y-auto bg-[#08281e] p-4">
        {messages.map((message) => (
          <div
            className={`max-w-[92%] rounded-2xl p-3 ${message.role === "zora" ? "bg-white/9" : "ml-auto bg-zora-sun text-zora-deep"}`}
            key={message.id}
          >
            <div className="flex items-start gap-2">
              {message.role === "zora" ? (
                <Sparkles className="mt-0.5 size-4 shrink-0 text-zora-sun" />
              ) : null}
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm leading-5 ${message.role === "zora" ? "text-emerald-50" : "font-medium"}`}
                >
                  {message.text}
                </p>
                {message.result ? (
                  <div className="mt-3 border-t border-white/10 pt-3">
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-emerald-100/65">
                      <span>{Math.round(message.result.confidence * 100)}% confidence</span>
                      <span>•</span>
                      <span>{message.result.severity} priority</span>
                      <button
                        className="ml-auto text-zora-sun"
                        onClick={() => speak(message.text)}
                        type="button"
                      >
                        <Volume2 className="size-4" />
                      </button>
                    </div>
                    <ul className="mt-2 space-y-1.5">
                      {message.result.actions.map((action) => (
                        <li
                          className="flex gap-2 text-xs leading-5 text-emerald-50/80"
                          key={action}
                        >
                          <CheckCircle2 className="mt-1 size-3 shrink-0 text-emerald-400" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ))}
        {advisory.isPending ? (
          <div className="w-32 animate-pulse rounded-2xl bg-white/9 p-4 text-xs text-emerald-50/60">
            Zora is reasoning…
          </div>
        ) : null}
      </div>

      <div className="border-t border-white/10 bg-zora-deep p-4">
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {prompts.map((item) => (
            <button
              className="shrink-0 rounded-full border border-white/15 px-3 py-1.5 text-[10px] text-emerald-50/70 hover:bg-white/10"
              key={item}
              onClick={() => void submit(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
        <div className="flex items-end gap-2 rounded-2xl border border-white/15 bg-white/8 p-2">
          <input
            accept="image/*"
            className="hidden"
            id="zora-image"
            onChange={(event) => setAttachment(event.target.files?.[0]?.name ?? null)}
            type="file"
          />
          <label
            className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-emerald-50/70 hover:bg-white/10"
            htmlFor="zora-image"
            title="Attach crop or livestock image"
          >
            <Camera className="size-4" />
          </label>
          <button
            aria-label={listening ? "Stop voice input" : "Start voice input"}
            className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${listening ? "bg-red-500 text-white" : "text-emerald-50/70 hover:bg-white/10"}`}
            onClick={toggleListening}
            type="button"
          >
            {listening ? <Square className="size-3 fill-current" /> : <Mic className="size-4" />}
          </button>
          <textarea
            className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-1 py-2 text-sm text-white outline-none placeholder:text-emerald-50/35"
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void submit();
              }
            }}
            placeholder={
              attachment ? `Image attached: ${attachment}` : "Ask Zora in your preferred language…"
            }
            value={prompt}
          />
          <Button
            aria-label="Send to Zora"
            className="size-10 shrink-0 rounded-xl bg-zora-sun text-zora-deep hover:bg-[#f2c34e]"
            disabled={prompt.trim().length < 2 || advisory.isPending}
            onClick={() => void submit()}
            size="icon"
          >
            <Send className="size-4" />
          </Button>
        </div>
        <p className="mt-2 text-[10px] text-emerald-50/40">
          Reference guidance must be validated against field evidence and local extension protocols.
        </p>
      </div>
    </div>
  );
}
