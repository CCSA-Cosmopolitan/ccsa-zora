import OpenAI from "openai";

import type { ZoraLanguage } from "@ccsa-zora/utils/api";

import { generateZoraAdvisory } from "./zora-ai-engine";

export interface AssistantTurn {
  role: "user" | "assistant";
  content: string;
}

export interface AssistantTip {
  tip: string;
  howToApply: string;
}

export interface AssistantReply {
  /** Short, natural text meant to be read aloud (voice). */
  spoken: string;
  diagnosis: string;
  severity: "information" | "low" | "medium" | "high";
  explanation: string;
  steps: string[];
  tips: AssistantTip[];
  organicAlternative?: string;
  safety?: string;
  followUp: string;
  sources: string[];
  engine: {
    /** KGML-Ag service supplied grounded facts for this answer. */
    kgml: boolean;
    /** GPT produced the final detailed explanation. */
    gpt: boolean;
    model: string;
  };
}

export interface AssistantRequest {
  message: string;
  language: ZoraLanguage;
  history?: AssistantTurn[];
  crop?: string;
  region?: string;
}

const LANGUAGE_NAMES: Record<ZoraLanguage, string> = {
  en: "simple English (short sentences, everyday Nigerian farm words)",
  ha: "Hausa (natural spoken Northern Nigerian Hausa)",
  yo: "Yorùbá (natural spoken South-Western Nigerian Yorùbá, with correct tone marks)",
  ig: "Igbo (natural spoken South-Eastern Nigerian Igbo)",
  ff: "Fulfulde (natural spoken Fulfulde)",
  pcm: "Nigerian Pidgin (warm, relaxed, everyday Pidgin)",
};

const SYSTEM_PROMPT = `You are Zora, a trusted farm helper for Nigerian smallholder farmers who may have no formal education and cannot read or write. Your answers are spoken aloud, so talk like a kind, experienced extension officer sitting beside the farmer.

You are given (1) the farmer's question and (2) optional GROUNDED FACTS from the CCSA KGML-Ag knowledge-guided engine (verified crop-science rules and live weather). Treat the grounded facts as the safe baseline. Use your own agronomic knowledge to explain them more fully, fill gaps, and adapt to what the farmer actually said. Never contradict the grounded safety limits. If the question is unclear, give the most likely help AND ask one simple follow-up question.

STYLE RULES
- Write ONLY in the requested language. Do not mix in untranslated English sentences (product or chemical names are fine).
- Use short, simple sentences and everyday words. No jargon. Explain any technical word in one phrase.
- Use local measures farmers know: 16-litre knapsack sprayer, bottle caps, tablespoons, "one bag (50 kg)", spacing in hand-spans or steps.
- Be specific and complete: say WHAT to do, HOW MUCH, WHEN (time of day and days), and WHAT to watch for afterwards.
- Safety first: protective cover, keep chemicals from children, food and water, never reuse containers. Prefer low-cost options when equally effective.
- If it could be a vet, health or legal problem, say to call an extension officer or vet.

OUTPUT: a single valid JSON object, no markdown, with exactly these keys:
{
  "diagnosis": "short name of the problem (local name + scientific name if relevant)",
  "severity": "information" | "low" | "medium" | "high",
  "explanation": "3-5 simple sentences: what is happening, why it happens, and how serious it is",
  "steps": ["4-6 clear numbered-style steps, each with amounts and timing"],
  "tips": [ { "tip": "a useful practical tip", "howToApply": "1-3 sentences on exactly how a smallholder applies that tip on their farm" } ],
  "organicAlternative": "low-cost botanical or local option, with amounts",
  "safety": "weather and personal safety advice for this action",
  "followUp": "when to check again and what good or bad signs look like",
  "spoken": "a warm 6-9 sentence version for speaking aloud: the problem, the main steps, the best tip with how to do it, and when to check again. No lists or symbols.",
  "sources": ["named research or guideline sources such as IITA, FAO, NIHORT"]
}
Provide 3 to 4 tips.`;

interface KgmlGrounding {
  answer?: string;
  diagnosis?: string;
  actions?: string[];
  knowledgeBasis?: string[];
  followUp?: string;
}

