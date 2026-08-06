from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Any
from uuid import UUID, uuid4

MODEL_NAME = "zora-soc-stock-change"
MODEL_VERSION = "1.0.0-reference"
MODEL_SPECIFICATION = """
SOC stock (tC/ha) = SOC percent * bulk density (g/cm3) * depth (cm).
Net change (tCO2e) = (current stock - baseline stock) * area (ha) * 44/12.
95% interval combines a 20% change uncertainty with 3% baseline-stock floor.
Practice flags are plausibility context and never increase calculated removals.
""".strip()
MODEL_ARTIFACT_HASH = hashlib.sha256(MODEL_SPECIFICATION.encode()).hexdigest()


@dataclass(frozen=True)
class CarbonFeatures:
    area_hectares: float
    baseline_soc_percent: float
    current_soc_percent: float
    bulk_density_g_cm3: float
    sampling_depth_cm: float
    years_elapsed: float
    cover_crop: bool = False
    reduced_tillage: bool = False
    residue_retention_percent: float = 0.0


def merkle_root(hashes: list[str]) -> str:
    if not hashes:
        return hashlib.sha256(b"CCSA_ZORA_NO_EVIDENCE").hexdigest()
    level = [bytes.fromhex(item.lower()) for item in sorted(hashes)]
    while len(level) > 1:
        if len(level) % 2:
            level.append(level[-1])
        level = [
            hashlib.sha256(level[index] + level[index + 1]).digest()
            for index in range(0, len(level), 2)
        ]
    return level[0].hex()


def canonical_input_hash(field_id: UUID, observed_at: datetime, features: CarbonFeatures) -> str:
    payload = {
        "field_id": str(field_id),
        "observed_at": observed_at.astimezone(UTC).isoformat(),
        "features": features.__dict__,
        "model_version": MODEL_VERSION,
    }
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode()
    return hashlib.sha256(encoded).hexdigest()


def infer_soil_carbon(
    field_id: UUID,
    observed_at: datetime,
    features: CarbonFeatures,
    evidence_hashes: list[str],
    context: dict[str, Any],
) -> dict[str, Any]:
    baseline_stock_per_ha = (
        features.baseline_soc_percent * features.bulk_density_g_cm3 * features.sampling_depth_cm
    )
    current_stock_per_ha = (
        features.current_soc_percent * features.bulk_density_g_cm3 * features.sampling_depth_cm
    )
    change_tonnes_c = (current_stock_per_ha - baseline_stock_per_ha) * features.area_hectares
    net_tco2e = change_tonnes_c * (44.0 / 12.0)
    annualized = net_tco2e / features.years_elapsed

    # This conservative interval prevents a near-zero measured delta from
    # appearing falsely precise and makes the reference model unsuitable for
    # automatic credit issuance without methodology-specific calibration.
    uncertainty = max(
        abs(net_tco2e) * 0.20,
        baseline_stock_per_ha * features.area_hectares * (44.0 / 12.0) * 0.03,
    )
    lower = net_tco2e - 1.96 * uncertainty
    upper = net_tco2e + 1.96 * uncertainty

    constraints = [
        "Reference stock-change calculation; independent verifier approval "
        "is required before issuance.",
        "Bulk density and SOC samples must represent the same depth and "
        "statistically valid sampling design.",
        "Leakage, permanence, additionality, and project-boundary adjustments are not included.",
    ]
    annual_c_per_ha = change_tonnes_c / features.area_hectares / features.years_elapsed
    if abs(annual_c_per_ha) > 3.0:
        constraints.append(
            "Observed annual soil-carbon change exceeds the 3 tC/ha "
            "plausibility screen; review sampling and lab evidence."
        )
    if net_tco2e > 0 and not (features.cover_crop or features.reduced_tillage):
        constraints.append(
            "Positive stock change has no cover-crop or reduced-tillage "
            "practice flag; document the causal practice."
        )
    if not evidence_hashes:
        constraints.append(
            "No evidence hashes were supplied; this run is not eligible for an MRV evidence chain."
        )
    if context.get("methodology_code") is None:
        constraints.append("No carbon methodology code was supplied in context.")

    generated_at = datetime.now(UTC)
    return {
        "inferenceId": str(uuid4()),
        "fieldId": str(field_id),
        "observedAt": observed_at.astimezone(UTC).isoformat(),
        "model": {
            "name": MODEL_NAME,
            "version": MODEL_VERSION,
            "artifactHash": MODEL_ARTIFACT_HASH,
            "status": "reference",
        },
        "outputs": {
            "soilCarbonStockChangeTonnesC": round(change_tonnes_c, 6),
            "estimatedRemovalTco2e": round(net_tco2e, 6),
            "annualizedRemovalTco2e": round(annualized, 6),
            "lower95Tco2e": round(lower, 6),
            "upper95Tco2e": round(upper, 6),
        },
        "constraints": constraints,
        "evidenceMerkleRoot": merkle_root(evidence_hashes),
        "inputHash": canonical_input_hash(field_id, observed_at, features),
        "generatedAt": generated_at.isoformat(),
    }
