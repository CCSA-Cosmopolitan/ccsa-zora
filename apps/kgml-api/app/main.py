from __future__ import annotations

import os
from collections.abc import Awaitable, Callable
from datetime import datetime
from secrets import compare_digest
from typing import Annotated, Any, Literal
from uuid import UUID

from fastapi import Depends, FastAPI, Header, HTTPException, Request, Response, status
from pydantic import BaseModel, ConfigDict, Field

from .advisory import create_advisory
from .model import CarbonFeatures, infer_soil_carbon

IS_PRODUCTION = os.getenv("VERCEL_ENV") == "production" or os.getenv("ZORA_ENV") == "production"

app = FastAPI(
    title="CCSA Zora Intelligence API",
    version="1.0.0",
    description=(
        "Auditable KGML-Ag and multilingual advisory service for climate-smart agriculture. "
        "Reference outputs are never equivalent to verified carbon issuance."
    ),
    docs_url=None if IS_PRODUCTION else "/docs",
    redoc_url=None if IS_PRODUCTION else "/redoc",
    openapi_url=None if IS_PRODUCTION else "/openapi.json",
)


@app.middleware("http")
async def security_headers(
    request: Request,
    call_next: Callable[[Request], Awaitable[Response]],
) -> Response:
    response = await call_next(request)
    response.headers["x-content-type-options"] = "nosniff"
    response.headers["x-frame-options"] = "DENY"
    response.headers["referrer-policy"] = "no-referrer"
    response.headers["cache-control"] = "no-store"
    return response


class HealthResponse(BaseModel):
    status: str
    service: str
    model_version: str


class ReadinessResponse(BaseModel):
    status: Literal["ready", "not_ready"]
    service_key_configured: bool


class InferenceFeatures(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    area_hectares: float = Field(alias="areaHectares", gt=0, le=1_000_000)
    baseline_soc_percent: float = Field(alias="baselineSoilOrganicCarbonPercent", ge=0, le=30)
    current_soc_percent: float = Field(alias="currentSoilOrganicCarbonPercent", ge=0, le=30)
    bulk_density_g_cm3: float = Field(alias="bulkDensityGramsCm3", ge=0.5, le=2.2)
    sampling_depth_cm: float = Field(alias="samplingDepthCm", ge=1, le=200)
    years_elapsed: float = Field(alias="yearsElapsed", gt=0, le=100)
    cover_crop: bool = Field(default=False, alias="coverCrop")
    reduced_tillage: bool = Field(default=False, alias="reducedTillage")
    residue_retention_percent: float = Field(
        default=0, alias="residueRetentionPercent", ge=0, le=100
    )


class InferenceRequest(BaseModel):
    field_id: UUID
    observed_at: datetime
    features: InferenceFeatures
    evidence_hashes: list[str] = Field(default_factory=list, max_length=10_000)
    context: dict[str, Any] = Field(default_factory=dict)


class AdvisoryRequest(BaseModel):
    organization_id: UUID
    field_id: UUID | None = None
    language: Literal["en", "ha", "yo", "ig", "ff"] = "en"
    message: str = Field(min_length=2, max_length=4_000)
    channel: Literal["web", "mobile", "voice"] = "web"
    context: dict[str, Any] = Field(default_factory=dict)


def require_service_key(
    supplied: Annotated[str | None, Header(alias="x-zora-service-key")] = None,
    legacy: Annotated[str | None, Header(alias="x-agrisense-service-key")] = None,
) -> None:
    expected = os.getenv("KGML_SERVICE_KEY")
    if not expected:
        if IS_PRODUCTION:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail={"code": "SERVICE_NOT_CONFIGURED"},
            )
        expected = "demo-service-key"
    provided = supplied or legacy or ""
    if not compare_digest(provided, expected):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_SERVICE_KEY"},
        )


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service="ccsa-zora-intelligence-api",
        model_version="1.0.0-reference",
    )


@app.get("/ready", response_model=ReadinessResponse)
async def ready(response: Response) -> ReadinessResponse:
    configured = bool(os.getenv("KGML_SERVICE_KEY")) or not IS_PRODUCTION
    if not configured:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    return ReadinessResponse(
        status="ready" if configured else "not_ready",
        service_key_configured=configured,
    )


@app.post(
    "/v1/kgml/inferences",
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_service_key)],
)
async def create_inference(request: InferenceRequest) -> dict[str, Any]:
    hashes = [item.lower() for item in request.evidence_hashes]
    if any(
        len(item) != 64 or any(char not in "0123456789abcdef" for char in item) for item in hashes
    ):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail={"code": "INVALID_EVIDENCE_HASH"},
        )
    features = CarbonFeatures(**request.features.model_dump())
    return infer_soil_carbon(
        field_id=request.field_id,
        observed_at=request.observed_at,
        features=features,
        evidence_hashes=hashes,
        context=request.context,
    )


@app.post(
    "/v1/advisories",
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_service_key)],
)
async def create_kgml_advisory(request: AdvisoryRequest) -> dict[str, object]:
    return create_advisory(
        organization_id=request.organization_id,
        field_id=request.field_id,
        language=request.language,
        message=request.message,
        channel=request.channel,
    )
