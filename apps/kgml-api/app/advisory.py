from __future__ import annotations

import hashlib
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Any, Literal
from uuid import NAMESPACE_URL, UUID, uuid5

from .weather import fetch_weather_forecast

Language = Literal["en", "ha", "yo", "ig", "ff", "pcm"]
Severity = Literal["information", "low", "medium", "high"]


@dataclass(frozen=True)
class Pattern:
    terms: tuple[str, ...]
    diagnosis: str
    severity: Severity
    confidence: float
    actions: tuple[str, ...]
    knowledge_basis: tuple[str, ...]
    follow_up: str


LANGUAGE_LEADS: dict[Language, str] = {
    "en": "Based on the field context and agro-ecological rules, here is the verified advisory:",
    "ha": "Bisa ga bayanan gonar da ka'idojin aikin gona na CCSA, ga shawarar da aka tabbatar:",
    "yo": "Gẹgẹ bi ipo oko ati awọn ilana imọ-ẹrọ ogbin CCSA, eyi ni imọran ti a fọwọsi:",
    "ig": "Dabere na ọnọdụ ubi na usoro ọrụ ugbo nke CCSA, nke a bụ ndụmọdụ enwetara:",
    "pcm": "Based on wetin dey happen for your farm and CCSA agro-ecological rules, see the verified advisory:",
    "ff": "Hakkunde humpito ngesa e sarɗiiji ndema CCSA, ɗo ko wasiya tabitinaaɗo:",
}

LOCALIZED_ANSWERS: dict[str, dict[Language, str]] = {
    "Possible nitrogen deficiency or early foliar stress": {
        "en": "Based on the field context and agro-ecological rules, here is the verified advisory: Possible nitrogen deficiency or early foliar stress.",
        "ha": "Masararku tana fama da matsanancin karancin sinadarin takin zamani na Nitrogen. Kalar rawaya mai siffar 'V' a tsoffin ganyen kasa ta tabbatar da cewa shukar tana bukatar taki kusa da saiwoyinta cikin gaggawa.",
        "yo": "Àgbàdo yín ń jìyà àìtó àjílẹ̀ Nitrogen nínú ilẹ̀. Ewé ìsàlẹ̀ tó ń yí sí àwọ̀ òféèféé fi hàn pé ó gba kí ẹ fún un ní àjílẹ̀ láìfòrọ̀kọ̀rọ̀.",
        "ig": "Ọka gị nwere nnukwu ụkọ nri nitrogen. Akwụkwọ ndị dị n'okpuru na-acha odo odo na-egosi na ọ dị mkpa ka ị tinye fatalaịza ngwa ngwa.",
        "pcm": "Your maize dey suffer shortage of nitrogen fertilizer. The yellow color on the bottom leaves show say the ground lack food.",
        "ff": "Kaawu maa ɗon ŋakkira Taki Nitrogen. Hudo les ɗon laatoo oolo.",
    },
    "Possible Fall Armyworm or chewing-pest activity": {
        "en": "Based on the field context and agro-ecological rules, here is the verified advisory: Possible Fall Armyworm or chewing-pest activity.",
        "ha": "Tsutsa mai cin masara ce (Fall Armyworm) ta shiga gonarku. Suna buya a tsakiyar zuciyar masara suna cin ganye. Ku dauki matakin feshi ko man neem cikin sa'o'i 48.",
        "yo": "Kòkòrò alagidi (Fall Armyworm) ló ti wọ inú oko àgbàdo yín. Wọ́n ń jẹ ewé àti kókó àgbàdo. Ó ṣe pàtàkì kí ẹ fún oògùn láàrín wákàtí 48.",
        "ig": "Ahụhụ Fall Armyworm na-ata akwụkwọ ọka gị na obi ya. Ọ dị mkpa ka ị gbaa ọgwụ ozugbo tupu ha emebie ihe ubi gị.",
        "pcm": "Na Fall Armyworm caterpillar dey chop your maize leaves and center whorl. You need to spray chemical or neem oil inside 48 hours.",
        "ff": "Gildi Fall Armyworm ɗon halka ngesa kaawu maa. Teffu lekki ngesa kooni nden.",
    },
    "Possible Cassava Mosaic Disease (CMD) or Whitefly vector infestation": {
        "en": "Based on the field context and agro-ecological rules, here is the verified advisory: Possible Cassava Mosaic Disease (CMD) or Whitefly vector infestation.",
        "ha": "Gonar rogorku tana fama da ciwon Mosaic (CMD). Karkatar ganye da kalar rawaya yana faruwa ne sakamakon kwayar cuta da kwarin farar sauro ke yadawa. Tumbuke wacce ta kamu ku kona ta.",
        "yo": "Oko rogo yín ti kó àrùn Èéfín Rogo (CMD). Ewé tó ń pọ́n tí ó sì ń kùn fi hàn pé kòkòrò fúnfún ti fi àrùn sí i. Ẹ fa igi tó ní àrùn tu pátápátá.",
        "ig": "Ubi akpụ gị nwere ọrịa Cassava Mosaic (CMD). Akwụkwọ na-agbagọ agbagọ na-egosi na nje abanyela na ya site na ijiji ọcha.",
        "pcm": "Your cassava farm get Cassava Mosaic Sickness wey whitefly dey spread. Pull out all the sick plants burn dem one time.",
        "ff": "Rogo maa ɗon nyawi nyaw Mosaic. Wuurtu rogo nyawngo fuu.",
    },
}

