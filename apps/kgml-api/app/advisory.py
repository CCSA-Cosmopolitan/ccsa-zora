from __future__ import annotations

import hashlib
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Literal
from uuid import NAMESPACE_URL, UUID, uuid5

Language = Literal["en", "ha", "yo", "ig", "ff"]
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
    "en": "Based on the field context, this needs a focused inspection before treatment.",
    "ha": "Bisa ga bayanan gonar, ana bukatar a duba amfanin gona sosai kafin magani.",
    "yo": "Gẹgẹ bi ipo oko, a nilo ayewo to peye ki a to lo itọju.",
    "ig": "Dabere na ọnọdụ ubi, a chọrọ nyocha nke ọma tupu e tinye ọgwụgwọ.",
    "ff": "Hakkunde humpito ngesa, ƴeewtere moƴƴere ina sokli hade e kuugal.",
}

PATTERNS = (
    Pattern(
        terms=("yellow", "yellowing", "ofeefee", "rawaya", "nitrogen", "maize", "agbado", "masara"),
        diagnosis="Possible nitrogen deficiency or early foliar stress",
        severity="medium",
        confidence=0.82,
        actions=(
            "Inspect both older and newer leaves for the yellowing pattern.",
            "Capture a close, well-lit image of affected and healthy plants.",
            "Check recent rainfall and soil moisture before applying nitrogen.",
        ),
        knowledge_basis=(
            "KGML-Ag: maize nutrition",
            "Field moisture context",
            "CCSA crop health protocol",
        ),
        follow_up="Recheck the affected zone in 48 hours and escalate if symptoms spread.",
    ),
    Pattern(
        terms=("worm", "armyworm", "caterpillar", "holes", "pest", "kwaro"),
        diagnosis="Possible Fall Armyworm or chewing-pest activity",
        severity="high",
        confidence=0.86,
        actions=(
            "Inspect the whorl and underside of leaves early in the morning.",
            "Record the percentage of plants showing fresh feeding damage.",
            "Use locally approved integrated pest management thresholds before treatment.",
        ),
        knowledge_basis=("KGML-Ag: pest lifecycle", "FAW scouting protocol", "Field growth stage"),
        follow_up="Notify an extension officer if fresh damage exceeds the local action threshold.",
    ),
    Pattern(
        terms=("rain", "rainfall", "fertilizer", "weather", "heat", "drought", "water"),
        diagnosis="Weather-sensitive field operation",
        severity="medium",
        confidence=0.90,
        actions=(
            "Review the 24-hour rainfall probability before applying inputs.",
            "Delay fertilizer when heavy rainfall or runoff risk is high.",
            "Prioritize moisture-conserving practices in stressed zones.",
        ),
        knowledge_basis=("Climate intelligence", "Field location", "CSA input timing guidance"),
        follow_up="Refresh the forecast immediately before the planned field operation.",
    ),
    Pattern(
        terms=("cow", "goat", "sheep", "livestock", "animal", "cattle"),
        diagnosis="Livestock health concern requiring structured triage",
        severity="medium",
        confidence=0.72,
        actions=(
            "Separate the affected animal where safe to do so.",
            "Record temperature, appetite, mobility, and visible symptoms.",
            "Contact a veterinary professional for diagnosis and treatment.",
        ),
        knowledge_basis=("KGML-Ag: livestock health", "Biosecurity protocol", "Farmer observation"),
        follow_up=(
            "Seek urgent veterinary help for breathing difficulty, collapse, "
            "or rapid deterioration."
        ),
    ),
)

FALLBACK = Pattern(
    terms=(),
    diagnosis="Field question requires more evidence",
    severity="information",
    confidence=0.62,
    actions=(
        "Share the crop or livestock type and growth or age stage.",
        "Add a clear photo and the field location if available.",
        "Describe when the issue began and how quickly it is spreading.",
    ),
    knowledge_basis=("KGML-Ag triage rules", "Farmer-provided context"),
    follow_up="Zora will refine the recommendation as evidence is added.",
)


def create_advisory(
    *,
    organization_id: UUID,
    field_id: UUID | None,
    language: Language,
    message: str,
    channel: str,
) -> dict[str, object]:
    normalized = message.casefold()
    pattern = next(
        (
            candidate
            for candidate in PATTERNS
            if any(term in normalized for term in candidate.terms)
        ),
        FALLBACK,
    )
    canonical = f"{organization_id}|{field_id or 'none'}|{language}|{channel}|{normalized}"
    fingerprint = hashlib.sha256(canonical.encode()).hexdigest()[:12]
    advisory_id = uuid5(NAMESPACE_URL, f"https://ccsa-zora.org/advisories/{canonical}")

    return {
        "advisoryId": str(advisory_id),
        "language": language,
        "answer": f"{LANGUAGE_LEADS[language]} {pattern.diagnosis}.",
        "diagnosis": pattern.diagnosis,
        "confidence": pattern.confidence,
        "severity": pattern.severity,
        "actions": list(pattern.actions),
        "knowledgeBasis": [*pattern.knowledge_basis, f"Reasoning trace {fingerprint}"],
        "followUp": pattern.follow_up,
        "model": {
            "name": "zora-kgml-ag-advisor",
            "version": "1.0.0-reference",
            "status": "reference",
        },
        "generatedAt": datetime.now(UTC).isoformat(),
    }