async function fetchKgmlGrounding(req: AssistantRequest): Promise<KgmlGrounding | null> {
  const apiUrl = process.env.KGML_API_URL ?? "http://127.0.0.1:8100";
  const serviceKey = process.env.KGML_SERVICE_KEY || "demo-service-key";
  const organizationId =
    process.env.NEXT_PUBLIC_ZORA_ORGANIZATION_ID ?? "00000000-0000-4000-8000-000000000001";

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    const response = await fetch(`${apiUrl}/v1/advisories`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-zora-service-key": serviceKey },
      body: JSON.stringify({
        organization_id: organizationId,
        field_id: null,
        language: "en",
        message: req.message,
        channel: "voice",
        context: { crop: req.crop, region: req.region },
      }),
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) return null;
    return (await response.json()) as KgmlGrounding;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.map((v) => String(v)).filter(Boolean) : [];

function normaliseSeverity(value: unknown): AssistantReply["severity"] {
  const v = String(value ?? "").toLowerCase();
  if (v === "critical" || v === "high") return "high";
  if (v === "medium") return "medium";
  if (v === "low") return "low";
  return "information";
}

function parseTips(value: unknown): AssistantTip[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return { tip: item, howToApply: "" };
      const obj = item as Record<string, unknown>;
      return { tip: String(obj.tip ?? ""), howToApply: String(obj.howToApply ?? "") };
    })
    .filter((t) => t.tip.length > 0);
}

export async function generateAssistantReply(req: AssistantRequest): Promise<AssistantReply> {
  const grounding = await fetchKgmlGrounding(req);
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const modelName = process.env.OPENAI_MODEL || "gpt-4o-mini";

  if (apiKey && apiKey.length > 10) {
    try {
      const openai = new OpenAI({ apiKey });
      const groundedBlock = grounding
        ? `GROUNDED FACTS FROM KGML-Ag (English):\n${JSON.stringify(
            {
              diagnosis: grounding.diagnosis,
              summary: grounding.answer,
              recommendedActions: grounding.actions,
              followUp: grounding.followUp,
              basis: grounding.knowledgeBasis,
            },
            null,
            2,
          )}`
        : "GROUNDED FACTS FROM KGML-Ag: none available for this question. Rely on established tropical agronomy and be careful.";

      const history = (req.history ?? []).slice(-6);
      const completion = await openai.chat.completions.create({
        model: modelName,
        temperature: 0.3,
        max_tokens: 1800,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...history.map((turn) => ({ role: turn.role, content: turn.content })),
          {
            role: "user",
            content: `Language to answer in: ${LANGUAGE_NAMES[req.language]}
Crop (if known): ${req.crop ?? "not stated"}
Region (if known): ${req.region ?? "Nigeria"}

${groundedBlock}

FARMER'S QUESTION:
"""${req.message}"""`,
          },
        ],
      });

      const raw = completion.choices[0]?.message?.content;
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        const steps = asStringArray(parsed.steps);
        const sources = asStringArray(parsed.sources);
        const merged = Array.from(new Set([...(grounding?.knowledgeBasis ?? []), ...sources]));
        return {
          spoken: String(parsed.spoken ?? parsed.explanation ?? ""),
          diagnosis: String(parsed.diagnosis ?? "Farm advice"),
          severity: normaliseSeverity(parsed.severity),
          explanation: String(parsed.explanation ?? ""),
          steps,
          tips: parseTips(parsed.tips),
          organicAlternative: parsed.organicAlternative ? String(parsed.organicAlternative) : undefined,
          safety: parsed.safety ? String(parsed.safety) : undefined,
          followUp: String(parsed.followUp ?? ""),
          sources: merged.length > 0 ? merged : ["CCSA KGML-Ag", "IITA", "FAO"],
          engine: { kgml: Boolean(grounding), gpt: true, model: modelName },
        };
      }
    } catch (error) {
      console.warn("[Zora Assistant] GPT call failed, using built-in knowledge:", error);
    }
  }

  // Fallback: built-in multilingual knowledge base (no API key / offline).
  const advisory = await generateZoraAdvisory({
    organizationId:
      process.env.NEXT_PUBLIC_ZORA_ORGANIZATION_ID ?? "00000000-0000-4000-8000-000000000001",
    language: req.language,
    message: req.message,
    channel: "voice",
    context: { crop: req.crop, region: req.region },
  });

  const steps = advisory.immediateActions ?? advisory.actions;
  const tips: AssistantTip[] = [];
  if (advisory.organicAlternative) {
    tips.push({ tip: advisory.organicAlternative, howToApply: advisory.weatherSafety ?? "" });
  }
  if (advisory.preventionProtocol) {
    tips.push({ tip: advisory.preventionProtocol, howToApply: advisory.followUp });
  }

  return {
    spoken: [advisory.answer, ...steps.slice(0, 2), advisory.followUp].join(" "),
    diagnosis: advisory.diagnosis,
    severity: advisory.severity,
    explanation: advisory.answer,
    steps,
    tips,
    organicAlternative: advisory.organicAlternative,
    safety: advisory.weatherSafety,
    followUp: advisory.followUp,
    sources: advisory.knowledgeBasis,
    engine: { kgml: Boolean(grounding), gpt: false, model: advisory.model.name },
  };
}
