from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client() -> Iterator[TestClient]:
    with TestClient(app) as test_client:
        yield test_client


def test_health(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "ccsa-zora-intelligence-api",
        "model_version": "1.0.0-reference",
    }


def test_inference_is_auditable_and_does_not_apply_practice_uplift(
    client: TestClient,
) -> None:
    evidence_hash = "a" * 64
    response = client.post(
        "/v1/kgml/inferences",
        headers={"x-zora-service-key": "demo-service-key"},
        json={
            "field_id": "00000000-0000-4000-8000-000000000101",
            "observed_at": "2026-08-03T09:00:00Z",
            "evidence_hashes": [evidence_hash],
            "features": {
                "areaHectares": 10,
                "baselineSoilOrganicCarbonPercent": 1.0,
                "currentSoilOrganicCarbonPercent": 1.1,
                "bulkDensityGramsCm3": 1.3,
                "samplingDepthCm": 30,
                "yearsElapsed": 2,
                "coverCrop": True,
            },
            "context": {"methodology_code": "REFERENCE-ONLY"},
        },
    )
    assert response.status_code == 201
    result = response.json()
    assert result["model"]["status"] == "reference"
    assert len(result["model"]["artifactHash"]) == 64
    assert result["outputs"]["soilCarbonStockChangeTonnesC"] == 39.0
    assert result["outputs"]["estimatedRemovalTco2e"] == 143.0
    assert len(result["evidenceMerkleRoot"]) == 64
    assert result["outputs"]["lower95Tco2e"] < result["outputs"]["upper95Tco2e"]


def test_inference_requires_service_key(client: TestClient) -> None:
    response = client.post("/v1/kgml/inferences", json={})
    assert response.status_code == 401


def test_invalid_evidence_hash_is_rejected(client: TestClient) -> None:
    response = client.post(
        "/v1/kgml/inferences",
        headers={"x-zora-service-key": "demo-service-key"},
        json={
            "field_id": "00000000-0000-4000-8000-000000000101",
            "observed_at": "2026-08-03T09:00:00Z",
            "evidence_hashes": ["not-a-hash"],
            "features": {
                "areaHectares": 10,
                "baselineSoilOrganicCarbonPercent": 1.0,
                "currentSoilOrganicCarbonPercent": 1.1,
                "bulkDensityGramsCm3": 1.3,
                "samplingDepthCm": 30,
                "yearsElapsed": 2,
            },
        },
    )
    assert response.status_code == 422


def test_multilingual_advisory_is_grounded_and_auditable(client: TestClient) -> None:
    response = client.post(
        "/v1/advisories",
        headers={"x-zora-service-key": "demo-service-key"},
        json={
            "organization_id": "00000000-0000-4000-8000-000000000001",
            "field_id": "00000000-0000-4000-8000-000000000101",
            "language": "ha",
            "message": "Me yasa ganyen masara ta suke zama rawaya?",
            "channel": "voice",
            "context": {"crop": "maize"},
        },
    )
    assert response.status_code == 201
    result = response.json()
    assert result["language"] == "ha"
    assert result["diagnosis"] == "Possible nitrogen deficiency or early foliar stress"
    assert result["model"]["status"] == "reference"
    assert len(result["knowledgeBasis"]) >= 3
    assert 0 <= result["confidence"] <= 1


def test_unregistered_commercial_api_key_rejected(client: TestClient) -> None:
    response = client.post(
        "/v1/advisories",
        headers={"x-api-key": "zora_live_948204928492048204829482"},
        json={
            "organization_id": "00000000-0000-4000-8000-000000000001",
            "field_id": "00000000-0000-4000-8000-000000000101",
            "language": "en",
            "message": "Caterpillars are eating holes inside the maize whorl",
            "channel": "web",
        },
    )
    assert response.status_code == 401
    assert response.headers.get("x-ratelimit-limit") is None


def test_malformed_commercial_api_key_rejected(client: TestClient) -> None:
    response = client.post(
        "/v1/advisories",
        headers={"x-api-key": "zora_live_short"},
        json={
            "organization_id": "00000000-0000-4000-8000-000000000001",
            "message": "Test message",
        },
    )
    assert response.status_code == 401


def test_cassava_mosaic_disease_advisory_yo(client: TestClient) -> None:
    response = client.post(
        "/v1/advisories",
        headers={"x-zora-service-key": "demo-service-key"},
        json={
            "organization_id": "00000000-0000-4000-8000-000000000001",
            "language": "yo",
            "message": "Ewe gbaguda mi n wrinkled ati mosaic ofeefee pelu whitefly",
            "channel": "voice",
        },
    )
    assert response.status_code == 201
    result = response.json()
    assert "Cassava Mosaic Disease" in result["diagnosis"]
    assert any("TME 419" in action for action in result["actions"])
    assert result["language"] == "yo"


def test_rice_blast_advisory_en(client: TestClient) -> None:
    response = client.post(
        "/v1/advisories",
        headers={"x-zora-service-key": "demo-service-key"},
        json={
            "organization_id": "00000000-0000-4000-8000-000000000001",
            "language": "en",
            "message": "My rice paddy has spindle-shaped leaf blast spots with grey centers",
            "channel": "web",
        },
    )
    assert response.status_code == 201
    result = response.json()
    assert "Rice Blast" in result["diagnosis"]
    assert any("AfricaRice" in basis for basis in result["knowledgeBasis"])


def test_weather_forecast_endpoint(client: TestClient) -> None:
    response = client.get(
        "/v1/weather/forecast?latitude=9.0765&longitude=7.3986",
        headers={"x-zora-service-key": "demo-service-key"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "temperatureCelsius" in data
    assert "rainProbabilityPercent" in data
    assert "advisories" in data
    assert "spraying" in data["advisories"]
    assert "fertilizer" in data["advisories"]


def test_advisory_with_live_weather_synthesis(client: TestClient) -> None:
    response = client.post(
        "/v1/advisories",
        headers={"x-zora-service-key": "demo-service-key"},
        json={
            "organization_id": "00000000-0000-4000-8000-000000000001",
            "language": "en",
            "message": "Should I apply fertilizer and spray herbicide today?",
            "channel": "mobile",
            "context": {"latitude": 9.07, "longitude": 7.40},
        },
    )
    assert response.status_code == 201
    result = response.json()
    assert any("Live Weather Advisory" in action for action in result["actions"])
    assert any("Live Open-Meteo" in basis for basis in result["knowledgeBasis"])
