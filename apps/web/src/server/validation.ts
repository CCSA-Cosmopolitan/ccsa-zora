import { z } from "zod";

import { OBSERVATION_KINDS, ZORA_LANGUAGES } from "@ccsa-zora/utils/api";

export const ACCESS_REQUEST_ROLES = [
  "farmer_or_producer",
  "extension_professional",
  "researcher_or_scientist",
  "programme_manager",
  "mrv_or_verification_professional",
  "technology_or_data_partner",
  "other",
] as const;

export const accessRequestInputSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(254),
  organizationName: z.string().trim().min(2).max(180),
  requestedRole: z.enum(ACCESS_REQUEST_ROLES),
  country: z.string().trim().max(100).optional().default(""),
  useCase: z.string().trim().min(20).max(1_200),
  consent: z.literal(true),
  website: z.string().max(0).optional().default(""),
}).strict();

const pointSchema = z.object({
  type: z.literal("Point"),
  coordinates: z.tuple([
    z.number().min(-180).max(180),
    z.number().min(-90).max(90),
  ]),
});

export const observationPayloadSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  fieldId: z.string().uuid(),
  kind: z.enum(OBSERVATION_KINDS),
  status: z.enum(["draft", "submitted"]),
  title: z.string().trim().min(3).max(160),
  notes: z.string().trim().max(10_000).nullable(),
  severity: z.number().int().min(1).max(5).nullable().optional(),
  observedAt: z.string().datetime({ offset: true }),
  location: pointSchema,
  accuracyMeters: z.number().min(0).max(100_000).nullable(),
  deviceId: z.string().trim().min(1).max(200),
  payload: z.record(z.string(), z.unknown()).optional(),
});

export const outboxEnvelopeSchema = z.object({
  id: z.string().min(1).max(300),
  idempotencyKey: z.string().min(8).max(300),
  entity: z.literal("observation"),
  entityId: z.string().uuid(),
  operation: z.literal("create"),
  payload: observationPayloadSchema,
  clientCreatedAt: z.string().datetime({ offset: true }),
  attemptCount: z.number().int().min(0).max(100),
});

export const sensorIngestionSchema = z.object({
  readings: z.array(
    z.object({
      sensorHardwareId: z.string().trim().min(1).max(200),
      observedAt: z.string().datetime({ offset: true }),
      sequenceNumber: z.number().int().min(0).optional(),
      metrics: z.record(
        z.string().trim().min(1).max(100),
        z.object({ value: z.number().finite(), unit: z.string().trim().min(1).max(50) }),
      ),
      rawPayload: z.record(z.string(), z.unknown()).optional(),
    }),
  ).min(1).max(500),
});

export const kgmlInferenceSchema = z.object({
  fieldId: z.string().uuid(),
  observedAt: z.string().datetime({ offset: true }),
  evidenceHashes: z.array(z.string().regex(/^[a-f0-9]{64}$/i)).max(10_000),
  features: z.object({
    areaHectares: z.number().positive().max(1_000_000),
    baselineSoilOrganicCarbonPercent: z.number().min(0).max(30),
    currentSoilOrganicCarbonPercent: z.number().min(0).max(30),
    bulkDensityGramsCm3: z.number().min(0.5).max(2.2),
    samplingDepthCm: z.number().min(1).max(200),
    yearsElapsed: z.number().positive().max(100),
    coverCrop: z.boolean().optional(),
    reducedTillage: z.boolean().optional(),
    residueRetentionPercent: z.number().min(0).max(100).optional(),
  }),
  context: z.record(z.string(), z.unknown()).optional(),
});

export const mediaEnvelopeSchema = z.object({
  id: z.string().min(1).max(300),
  idempotencyKey: z.string().min(8).max(300),
  entity: z.literal("observation_media"),
  entityId: z.string().uuid(),
  operation: z.literal("create"),
  clientCreatedAt: z.string().datetime({ offset: true }),
  attemptCount: z.number().int().min(0).max(100),
  payload: z.object({
    id: z.string().uuid(),
    organizationId: z.string().uuid(),
    observationId: z.string().uuid(),
    fieldId: z.string().uuid(),
    localUri: z.string().min(1),
    mimeType: z.enum(["image/jpeg", "image/png", "image/heic", "image/webp"]),
    byteSize: z.number().int().positive().max(4 * 1024 * 1024),
    sha256: z.string().regex(/^[a-f0-9]{64}$/i),
    capturedAt: z.string().datetime({ offset: true }),
    captureMetadata: z.record(z.string(), z.unknown()).optional(),
  }),
});

export const zoraAdvisorySchema = z.object({
  organizationId: z.string().uuid(),
  fieldId: z.string().uuid().nullable().optional(),
  language: z.enum(ZORA_LANGUAGES),
  message: z.string().trim().min(2).max(4_000),
  channel: z.enum(["web", "mobile", "voice"]),
  context: z.record(z.string(), z.unknown()).optional(),
});