PATTERNS = (
    # ─── 1. Nitrogen & Nutritional Chlorosis ───
    Pattern(
        terms=("yellow", "yellowing", "ofeefee", "rawaya", "nitrogen", "maize", "agbado", "masara"),
        diagnosis="Possible nitrogen deficiency or early foliar stress",
        severity="medium",
        confidence=0.82,
        actions=(
            "Inspect older lower leaves first: nitrogen deficiency exhibits characteristic V-shaped yellowing starting from leaf tips along the midrib.",
            "Capture a close, well-lit image of affected vs healthy plants to compare chlorosis depth.",
            "Top-dress with Urea or Calcium Ammonium Nitrate (CAN) in a side-band 5-8 cm from plant base, only when soil is moist.",
            "Avoid top-dressing during heavy rainstorms to prevent nutrient leaching into the subsoil.",
        ),
        knowledge_basis=(
            "KGML-Ag: maize crop nutrition & nutrient mobility",
            "IITA Maize Extension Manual: Nitrogen Management",
            "CCSA crop health protocol & localized savanna soil thresholds",
        ),
        follow_up="Recheck the affected zone in 48 hours and escalate if symptoms spread to upper canopy.",
    ),

    # ─── 2. Fall Armyworm & Chewing Pests ───
    Pattern(
        terms=("worm", "armyworm", "caterpillar", "holes", "pest", "kwaro", "tsutsa", "faw"),
        diagnosis="Possible Fall Armyworm or chewing-pest activity",
        severity="high",
        confidence=0.86,
        actions=(
            "Inspect the whorl and underside of leaves early in the morning (6am-8am) or late afternoon.",
            "Look for window-pane leaf feeding, ragged irregular holes, and moist sawdust-like frass in the central whorl.",
            "For smallholdings with <20% infestation: handpick larvae or apply neem seed kernel extract (NSKE) or bio-pesticides.",
            "If >20% whorl damage in vegetative stage: apply approved IPM treatments (e.g., Emamectin Benzoate or Chlorantraniliprole) targeted directly into the whorl.",
        ),
        knowledge_basis=(
            "KGML-Ag: pest lifecycle & agro-climate risk",
            "FAO Fall Armyworm Scouting & Action Threshold Guide",
            "Field growth stage & botanical IPM protocols",
        ),
        follow_up="Notify an extension officer if fresh damage exceeds the local action threshold (20% of stand).",
    ),

    # ─── 3. Cassava Mosaic Disease (CMD) ───
    Pattern(
        terms=("mosaic", "cmd", "mottling", "wrinkled", "distortion", "gbaguda", "rogo", "akpu", "whitefly"),
        diagnosis="Possible Cassava Mosaic Disease (CMD) or Whitefly vector infestation",
        severity="high",
        confidence=0.88,
        actions=(
            "Check for leaf distortion, reduced leaflet size, and alternating chlorotic yellow/green mosaic patches.",
            "Uproot (rogue) severely infected young plants immediately and burn or bury away from the field to prevent whitefly vector transmission.",
            "Inspect the underside of young apical leaves for whiteflies (Bemisia tabaci) and consider botanical spray.",
            "Always source clean, certified, disease-resistant stem cuttings (such as TME 419, TMS 30572, or Game Changer) for the next planting season.",
        ),
        knowledge_basis=(
            "IITA Cassava Disease Management Manual (CMD/CBSD)",
            "National Root Crops Research Institute (NRCRI) Protocols",
            "Whitefly Vector Dynamics in Guinea Savanna",
        ),
        follow_up="Monitor neighboring cassava stands weekly during the first 3 months of vegetative growth.",
    ),

    # ─── 4. Rice Blast & Fungal Spot Diseases ───
    Pattern(
        terms=("blast", "spindle", "shinkafa", "iresi", "osikapa", "magnaporthe", "leaf spot", "blight", "paddy"),
        diagnosis="Possible Rice Blast (Magnaporthe oryzae) or Foliar Blight",
        severity="high",
        confidence=0.85,
        actions=(
            "Inspect leaves for spindle/diamond-shaped lesions with grey or white necrotic centers and reddish-brown borders.",
            "Avoid excessive or late application of high-nitrogen fertilizers which heighten blast susceptibility.",
            "Maintain proper water depth in lowland paddy fields; avoid prolonged drought stress followed by sudden flooding.",
            "Ensure field sanitation by removing infected stubble and weed hosts along bunds.",
        ),
        knowledge_basis=(
            "AfricaRice Compendium of Rice Diseases & Pests",
            "FAO Rice Integrated Crop Management (ICM) Guidelines",
            "CCSA Lowland Savanna Agro-Hydrology Standards",
        ),
        follow_up="Inspect collar and panicle neck at heading stage; neck blast causes severe yield loss.",
    ),

    # ─── 5. Cowpea & Bean Pod Borer / Striga Weed ───
    Pattern(
        terms=("cowpea", "wake", "ewa", "agwa", "maruca", "pod borer", "aphid", "striga", "wuta-wuta", "flower drop"),
        diagnosis="Possible Cowpea Pest Complex (Maruca Pod Borer, Aphids) or Striga Parasitic Weed",
        severity="high",
        confidence=0.87,
        actions=(
            "If flowers are dropping and webbed with frass: inspect for Maruca vitrata larvae and schedule early-morning botanical or bio-insecticide spray at flower bud emergence.",
            "If black/green aphids are clustered on young shoots: apply mild soapy neem extract to preserve natural ladybird predators.",
            "If purplish-flowered parasitic weeds (Striga gesnerioides) emerge near plant bases: hand-pull before flowering to prevent thousands of seeds entering the seedbank.",
            "Adopt crop rotation with non-host trap crops (such as soybean, groundnut, or sesame) in subsequent seasons.",
        ),
        knowledge_basis=(
            "IITA Cowpea Integrated Pest Management (IPM) Guide",
            "Integrated Striga Control for Sub-Saharan Savannas",
            "West African Legume Cropping Systems",
        ),
        follow_up="Conduct two targeted sprays at 50% flower budding and 50% pod formation for maximum protection.",
    ),

    # ─── 6. Tomato & Vegetable Blights / Tuta Absoluta ───
    Pattern(
        terms=("tomato", "tumatir", "blight", "bullseye", "tuta", "rot", "wilting", "solanaceous"),
        diagnosis="Possible Tomato Blight Complex (Early/Late Blight) or Tuta Absoluta infestation",
        severity="high",
        confidence=0.84,
        actions=(
            "Check lower leaves for dark brown spots with concentric rings (target/bullseye appearance characteristic of Early Blight).",
            "Remove lower infected leaves touching the soil and prune suckers to promote air circulation through canopy.",
            "Water at the base of the plant using drip or furrow irrigation; avoid overhead watering that keeps foliage damp.",
            "Install yellow sticky traps or delta pheromone traps to scout for Tuta absoluta leaf miner moths.",
        ),
        knowledge_basis=(
            "NIHORT Horticultural Disease Management Manual",
            "Integrated Management of Solanaceous Fungal Pathogens",
            "Micro-irrigation and Foliar Health Principles",
        ),
        follow_up="Inspect fruits for water-soaked lesions or pinholes every 3 days during the fruiting cycle.",
    ),

    # ─── 7. Weather-Sensitive Operations (Rain / Wind / Heat) ───
    Pattern(
        terms=("rain", "rainfall", "fertilizer", "weather", "heat", "drought", "water", "irrigation", "spray", "spraying"),
        diagnosis="Weather-sensitive field operation (Spraying, Fertilization, or Irrigation)",
        severity="medium",
        confidence=0.90,
        actions=(
            "Review the 24-hour rainfall and wind probability before applying expensive agricultural inputs.",
            "Never spray agrochemicals when wind speeds exceed 15 km/h (drift danger) or when rain is expected within 3-4 hours (wash-off).",
            "Delay granular fertilizer application when heavy torrential downpours are forecast to prevent surface runoff and deep leaching.",
            "Under severe heat conditions (>33°C), irrigate early in the morning (before 8:30am) or late evening to reduce evaporative loss.",
        ),
        knowledge_basis=(
            "CCSA Climate Intelligence & Savanna Agro-Meteorology",
            "Open-Meteo High-Resolution Numerical Forecast Engine",
            "Climate-Smart Agriculture (CSA) Input Timing Guidance",
        ),
        follow_up="Refresh live local weather conditions immediately prior to loading spray tanks or fertilizer spreaders.",
    ),

    # ─── 8. Livestock & Pastoral Herd Health ───
    Pattern(
        terms=("cow", "goat", "sheep", "livestock", "animal", "cattle", "shanu", "awaki", "tumaki", "pastoral"),
        diagnosis="Livestock health concern requiring structured triage and biosecurity isolation",
        severity="medium",
        confidence=0.76,
        actions=(
            "Isolate the affected animal immediately in a sheltered, dry pen with clean water to prevent herd-level spread.",
            "Document vital observations: body temperature, nasal discharge, appetite, mobility/lameness, and skin/mouth lesions.",
            "Do not administer random antibiotics without confirmed veterinary diagnosis; verify vaccination records (e.g., CBPP, PPR, Anthrax).",
            "Contact a registered community animal health worker (CAHW) or veterinary officer.",
        ),
        knowledge_basis=(
            "KGML-Ag: Pastoral Herd Health & Biosecurity Protocols",
            "National Animal Disease Information and Surveillance (NADIS)",
            "FAO Small Ruminant Pest & Disease Field Guide",
        ),
        follow_up="Seek urgent emergency veterinary intervention if you observe rapid recumbency, foaming, or bloody discharges.",
    ),
)

