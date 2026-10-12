from __future__ import annotations

import json
import logging
import urllib.error
import urllib.request
from dataclasses import dataclass
from datetime import UTC, datetime

logger = logging.getLogger("zora.weather")

# Default coordinates: CCSA Cosmopolitan University, Abuja, Nigeria
DEFAULT_LATITUDE = 9.0765
DEFAULT_LONGITUDE = 7.3986


@dataclass(frozen=True)
class WeatherSnapshot:
    latitude: float
    longitude: float
    temperature_celsius: float
    relative_humidity_percent: float
    precipitation_mm: float
    rain_probability_percent: float
    wind_speed_kmh: float
    condition_description: str
    spraying_advisory: str
    fertilizer_advisory: str
    heat_stress_advisory: str
    is_live_data: bool
    observed_at: str


def _get_fallback_weather(latitude: float, longitude: float) -> WeatherSnapshot:
    """Provides climatological seasonal baseline if live satellite/meteorological API is unreachable."""
    now = datetime.now(UTC)
    month = now.month
    # Approximate rainy vs dry season in central Nigeria (May-Oct is rainy, Nov-Apr is dry)
    is_rainy_season = 5 <= month <= 10
    
    rain_prob = 65.0 if is_rainy_season else 10.0
    precip = 2.5 if is_rainy_season else 0.0
    temp = 28.5 if is_rainy_season else 33.0
    humidity = 78.0 if is_rainy_season else 42.0
    wind = 11.0

    return WeatherSnapshot(
        latitude=latitude,
        longitude=longitude,
        temperature_celsius=temp,
        relative_humidity_percent=humidity,
        precipitation_mm=precip,
        rain_probability_percent=rain_prob,
        wind_speed_kmh=wind,
        condition_description="Seasonal agro-climatic estimate (Cloud cover with humid breeze)" if is_rainy_season else "Seasonal dry savanna sunshine",
        spraying_advisory="Unfavorable: High precipitation chance in seasonal window. Delay foliar spraying." if is_rainy_season else "Favorable for morning spraying before midday heat.",
        fertilizer_advisory="Moderate: Ensure soil is moist; avoid application immediately before heavy downpours." if is_rainy_season else "Caution: Dry soil. Water immediately after applying nitrogen/NPK.",
        heat_stress_advisory="Low heat stress." if is_rainy_season else "Moderate heat stress during peak afternoon (12pm - 3pm).",
        is_live_data=False,
        observed_at=now.isoformat(),
    )


def fetch_weather_forecast(
    latitude: float = DEFAULT_LATITUDE,
    longitude: float = DEFAULT_LONGITUDE,
    timeout_seconds: float = 3.0,
) -> WeatherSnapshot:
    """
    Fetches real-time weather and operational agro-meteorological advisories.
    Uses Open-Meteo API with fallback to regional seasonal climatology.
    """
    url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={latitude:.4f}&longitude={longitude:.4f}&"
        f"current=temperature_2m,relative_humidity_2m,precipitation,rain,wind_speed_10m&"
        f"hourly=precipitation_probability&forecast_days=1&timezone=Africa%2FLagos"
    )

    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "CCSA-Zora-AgroMeteorology/1.0 (Cosmopolitan University Abuja)"},
        )
        with urllib.request.urlopen(req, timeout=timeout_seconds) as response:
            if response.status == 200:
                data = json.loads(response.read().decode("utf-8"))
                current = data.get("current", {})
                hourly = data.get("hourly", {})
                
                temp = float(current.get("temperature_2m", 29.0))
                humidity = float(current.get("relative_humidity_2m", 65.0))
                precip = float(current.get("precipitation", 0.0))
                wind = float(current.get("wind_speed_10m", 10.0))
                
                # Max precipitation probability in next 6 hours
                prob_list = hourly.get("precipitation_probability", [0.0])
                rain_prob = float(max(prob_list[:6])) if prob_list else 0.0

                # Formulate spraying guidance
                if rain_prob > 45.0 or precip > 1.0:
                    spraying_adv = f"HIGH RUNOFF RISK ({rain_prob:.0f}% rain chance). Do NOT spray herbicides/pesticides today; chemicals will wash off."
                elif wind > 18.0:
                    spraying_adv = f"HIGH WIND DRIFT ({wind:.1f} km/h). Delay spraying until wind calms below 15 km/h to prevent chemical drift."
                elif temp > 33.0:
                    spraying_adv = f"HIGH HEAT ({temp:.1f}°C). Spray only in early morning (6am-9am) or evening to prevent foliar evaporation/burn."
                else:
                    spraying_adv = "EXCELLENT SPRAYING WINDOW: Calm winds, low rain probability, and safe ambient temperature."

                # Formulate fertilizer guidance
                if rain_prob > 60.0 and precip > 10.0:
                    fert_adv = "LEACHING RISK: Postpone granular urea/NPK application; excessive rains will leach nutrients below root zone."
                elif humidity < 35.0 and temp > 32.0:
                    fert_adv = "MOISTURE DEFICIT: Soil is dry. Irrigate field before or immediately after top-dressing fertilizer."
                else:
                    fert_adv = "FAVORABLE FOR FERTILIZER: Moist soil conditions support nutrient uptake without immediate runoff."

                # Formulate heat stress
                if temp >= 36.0:
                    heat_adv = "SEVERE HEAT STRESS: High evapotranspiration rate. Irrigate crops and shield young seedlings/livestock."
                elif temp >= 32.0:
                    heat_adv = "MODERATE HEAT: Ensure adequate water in irrigation canals or moisture conservation mulch."
                else:
                    heat_adv = "OPTIMAL TEMPERATURE: Normal crop metabolic activity."

                condition = "Clear"
                if precip > 0.5:
                    condition = "Active Rainfall"
                elif rain_prob > 50:
                    condition = "Overcast with Imminent Rain"
                elif humidity > 75:
                    condition = "Humid & Partly Cloudy"

                return WeatherSnapshot(
                    latitude=latitude,
                    longitude=longitude,
                    temperature_celsius=temp,
                    relative_humidity_percent=humidity,
                    precipitation_mm=precip,
                    rain_probability_percent=rain_prob,
                    wind_speed_kmh=wind,
                    condition_description=condition,
                    spraying_advisory=spraying_adv,
                    fertilizer_advisory=fert_adv,
                    heat_stress_advisory=heat_adv,
                    is_live_data=True,
                    observed_at=datetime.now(UTC).isoformat(),
                )
    except Exception as exc:
        logger.warning("Could not reach live weather API (%s); using agro-climatic fallback.", exc)

    return _get_fallback_weather(latitude, longitude)
