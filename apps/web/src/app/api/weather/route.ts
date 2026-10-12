import { NextResponse, type NextRequest } from "next/server";

import type { ZoraWeatherForecast } from "@ccsa-zora/utils/api";

import { apiError } from "@/server/responses";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latitude = searchParams.get("latitude") ?? "9.0765";
    const longitude = searchParams.get("longitude") ?? "7.3986";

    const apiUrl = process.env.KGML_API_URL ?? "http://127.0.0.1:8100";
    const response = await fetch(
      `${apiUrl}/v1/weather/forecast?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}`,
      {
        headers: {
          "x-zora-service-key": process.env.KGML_SERVICE_KEY ?? "demo-service-key",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      // Graceful fallback weather snapshot if kgml-api is not currently running locally
      const isRainySeason = [5, 6, 7, 8, 9, 10].includes(new Date().getMonth() + 1);
      const fallback: ZoraWeatherForecast = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        temperatureCelsius: isRainySeason ? 28.5 : 33.0,
        relativeHumidityPercent: isRainySeason ? 78.0 : 42.0,
        precipitationMm: isRainySeason ? 2.5 : 0.0,
        rainProbabilityPercent: isRainySeason ? 65.0 : 10.0,
        windSpeedKmh: 11.0,
        condition: isRainySeason ? "Humid & Partly Cloudy" : "Dry Savanna Sunshine",
        advisories: {
          spraying: isRainySeason
            ? "Unfavorable: High seasonal precipitation chance. Avoid spraying before rain."
            : "Favorable for morning spraying before midday heat.",
          fertilizer: isRainySeason
            ? "Ensure soil is moist; avoid top-dressing immediately before heavy downpours."
            : "Moisture deficit: Irrigate immediately after applying fertilizer.",
          heatStress: isRainySeason
            ? "Low heat stress."
            : "Moderate heat stress during peak afternoon (12pm - 3pm).",
        },
        isLiveData: false,
        observedAt: new Date().toISOString(),
      };
      return NextResponse.json(fallback);
    }

    const data = (await response.json()) as ZoraWeatherForecast;
    return NextResponse.json(data);
  } catch (error) {
    return apiError(error);
  }
}
