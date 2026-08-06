export type Position = readonly [longitude: number, latitude: number];

export interface GeoJsonPoint {
  type: "Point";
  coordinates: Position;
}

export interface GeoJsonPolygon {
  type: "Polygon";
  coordinates: readonly (readonly Position[])[];
}

export interface GeoJsonMultiPolygon {
  type: "MultiPolygon";
  coordinates: readonly (readonly (readonly Position[])[])[];
}

export type FieldBoundary = GeoJsonPolygon | GeoJsonMultiPolygon;

export function assertWgs84Position(position: Position): void {
  const [longitude, latitude] = position;

  if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
    throw new RangeError(
      `Invalid WGS84 position (${longitude}, ${latitude}); expected longitude/latitude.`,
    );
  }
}

export function normalizeFieldBoundary(boundary: FieldBoundary): GeoJsonMultiPolygon {
  if (boundary.type === "MultiPolygon") {
    return boundary;
  }

  return {
    type: "MultiPolygon",
    coordinates: [boundary.coordinates],
  };
}
