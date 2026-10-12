import { createHash, randomUUID } from "node:crypto";

import type { ZoraAdvisoryInput, ZoraAdvisoryResult, ZoraLanguage } from "@ccsa-zora/utils/api";

const localizedLead: Record<ZoraLanguage, string> = {
  en: "Based on the field context and agro-ecological rules, here is the verified advisory:",
  ha: "Bisa ga bayanan gonar da ka'idojin aikin gona na CCSA, ga shawarar da aka tabbatar:",
  yo: "Gẹgẹ bi ipo oko ati awọn ilana imọ-ẹrọ ogbin CCSA, eyi ni imọran ti a fọwọsi:",
  ig: "Dabere na ọnọdụ ubi na usoro ọrụ ugbo nke CCSA, nke a bụ ndụmọdụ enwetara:",
  pcm: "Based on your farm context and CCSA agro-ecological rules, see the verified advisory:",
  ff: "Hakkunde humpito ngesa e sarɗiiji ndema CCSA, ɗo ko wasiya tabitinaaɗo:",
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
      "Inspect older lower leaves first: nitrogen deficiency exhibits characteristic V-shaped chlorosis along the midrib.",
      "Capture a close, well-lit image of affected vs healthy plants to compare chlorosis depth.",
      "Top-dress with Urea or Calcium Ammonium Nitrate (CAN) in a side-band 5-8 cm from plant base when soil is moist.",
      "Avoid top-dressing during heavy rainstorms to prevent nutrient leaching into the subsoil.",
    ],
    knowledgeBasis: [
      "KGML-Ag: maize crop nutrition & nutrient mobility",
      "IITA Maize Extension Manual: Nitrogen Management",
      "CCSA crop health protocol & localized savanna soil thresholds",
    ],
    followUp: "Recheck the affected zone in 48 hours and escalate if symptoms spread to upper canopy.",
  },
  {
    terms: ["worm", "armyworm", "caterpillar", "holes", "pest", "kwaro", "tsutsa", "faw"],
    diagnosis: "Possible Fall Armyworm or chewing-pest activity",
    severity: "high",
    confidence: 0.86,
    actions: [
      "Inspect the whorl and underside of leaves early in the morning (6am-8am) or late afternoon.",
      "Look for window-pane leaf feeding, ragged irregular holes, and moist sawdust-like frass in the central whorl.",
      "For smallholdings with <20% infestation: handpick larvae or apply neem seed kernel extract (NSKE).",
      "If >20% whorl damage in vegetative stage: apply approved IPM treatments (e.g. Emamectin Benzoate) directly into the whorl.",
    ],
    knowledgeBasis: [
      "KGML-Ag: pest lifecycle & agro-climate risk",
      "FAO Fall Armyworm Scouting & Action Threshold Guide",
      "Field growth stage & botanical IPM protocols",
    ],
    followUp: "Notify an extension officer if fresh damage exceeds the local action threshold (20% of stand).",
  },
  {
    terms: ["mosaic", "cmd", "mottling", "wrinkled", "distortion", "gbaguda", "rogo", "akpu", "whitefly"],
    diagnosis: "Possible Cassava Mosaic Disease (CMD) or Whitefly vector infestation",
    severity: "high",
    confidence: 0.88,
    actions: [
      "Check for leaf distortion, reduced leaflet size, and alternating chlorotic yellow/green mosaic patches.",
      "Uproot (rogue) severely infected young plants immediately and burn or bury away from field.",
      "Inspect underside of young apical leaves for whiteflies (Bemisia tabaci) and consider botanical spray.",
      "Source clean, certified, disease-resistant stem cuttings (TME 419, TMS 30572) for the next planting season.",
    ],
    knowledgeBasis: [
      "IITA Cassava Disease Management Manual (CMD/CBSD)",
      "National Root Crops Research Institute (NRCRI) Protocols",
      "Whitefly Vector Dynamics in Guinea Savanna",
    ],
    followUp: "Monitor neighboring cassava stands weekly during the first 3 months of vegetative growth.",
  },
  {
    terms: ["blast", "spindle", "shinkafa", "iresi", "osikapa", "magnaporthe", "leaf spot", "blight", "paddy"],
    diagnosis: "Possible Rice Blast (Magnaporthe oryzae) or Foliar Blight",
    severity: "high",
    confidence: 0.85,
    actions: [
      "Inspect leaves for spindle/diamond-shaped lesions with grey or white necrotic centers and reddish-brown borders.",
      "Avoid excessive or late application of high-nitrogen fertilizers which heighten blast susceptibility.",
      "Maintain proper water depth in lowland paddy fields; avoid prolonged drought stress followed by sudden flooding.",
      "Ensure field sanitation by removing infected stubble and weed hosts along bunds.",
    ],
    knowledgeBasis: [
      "AfricaRice Compendium of Rice Diseases & Pests",
      "FAO Rice Integrated Crop Management (ICM) Guidelines",
      "CCSA Lowland Savanna Agro-Hydrology Standards",
    ],
    followUp: "Inspect collar and panicle neck at heading stage; neck blast causes severe yield loss.",
  },
  {
    terms: ["cowpea", "wake", "ewa", "agwa", "maruca", "pod borer", "aphid", "striga", "wuta-wuta", "flower drop"],
    diagnosis: "Possible Cowpea Pest Complex (Maruca Pod Borer, Aphids) or Striga Parasitic Weed",
    severity: "high",
    confidence: 0.87,
    actions: [
      "If flowers are dropping and webbed with frass: inspect for Maruca vitrata larvae and schedule early-morning botanical spray.",
      "If black/green aphids are clustered on young shoots: apply mild soapy neem extract to preserve natural predators.",
      "If purplish-flowered parasitic weeds (Striga gesnerioides) emerge near plant bases: hand-pull before flowering.",
      "Adopt crop rotation with non-host trap crops (soybean, groundnut, sesame) in subsequent seasons.",
    ],
    knowledgeBasis: [
      "IITA Cowpea Integrated Pest Management (IPM) Guide",
      "Integrated Striga Control for Sub-Saharan Savannas",
      "West African Legume Cropping Systems",
    ],
    followUp: "Conduct two targeted sprays at 50% flower budding and 50% pod formation for maximum protection.",
  },
  {
    terms: ["tomato", "tumatir", "blight", "bullseye", "tuta", "rot", "wilting", "solanaceous"],
    diagnosis: "Possible Tomato Blight Complex (Early/Late Blight) or Tuta Absoluta infestation",
    severity: "high",
    confidence: 0.84,
    actions: [
      "Check lower leaves for dark brown spots with concentric rings (characteristic target appearance of Early Blight).",
      "Remove lower infected leaves touching the soil and prune suckers to promote air circulation through canopy.",
      "Water at plant base using drip or furrow irrigation; avoid overhead watering that keeps foliage damp.",
      "Install yellow sticky traps or delta pheromone traps to scout for Tuta absoluta leaf miner moths.",
    ],
    knowledgeBasis: [
      "NIHORT Horticultural Disease Management Manual",
      "Integrated Management of Solanaceous Fungal Pathogens",
      "Micro-irrigation and Foliar Health Principles",
    ],
    followUp: "Inspect fruits for water-soaked lesions or pinholes every 3 days during the fruiting cycle.",
  },
  {
    terms: ["rain", "rainfall", "fertilizer", "weather", "heat", "drought", "water", "irrigation", "spray", "spraying"],
    diagnosis: "Weather-sensitive field operation (Spraying, Fertilization, or Irrigation)",
    severity: "medium",
    confidence: 0.9,
    actions: [
      "Review the 24-hour rainfall and wind probability before applying expensive agricultural inputs.",
      "Never spray agrochemicals when wind speeds exceed 15 km/h (drift danger) or when rain is expected within 3-4 hours.",
      "Delay granular fertilizer application when heavy torrential downpours are forecast to prevent surface runoff.",
      "Under severe heat conditions (>33°C), irrigate early in the morning (before 8:30am) or late evening.",
    ],
    knowledgeBasis: [
      "CCSA Climate Intelligence & Savanna Agro-Meteorology",
      "Open-Meteo High-Resolution Numerical Forecast Engine",
      "Climate-Smart Agriculture (CSA) Input Timing Guidance",
    ],
    followUp: "Refresh live local weather conditions immediately prior to loading spray tanks or fertilizer spreaders.",
  },
  {
    terms: ["cow", "goat", "sheep", "livestock", "animal", "cattle", "shanu", "awaki", "tumaki", "pastoral"],
    diagnosis: "Livestock health concern requiring structured triage and biosecurity isolation",
    severity: "medium",
    confidence: 0.76,
    actions: [
      "Isolate the affected animal immediately in a sheltered, dry pen with clean water to prevent herd-level spread.",
      "Document vital observations: body temperature, nasal discharge, appetite, mobility/lameness, and skin/mouth lesions.",
      "Do not administer random antibiotics without confirmed veterinary diagnosis; verify vaccination records.",
      "Contact a registered community animal health worker (CAHW) or veterinary officer.",
    ],
    knowledgeBasis: [
      "KGML-Ag: Pastoral Herd Health & Biosecurity Protocols",
      "National Animal Disease Information and Surveillance (NADIS)",
      "FAO Small Ruminant Pest & Disease Field Guide",
    ],
    followUp:
      "Seek urgent veterinary intervention for breathing difficulty, rapid recumbency, or bloody discharges.",
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
  
  let bestPattern = fallback;
  let bestScore = 0;
  for (const candidate of patterns) {
    let score = 0;
    for (const term of candidate.terms) {
      if (normalized.includes(term)) {
        score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestPattern = candidate;
    }
  }

  const pattern = bestPattern;
  const fingerprint = createHash("sha256")
    .update(`${input.organizationId}|${input.fieldId ?? "none"}|${input.language}|${normalized}`)
    .digest("hex")
    .slice(0, 12);

  const lead = localizedLead[input.language] ?? localizedLead.en;

  return {
    advisoryId: randomUUID(),
    language: input.language,
    answer: `${lead} ${pattern.diagnosis}.`,
    diagnosis: pattern.diagnosis,
    confidence: pattern.confidence,
    severity: pattern.severity,
    actions: pattern.actions,
    knowledgeBasis: [...pattern.knowledgeBasis, `Reasoning trace ${fingerprint}`],
    followUp: pattern.followUp,
    model: {
      name: "zora-kgml-ag-advisor",
      version: "1.2.0-commercial-ready",
      status: "reference",
    },
    generatedAt: new Date().toISOString(),
  };
}
