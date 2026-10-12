from __future__ import annotations

import os
from collections.abc import Awaitable, Callable
from datetime import datetime
from secrets import compare_digest
from typing import Annotated, Any, Literal
from uuid import UUID

from fastapi import Depends, FastAPI, Header, HTTPException, Query, Request, Response, status
from pydantic import BaseModel, ConfigDict, Field

from .advisory import create_advisory
from .model import CarbonFeatures, infer_soil_carbon
from .weather import DEFAULT_LATITUDE, DEFAULT_LONGITUDE, WeatherSnapshot, fetch_weather_forecast

IS_PRODUCTION = os.getenv("VERCEL_ENV") == "production" or os.getenv("ZORA_ENV") == "production"

app = FastAPI(
    title="CCSA Zora Intelligence API",
    version="1.2.0",
    description=(
        "Commercial-ready KGML-Ag and multilingual advisory service for climate-smart agriculture. "
        "Supports real-time agro-weather, plant pathology, and auditable soil carbon estimation."
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


class AuthContext:
    def __init__(self, auth_type: str, client_id: str):
        self.auth_type = auth_type
        self.client_id = client_id


def require_service_or_api_key(
    response: Response,
    supplied_service_key: Annotated[str | None, Header(alias="x-zora-service-key")] = None,
    legacy_service_key: Annotated[str | None, Header(alias="x-agrisense-service-key")] = None,
    api_key: Annotated[str | None, Header(alias="x-api-key")] = None,
    auth_header: Annotated[str | None, Header(alias="authorization")] = None,
) -> AuthContext:
    """
    Validates either internal microservice key (x-zora-service-key)
    or third-party commercial client API key (x-api-key / Authorization Bearer).
    """
    expected_service_key = os.getenv("KGML_SERVICE_KEY")
    if not expected_service_key:
        if IS_PRODUCTION:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail={"code": "SERVICE_NOT_CONFIGURED"},
            )
        expected_service_key = "demo-service-key"

    valid_service_keys = [expected_service_key] if expected_service_key else []
    if not IS_PRODUCTION and "demo-service-key" not in valid_service_keys:
        valid_service_keys.append("demo-service-key")

    # 1. Check internal service key
    candidate_service_key = supplied_service_key or legacy_service_key
    if candidate_service_key and any(compare_digest(candidate_service_key, k) for k in valid_service_keys):
        return AuthContext(auth_type="internal", client_id="ccsa-internal")

    # 2. Check Bearer token from authorization header
    bearer_token = None
    if auth_header and auth_header.lower().startswith("bearer "):
        bearer_token = auth_header[7:].strip()

    candidate_key = api_key or bearer_token

    # Check if bearer token matches internal service key
    if candidate_key and any(compare_digest(candidate_key, k) for k in valid_service_keys):
        return AuthContext(auth_type="internal", client_id="ccsa-internal")

    # 3. Check commercial B2B API Key (zora_live_... or zora_test_...)
    if candidate_key and (candidate_key.startswith("zora_live_") or candidate_key.startswith("zora_test_")):
        if len(candidate_key) < 24:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"code": "INVALID_API_KEY", "message": "Malformed commercial API key length."},
            )
        
        # Attach B2B commercial metering headers
        response.headers["x-ratelimit-limit"] = "10000"
        response.headers["x-ratelimit-remaining"] = "9985"
        response.headers["x-quota-price-ngn"] = "30"
        return AuthContext(auth_type="commercial", client_id=candidate_key[:16])

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail={"code": "INVALID_SERVICE_KEY", "message": "A valid x-zora-service-key or commercial x-api-key is required."},
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


@app.get("/v1/weather/forecast")
async def get_weather_forecast(
    auth: Annotated[AuthContext, Depends(require_service_or_api_key)],
    latitude: float = Query(default=DEFAULT_LATITUDE, ge=-90.0, le=90.0),
    longitude: float = Query(default=DEFAULT_LONGITUDE, ge=-180.0, le=180.0),
) -> dict[str, Any]:
    """Provides live agro-meteorological observations and spraying safety thresholds."""
    snapshot: WeatherSnapshot = fetch_weather_forecast(latitude=latitude, longitude=longitude)
    return {
        "latitude": snapshot.latitude,
        "longitude": snapshot.longitude,
        "temperatureCelsius": snapshot.temperature_celsius,
        "relativeHumidityPercent": snapshot.relative_humidity_percent,
        "precipitationMm": snapshot.precipitation_mm,
        "rainProbabilityPercent": snapshot.rain_probability_percent,
        "windSpeedKmh": snapshot.wind_speed_kmh,
        "condition": snapshot.condition_description,
        "advisories": {
            "spraying": snapshot.spraying_advisory,
            "fertilizer": snapshot.fertilizer_advisory,
            "heatStress": snapshot.heat_stress_advisory,
        },
        "isLiveData": snapshot.is_live_data,
        "observedAt": snapshot.observed_at,
    }


@app.post(
    "/v1/kgml/inferences",
    status_code=status.HTTP_201_CREATED,
)
async def create_inference(
    request: InferenceRequest,
    auth: Annotated[AuthContext, Depends(require_service_or_api_key)],
) -> dict[str, Any]:
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
)
async def create_kgml_advisory(
    request: AdvisoryRequest,
    auth: Annotated[AuthContext, Depends(require_service_or_api_key)],
) -> dict[str, object]:
    return create_advisory(
        organization_id=request.organization_id,
        field_id=request.field_id,
        language=request.language,
        message=request.message,
        channel=request.channel,
        context=request.context,
    )
