import { createHash, randomUUID } from "node:crypto";

import type {
  ZoraAdvisoryInput,
  ZoraAdvisoryResult,
  ZoraLanguage,
} from "@ccsa-zora/utils/api";

const localizedLead: Record<ZoraLanguage, string> = {
  en: "Based on the field context, this needs a focused inspection before treatment.",
  ha: "Bisa ga bayanan gonar, ana bukatar a duba amfanin gona sosai kafin magani.",
  yo: "Gẹgẹ bi ipo oko, a nilo ayewo to peye ki a to lo itọju.",
  ig: "Dabere na ọnọdụ ubi, a chọrọ nyocha nke ọma tupu e tinye ọgwụgwọ.",
  ff: "Hakkunde humpito ngesa, ƴeewtere moƴƴere ina sokli hade e kuugal.",
};

interface AdvisoryPattern {
  terms: string[];
  diagnosis: string;
  severity: ZoraAdvisoryResult["severity"];
  confidence: number;
  actions: string[];
  knowledgeBasis: string[];
  followUp: string;
}

const patterns: AdvisoryPattern[] = [
  {
    terms: ["yellow", "yellowing", "ofeefee", "rawaya", "nitrogen", "maize", "agbado", "masara"],
    diagnosis: "Possible nitrogen deficiency or early foliar stress",
    severity: "medium",
    confidence: 0.82,
    actions: [
      "Inspect both older and newer leaves for the yellowing pattern.",
      "Capture a close, well-lit image of affected and healthy plants.",
      "Check recent rainfall and soil moisture before applying nitrogen.",
    ],
    knowledgeBasis: ["KGML-Ag: maize nutrition", "Field moisture context", "CCSA crop health protocol"],
    followUp: "Recheck the affected zone in 48 hours and escalate if symptoms spread.",
  },
  {
    terms: ["worm", "armyworm", "caterpillar", "holes", "pest", "kwaro"],
    diagnosis: "Possible Fall Armyworm or chewing-pest activity",
    severity: "high",
    confidence: 0.86,
    actions: [
      "Inspect the whorl and underside of leaves early in the morning.",
      "Record the percentage of plants showing fresh feeding damage.",
      "Use locally approved integrated pest management thresholds before treatment.",
    ],
    knowledgeBasis: ["KGML-Ag: pest lifecycle", "FAW scouting protocol", "Field growth stage"],
    followUp: "Notify an extension officer if fresh damage exceeds the local action threshold.",
  },
  {
    terms: ["rain", "rainfall", "fertilizer", "weather", "heat", "drought", "water"],
    diagnosis: "Weather-sensitive field operation",
    severity: "medium",
    confidence: 0.9,
    actions: [
      "Review the 24-hour rainfall probability before applying inputs.",
      "Delay fertilizer when heavy rainfall or runoff risk is high.",
      "Prioritize moisture-conserving practices in stressed zones.",
    ],
    knowledgeBasis: ["Climate intelligence", "Field location", "CSA input timing guidance"],
    followUp: "Refresh the forecast immediately before the planned field operation.",
  },
  {
    terms: ["cow", "goat", "sheep", "livestock", "animal", "cattle"],
    diagnosis: "Livestock health concern requiring structured triage",
    severity: "medium",
    confidence: 0.72,
    actions: [
      "Separate the affected animal where safe to do so.",
      "Record temperature, appetite, mobility, and visible symptoms.",
      "Contact a veterinary professional for diagnosis and treatment.",
    ],
    knowledgeBasis: ["KGML-Ag: livestock health", "Biosecurity protocol", "Farmer observation"],
    followUp: "Seek urgent veterinary help for breathing difficulty, collapse, or rapid deterioration.",
  },
];

const fallback: AdvisoryPattern = {
  terms: [],
  diagnosis: "Field question requires more evidence",
  severity: "information",
  confidence: 0.62,
  actions: [
    "Share the crop or livestock type and growth or age stage.",
    "Add a clear photo and the field location if available.",
    "Describe when the issue began and how quickly it is spreading.",
  ],
  knowledgeBasis: ["KGML-Ag triage rules", "Farmer-provided context"],
  followUp: "Zora will refine the recommendation as evidence is added.",
};

export function createReferenceAdvisory(input: ZoraAdvisoryInput): ZoraAdvisoryResult {
  const normalized = input.message.toLocaleLowerCase();
  const pattern =
    patterns.find((candidate) => candidate.terms.some((term) => normalized.includes(term))) ??
    fallback;
  const fingerprint = createHash("sha256")
    .update(`${input.organizationId}|${input.fieldId ?? "none"}|${input.language}|${normalized}`)
    .digest("hex")
    .slice(0, 12);

  return {
    advisoryId: randomUUID(),
    language: input.language,
    answer: `${localizedLead[input.language]} ${pattern.diagnosis}.`,
    diagnosis: pattern.diagnosis,
    confidence: pattern.confidence,
    severity: pattern.severity,
    actions: pattern.actions,
    knowledgeBasis: [...pattern.knowledgeBasis, `Reasoning trace ${fingerprint}`],
    followUp: pattern.followUp,
    model: {
      name: "zora-kgml-ag-advisor",
      version: "1.0.0-reference",
      status: "reference",
    },
    generatedAt: new Date().toISOString(),
  };
}
