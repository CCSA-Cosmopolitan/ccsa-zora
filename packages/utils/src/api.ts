import type { GeoJsonMultiPolygon, GeoJsonPoint } from "./geojson";

export const OBSERVATION_KINDS = [
  "crop_health",
  "pest_disease",
  "soil",
  "water",
  "weather_damage",
  "practice_evidence",
  "yield",
  "other",
] as const;

export type ObservationKind = (typeof OBSERVATION_KINDS)[number];

export interface FieldSummary {
  id: string;
  name: string;
  status: "active" | "fallow" | "retired";
  cropCode: string | null;
  areaHectares: number;
  boundary: GeoJsonMultiPolygon;
  centroid: GeoJsonPoint;
  ndvi: number | null;
  soilMoisturePercent: number | null;
  condition: "healthy" | "inspect" | "water_stress" | "unknown";
  lastEvidenceAt: string | null;
}

export interface DashboardMetrics {
  meanNdvi: number | null;
  sensorAvailabilityPercent: number;
  verifiedRemovalsTco2e: number;
  heatRiskDays: number;
  signedRecordCount: number;
  pendingVerificationCount: number;
}

export interface SensorSummary {
  total: number;
  reporting: number;
  degraded: number;
  offline: number;
}

export interface MrvReadiness {
  boundaryValidationPercent: number;
  practiceEvidenceComplete: number;
  practiceEvidenceRequired: number;
  sensorContinuityPercent: number;
  verifierStatus: "not_started" | "scheduled" | "in_review" | "verified";
}

export interface DashboardSnapshot {
  organization: { id: string; name: string };
  generatedAt: string;
  source: "database" | "demo";
  metrics: DashboardMetrics;
  sensors: SensorSummary;
  mrv: MrvReadiness;
  fields: FieldSummary[];
}

export interface ObservationPayload {
  id: string;
  organizationId: string;
  fieldId: string;
  kind: ObservationKind;
  status: "draft" | "submitted";
  title: string;
  notes: string | null;
  severity?: number | null;
  observedAt: string;
  location: GeoJsonPoint;
  accuracyMeters: number | null;
  deviceId: string;
  payload?: Record<string, unknown>;
}

export interface ObservationRecord extends ObservationPayload {
  version: number;
  updatedAt: string;
  syncStatus?: "pending" | "synced" | "conflict";
}

export interface ObservationMediaPayload {
  id: string;
  organizationId: string;
  observationId: string;
  fieldId: string;
  localUri: string;
  mimeType: string;
  byteSize: number;
  sha256: string;
  capturedAt: string;
  captureMetadata?: Record<string, unknown>;
}

export interface SyncPullResponse {
  cursor: string;
  hasMore: boolean;
  fields: FieldSummary[];
  observations: ObservationRecord[];
  serverTime: string;
}

export interface SensorReadingInput {
  sensorHardwareId: string;
  observedAt: string;
  sequenceNumber?: number;
  metrics: Record<string, { value: number; unit: string }>;
  rawPayload?: Record<string, unknown>;
}

export interface SensorIngestionResponse {
  accepted: number;
  duplicates: number;
  rejected: number;
  receivedAt: string;
}

export interface KgmlInferenceInput {
  fieldId: string;
  observedAt: string;
  evidenceHashes: string[];
  features: {
    areaHectares: number;
    baselineSoilOrganicCarbonPercent: number;
    currentSoilOrganicCarbonPercent: number;
    bulkDensityGramsCm3: number;
    samplingDepthCm: number;
    yearsElapsed: number;
    coverCrop?: boolean;
    reducedTillage?: boolean;
    residueRetentionPercent?: number;
  };
  context?: Record<string, unknown>;
}

export interface KgmlInferenceResult {
  inferenceId: string;
  fieldId: string;
  observedAt: string;
  model: {
    name: string;
    version: string;
    artifactHash: string;
    status: "reference" | "validated";
  };
  outputs: {
    soilCarbonStockChangeTonnesC: number;
    estimatedRemovalTco2e: number;
    annualizedRemovalTco2e: number;
    lower95Tco2e: number;
    upper95Tco2e: number;
  };
  constraints: string[];
  evidenceMerkleRoot: string;
  generatedAt: string;
}

export const ZORA_LANGUAGES = [
  "en",
  "ha",
  "yo",
  "ig",
  "ff",
] as const;

export type ZoraLanguage = (typeof ZORA_LANGUAGES)[number];

export interface ZoraAdvisoryInput {
  organizationId: string;
  fieldId?: string | null;
  language: ZoraLanguage;
  message: string;
  channel: "web" | "mobile" | "voice";
  context?: Record<string, unknown>;
}

export interface ZoraAdvisoryResult {
  advisoryId: string;
  language: ZoraLanguage;
  answer: string;
  diagnosis: string;
  confidence: number;
  severity: "information" | "low" | "medium" | "high";
  actions: string[];
  knowledgeBasis: string[];
  followUp: string;
  model: {
    name: string;
    version: string;
    status: "reference" | "validated";
  };
  generatedAt: string;
}