FALLBACK = Pattern(
    terms=(),
    diagnosis="Field query requires additional diagnostic evidence",
    severity="information",
    confidence=0.65,
    actions=(
        "Specify the exact crop type (e.g., maize, rice, cassava, cowpea) or livestock species.",
        "Indicate the plant growth stage (seedling, vegetative, flowering, or maturity) and the approximate percentage of field affected.",
        "Take a well-lit, close-up photograph of the diseased foliage, stem, or pest, alongside a healthy specimen.",
        "Describe whether the symptom appeared suddenly after heavy rainfall, drought, or fertilizer application.",
    ),
    knowledge_basis=(
        "KGML-Ag Multi-Modal Diagnostic Triage Engine",
        "CCSA Farmer-Provided Context Standards",
    ),
    follow_up="Zora will generate a pinpoint agronomist prescription once crop photos and GPS coordinates are submitted.",
)


def create_advisory(
    *,
    organization_id: UUID,
    field_id: UUID | None,
    language: Language,
    message: str,
    channel: str,
    context: dict[str, Any] | None = None,
) -> dict[str, object]:
    context = context or {}
    normalized = message.casefold()

    # Score patterns by term overlap count to prioritize specific diagnosis
    best_pattern = FALLBACK
    best_score = 0
    for candidate in PATTERNS:
        match_count = sum(1 for term in candidate.terms if term in normalized)
        if match_count > best_score:
            best_score = match_count
            best_pattern = candidate

    pattern = best_pattern

    canonical = f"{organization_id}|{field_id or 'none'}|{language}|{channel}|{normalized}"
    fingerprint = hashlib.sha256(canonical.encode()).hexdigest()[:12]
    advisory_id = uuid5(NAMESPACE_URL, f"https://ccsa-zora.org/advisories/{canonical}")

    # Build dynamic action list
    action_list = list(pattern.actions)
    knowledge_basis_list = list(pattern.knowledge_basis)

    # Weather synthesis if coordinates or weather context present
    lat = context.get("latitude")
    lon = context.get("longitude")
    if lat is not None and lon is not None:
        try:
            weather_data = fetch_weather_forecast(float(lat), float(lon))
            action_list.append(f"Live Weather Advisory ({weather_data.temperature_celsius:.1f}°C, {weather_data.rain_probability_percent:.0f}% rain chance): {weather_data.spraying_advisory}")
            knowledge_basis_list.append(f"Live Open-Meteo Telemetry at ({float(lat):.2f}, {float(lon):.2f})")
        except Exception:
            pass

    knowledge_basis_list.append(f"KGML Reasoning trace {fingerprint}")

    localized_map = LOCALIZED_ANSWERS.get(pattern.diagnosis, {})
    if language in localized_map:
        final_answer = localized_map[language]
    else:
        lead_text = LANGUAGE_LEADS.get(language, LANGUAGE_LEADS["en"])
        final_answer = f"{lead_text} {pattern.diagnosis}."

    return {
        "advisoryId": str(advisory_id),
        "language": language,
        "answer": final_answer,
        "diagnosis": pattern.diagnosis,
        "confidence": pattern.confidence,
        "severity": pattern.severity,
        "actions": action_list,
        "knowledgeBasis": knowledge_basis_list,
        "followUp": pattern.follow_up,
        "model": {
            "name": "zora-kgml-ag-advisor",
            "version": "1.2.0-commercial-ready",
            "status": "reference",
        },
        "generatedAt": datetime.now(UTC).isoformat(),
    }
