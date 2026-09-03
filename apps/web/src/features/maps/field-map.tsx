"use client";

import { useEffect, useRef } from "react";
import maplibregl, { type GeoJSONSource, type LngLatBoundsLike, type Map, type StyleSpecification } from "maplibre-gl";

import type { FieldSummary } from "@ccsa-zora/utils/api";

type MapGeoJson = Parameters<GeoJSONSource["setData"]>[0];

const DEFAULT_MAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    "carto-voyager": {
      type: "raster",
      tiles: [
        "https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png",
        "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap &copy; CARTO",
    },
  },
  layers: [
    {
      id: "carto-voyager-layer",
      type: "raster",
      source: "carto-voyager",
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

function asFeature(field: FieldSummary): MapGeoJson {
  return {
    type: "Feature",
    properties: { id: field.id, name: field.name, condition: field.condition },
    geometry: field.boundary,
  } as unknown as MapGeoJson;
}

function boundsFor(field: FieldSummary): LngLatBoundsLike {
  const positions = field.boundary.coordinates.flat(2);
  const longitudes = positions.map((position) => position[0]);
  const latitudes = positions.map((position) => position[1]);
  return [
    [Math.min(...longitudes), Math.min(...latitudes)],
    [Math.max(...longitudes), Math.max(...latitudes)],
  ];
}

export function FieldMap({ field }: { field: FieldSummary }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    
    const styleToUse = process.env.NEXT_PUBLIC_MAP_STYLE_URL || DEFAULT_MAP_STYLE;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: styleToUse,
      bounds: boundsFor(field),
      fitBoundsOptions: { padding: 45, maxZoom: 15 },
      attributionControl: false,
    });

    map.on("error", (e) => {
      // Suppress network errors from maplibre demotiles gracefully
      if (process.env.NODE_ENV === "development") {
        console.warn("MapLibre tile layer notification:", e.error?.message || e);
      }
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
    
    map.on("load", () => {
      map.addSource("selected-field", { type: "geojson", data: asFeature(field) });
      map.addLayer({
        id: "selected-field-fill",
        type: "fill",
        source: "selected-field",
        paint: { "fill-color": "#10b981", "fill-opacity": 0.36 },
      });
      map.addLayer({
        id: "selected-field-outline",
        type: "line",
        source: "selected-field",
        paint: { "line-color": "#3b82f6", "line-width": 3 },
      });
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;
    (map.getSource("selected-field") as GeoJSONSource | undefined)?.setData(asFeature(field));
    map.fitBounds(boundsFor(field), { padding: 45, maxZoom: 15, duration: 500 });
  }, [field]);

  return (
    <div
      ref={containerRef}
      className="h-full min-h-80 w-full rounded-xl bg-slate-900 overflow-hidden shadow-inner"
      aria-label={`Map showing ${field.name}`}
    />
  );
}
