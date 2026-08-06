import { sql, type AnyColumn, type SQL } from "drizzle-orm";
import { customType } from "drizzle-orm/pg-core";

import type {
  GeoJsonMultiPolygon,
  GeoJsonPoint,
  FieldBoundary,
} from "@ccsa-zora/utils/geojson";

export const postgisPoint = customType<{
  data: string;
  driverData: string;
}>({
  dataType() {
    return "extensions.geometry(Point,4326)";
  },
});

export const postgisMultiPolygon = customType<{
  data: string;
  driverData: string;
}>({
  dataType() {
    return "extensions.geometry(MultiPolygon,4326)";
  },
});

export function pointFromGeoJson(point: GeoJsonPoint): SQL {
  return sql`extensions.ST_SetSRID(extensions.ST_GeomFromGeoJSON(${JSON.stringify(point)}), 4326)`;
}

export function multiPolygonFromGeoJson(boundary: FieldBoundary): SQL {
  return sql`extensions.ST_Multi(extensions.ST_SetSRID(extensions.ST_GeomFromGeoJSON(${JSON.stringify(boundary)}), 4326))`;
}

export function pointAsGeoJson(column: AnyColumn): SQL<GeoJsonPoint> {
  return sql<GeoJsonPoint>`extensions.ST_AsGeoJSON(${column})::jsonb`;
}

export function multiPolygonAsGeoJson(column: AnyColumn): SQL<GeoJsonMultiPolygon> {
  return sql<GeoJsonMultiPolygon>`extensions.ST_AsGeoJSON(${column})::jsonb`;
}
