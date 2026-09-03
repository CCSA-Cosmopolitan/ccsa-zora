"use client";

import { useState } from "react";
import {
  Bot,
  BrainCircuit,
  CheckCircle2,
  Loader2,
  Play,
  Send,
  Sparkles,
  Volume2,
} from "lucide-react";

import { Badge } from "@ccsa-zora/ui/components/badge";
import { Button } from "@ccsa-zora/ui/components/button";

type LanguageCode = "ha" | "yo" | "ig" | "ff" | "en";

interface SamplePrompt {
  label: string;
  lang: LanguageCode;
  query: string;
}

const LANGUAGES: { code: LanguageCode; name: string; native: string }[] = [
  { code: "ha", name: "Hausa", native: "Hausa" },
  { code: "yo", name: "Yorùbá", native: "Yorùbá" },
  { code: "ig", name: "Igbo", native: "Asụsụ Igbo" },
  { code: "ff", name: "Fulfulde", native: "Fulfulde" },
  { code: "en", name: "English", native: "English" },
];

const PRESET_PROMPTS: SamplePrompt[] = [
  {
    lang: "ha",
    label: "Hausa: Pest Control",
    query: "Taya zan kare amfanin gona na daga kwari a lokacin ruwan sama?",
  },
  {
    lang: "yo",
    label: "Yorùbá: Cassava Health",
    query: "Bawo ni mo ṣe le daabobo gbingbin gbaguda mi lọwọ awọn kokoro?",
  },
  {
    lang: "ig",
    label: "Igbo: Soil Moisture",
    query: "Kedu ka m ga-esi mara ma ala m nwere mmiri zuru ezu maka ji?",
  },
  {
    lang: "ff",
    label: "Fulfulde: Livestock & Crops",
    query: "No mbaawam-mi daɗndude aawdi am e mboros maayɗo?",
  },
  {
    lang: "en",
    label: "English: Nitrogen SOC",
    query: "What is the recommended nitrogen application for soil organic carbon stock increase?",
  },
];

const DEMO_RESPONSES: Record<LanguageCode, { answer: string; diagnosis: string; severity: "medium" | "high"; actions: string[]; trace: string }> = {
  ha: {
    answer: "Bisa ga bayanan gonar, ana bukatar a duba amfanin gona sosai kafin magani. Kula da yanayin ruwa a lemo.",
    diagnosis: "Early foliar stress or nitrogen deficiency detected",
    severity: "medium",
    actions: [
      "Kula da ganyen masara a kowane kwana biyu",
      "Yi amfani da taki da wuri kafin ruwa yayi yawa",
      "Dauki hoton shuka sannan a aika ma jami'i",
    ],
    trace: "KGML-Ag: Hausa Agronomic Protocol v1.0",
  },
  yo: {
    answer: "Gẹgẹ bi ipo oko, a nilo ayewo to peye ki a to lo itọju. Kokoro Fall Armyworm n bọ lori ewe.",
    diagnosis: "Possible Fall Armyworm infestation activity",
    severity: "high",
    actions: [
      "Yẹ apakan abẹ ewe wo ni kutukutu owurọ",
      "Aba itọju alagbara nikan ki o to lo oogun",
      "Lo itọju ti a fọwọsi gẹgẹ bi alaye jami'i oko",
    ],
    trace: "KGML-Ag: Yorùbá IPM Protocol v1.0",
  },
  ig: {
    answer: "Dabere na nhazi ala gị, a chọrọ nyocha nke ọma tupu itinye fatịlaịza. Ala chọrọ mmiri.",
    diagnosis: "Moisture stress and delayed tuber growth warning",
    severity: "medium",
    actions: [
      "Hụ na mmiri na-erute n'mgbọrọgwụ ji",
      "Agbanyela kemikal karịrị akara CCSA",
      "Zipụ foto nke akwụkwọ gaa n'ọfịs digital extension",
    ],
    trace: "KGML-Ag: Igbo Yam Advisory Protocol v1.0",
  },
  ff: {
    answer: "E ley ko limtaa ngesa ma, eɓe poti ndaarde ko aawdi ndii yiɗi hade ko fawde lekki.",
    diagnosis: "Soil compaction and nutrient leaching risk",
    severity: "medium",
    actions: [
      "Ƴeewto ndiyam nder leydi ko adii aawngo",
      "Kuutoro ɓeydaari leydi e ko CCSA foti yamiɗinde",
    ],
    trace: "KGML-Ag: Fulfulde Pastoral-Crop Protocol v1.0",
  },
  en: {
    answer: "Based on field soil organic carbon baseline (1.2%), cover cropping combined with reduced tillage increases SOC stock by +1.4 tC/ha/yr.",
    diagnosis: "Nitrogen synchronization opportunity & SOC build-up",
    severity: "medium",
    actions: [
      "Plant leguminous cover crops post-harvest",
      "Maintain 80% crop residue retention on field boundaries",
      "Verify bulk density at 30cm sampling depth before carbon audit",
    ],
    trace: "KGML-Ag: RothC Soil Carbon Model v1.0",
  },
};

