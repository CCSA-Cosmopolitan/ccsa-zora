import type {
  DashboardSnapshot,
  FieldSummary,
  ObservationRecord,
} from "@ccsa-zora/utils/api";

export const DEMO_ORGANIZATION_ID = "00000000-0000-4000-8000-000000000001";
export const DEMO_USER_ID = "00000000-0000-4000-8000-000000000010";

export const demoFields: FieldSummary[] = [
  {
    id: "00000000-0000-4000-8000-000000000101",
    name: "North Ridge Maize",
    status: "active",
    cropCode: "MAIZE",
    areaHectares: 42.8,
    boundary: {
      type: "MultiPolygon",
      coordinates: [[[[7.384, 9.064], [7.398, 9.061], [7.405, 9.074], [7.396, 9.086], [7.38, 9.081], [7.384, 9.064]]]],
    },
    centroid: { type: "Point", coordinates: [7.393, 9.073] },
    ndvi: 0.74,
    soilMoisturePercent: 31.8,
    condition: "healthy",
    lastEvidenceAt: new Date(Date.now() - 20 * 60_000).toISOString(),
  },
  {
    id: "00000000-0000-4000-8000-000000000102",
    name: "River Bend Rice",
    status: "active",
    cropCode: "RICE",
    areaHectares: 31.2,
    boundary: {
      type: "MultiPolygon",
      coordinates: [[[[7.415, 9.055], [7.428, 9.055], [7.431, 9.066], [7.418, 9.071], [7.412, 9.063], [7.415, 9.055]]]],
    },
    centroid: { type: "Point", coordinates: [7.422, 9.063] },
    ndvi: 0.61,
    soilMoisturePercent: 43.2,
    condition: "inspect",
    lastEvidenceAt: new Date(Date.now() - 4 * 60 * 60_000).toISOString(),
  },
  {
    id: "00000000-0000-4000-8000-000000000103",
    name: "West Block Cowpea",
    status: "active",
    cropCode: "COWPEA",
    areaHectares: 18.6,
    boundary: {
      type: "MultiPolygon",
      coordinates: [[[[7.347, 9.071], [7.362, 9.068], [7.368, 9.079], [7.358, 9.089], [7.345, 9.083], [7.347, 9.071]]]],
    },
    centroid: { type: "Point", coordinates: [7.357, 9.079] },
    ndvi: 0.52,
    soilMoisturePercent: 18.4,
    condition: "water_stress",
    lastEvidenceAt: new Date(Date.now() - 26 * 60 * 60_000).toISOString(),
  },
];

export function createDemoDashboard(observationCount: number): DashboardSnapshot {
  return {
    organization: { id: DEMO_ORGANIZATION_ID, name: "CCSA Zora Abuja Pilot" },
    generatedAt: new Date().toISOString(),
    source: "demo",
    metrics: {
      meanNdvi: 0.62,
      sensorAvailabilityPercent: 97.6,
      verifiedRemovalsTco2e: 1842,
      heatRiskDays: 2,
      signedRecordCount: 1284 + observationCount,
      pendingVerificationCount: 2,
    },
    sensors: { total: 42, reporting: 41, degraded: 1, offline: 0 },
    mrv: {
      boundaryValidationPercent: 100,
      practiceEvidenceComplete: 18,
      practiceEvidenceRequired: 20,
      sensorContinuityPercent: 98.1,
      verifierStatus: "scheduled",
    },
    fields: demoFields,
  };
}

export interface DemoState {
  observations: Map<string, ObservationRecord>;
  receipts: Map<string, { serverVersion: number; acceptedAt: string }>;
}

declare global {
  // eslint-disable-next-line no-var
  var __zoraDemoState: DemoState | undefined;
}

export function getDemoState(): DemoState {
  globalThis.__zoraDemoState ??= {
    observations: new Map(),
    receipts: new Map(),
  };
  return globalThis.__zoraDemoState;
}