export function InteractiveAiSandbox() {
  const [selectedLang, setSelectedLang] = useState<LanguageCode>("ha");
  const [inputQuery, setInputQuery] = useState(PRESET_PROMPTS[0]!.query);
  const [loading, setLoading] = useState(false);
  const [activeResponse, setActiveResponse] = useState(DEMO_RESPONSES["ha"]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  function handleSelectPrompt(prompt: SamplePrompt) {
    setSelectedLang(prompt.lang);
    setInputQuery(prompt.query);
    const resp = DEMO_RESPONSES[prompt.lang] ?? DEMO_RESPONSES["ha"];
    setActiveResponse(resp);
  }

  function handleRunAdvisory() {
    setLoading(true);
    setTimeout(() => {
      const resp = DEMO_RESPONSES[selectedLang] ?? DEMO_RESPONSES["ha"];
      setActiveResponse(resp);
      setLoading(false);
    }, 600);
  }

  function toggleAudioPlayback() {
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      return;
    }

    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(activeResponse.answer);
      utterance.rate = 0.95;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlayingAudio(true);
      setTimeout(() => setIsPlayingAudio(false), 3000);
    }
  }

  return (
    <div className="border border-neutral-800 bg-[#0d0e10] p-6 rounded-none space-y-6 font-mono">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-bold text-white uppercase tracking-widest">
            ZORA VOICE DIALECT SANDBOX
          </span>
        </div>
        <span className="text-[10px] text-neutral-500 uppercase tracking-widest">
          [KGML-AG REASONING]
        </span>
      </div>

      {/* Language Dialect Selector */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase text-neutral-400 tracking-wider block">
          SELECT DIALECT LANGUAGE:
        </span>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setSelectedLang(lang.code);
                const resp = DEMO_RESPONSES[lang.code] ?? DEMO_RESPONSES["ha"];
                setActiveResponse(resp);
              }}
              className={`px-3 py-1 text-xs uppercase tracking-wider transition-all border ${
                selectedLang === lang.code
                  ? "bg-white text-black font-bold border-white"
                  : "bg-transparent text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-600"
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </div>

      {/* Preset Prompts */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase text-neutral-400 tracking-wider block">
          SAMPLE AGRONOMIC PROMPTS:
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESET_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSelectPrompt(prompt)}
              className="text-[10px] px-2.5 py-1 bg-neutral-900 border border-neutral-800 text-neutral-300 hover:border-emerald-500/50 hover:text-emerald-300 transition-colors"
            >
              {prompt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Query Box */}
      <div className="relative">
        <textarea
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          rows={2}
          className="w-full border border-neutral-800 bg-neutral-950 p-3 text-xs text-white placeholder-neutral-600 focus:border-emerald-500 focus:outline-none resize-none font-mono"
          placeholder="Ask Zora any agronomic query in your language..."
        />
        <div className="absolute right-2 bottom-2">
          <Button
            size="sm"
            onClick={handleRunAdvisory}
            disabled={loading}
            className="bg-white text-black hover:bg-neutral-200 font-mono text-[11px] uppercase tracking-wider font-bold h-7 px-3 rounded-none"
          >
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
            <span>{loading ? "Reasoning" : "Infer"}</span>
          </Button>
        </div>
      </div>

      {/* Response Card */}
      <div className="border border-neutral-800 bg-neutral-950 p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-neutral-900 pb-2 text-[11px]">
          <span className="text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" /> ZORA ADVISORY OUTPUT
          </span>
          <button
            onClick={toggleAudioPlayback}
            className="flex items-center gap-1 text-[10px] px-2 py-0.5 border border-neutral-800 hover:border-emerald-500 text-neutral-300 uppercase transition-colors"
          >
            {isPlayingAudio ? <Volume2 className="h-3 w-3 text-emerald-400 animate-pulse" /> : <Play className="h-3 w-3 text-neutral-400" />}
            <span>{isPlayingAudio ? "Playing" : "Voice Synthesis"}</span>
          </button>
        </div>

        <p className="text-xs text-neutral-200 leading-relaxed font-sans bg-neutral-900/60 p-3 border border-neutral-800/80">
          "{activeResponse.answer}"
        </p>

        <div className="space-y-1 pt-1">
          <span className="text-[9px] uppercase tracking-widest text-neutral-500 block">
            RECOMMENDED ACTIONS:
          </span>
          <ul className="space-y-1 font-sans text-xs text-neutral-300">
            {activeResponse.actions.map((act, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-400 font-mono">•</span>
                <span>{act}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between border-t border-neutral-900 pt-2 text-[9px] text-neutral-500 uppercase">
          <span className="text-emerald-400">{activeResponse.trace}</span>
          <span>CONFIDENCE: 86%</span>
        </div>
      </div>
    </div>
  );
}
