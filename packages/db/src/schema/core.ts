import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { postgisMultiPolygon, postgisPoint } from "../postgis";

const auditColumns = () => ({
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid("created_by").notNull(),
});

export const organizationRole = pgEnum("organization_role", [
  "owner",
  "admin",
  "agronomist",
  "field_agent",
  "climate_scientist",
  "verifier",
  "viewer",
]);

export const accessRequestStatus = pgEnum("access_request_status", [
  "pending",
  "approved",
  "declined",
  "withdrawn",
]);

export const fieldStatus = pgEnum("field_status", ["active", "fallow", "retired"]);

export const sensorConnectivity = pgEnum("sensor_connectivity", [
  "lorawan",
  "nb_iot",
  "cellular",
  "wifi",
  "bluetooth",
  "manual",
]);

export const sensorStatus = pgEnum("sensor_status", [
  "provisioning",
  "active",
  "degraded",
  "offline",
  "retired",
]);

export const observationKind = pgEnum("observation_kind", [
  "crop_health",
  "pest_disease",
  "soil",
  "water",
  "weather_damage",
  "practice_evidence",
  "yield",
  "other",
]);

export const observationStatus = pgEnum("observation_status", [
  "draft",
  "submitted",
  "verified",
  "rejected",
]);

export const mediaUploadStatus = pgEnum("media_upload_status", [
  "local",
  "queued",
  "uploaded",
  "failed",
]);

export const carbonStandard = pgEnum("carbon_standard", [
  "verra_vcs",
  "gold_standard",
  "art_trees",
  "internal_scope3",
  "other",
]);

export const carbonEventType = pgEnum("carbon_event_type", [
  "issued",
  "transferred",
  "retired",
  "revoked",
  "corrective_note",
]);

export const evidenceType = pgEnum("mrv_evidence_type", [
  "field_observation",
  "sensor_reading",
  "satellite_scene",
  "model_run",
  "lab_result",
  "verifier_attestation",
]);

export const auditAction = pgEnum("audit_action", [
  "create",
  "update",
  "archive",
  "submit",
  "verify",
  "reject",
  "sync",
]);

export const modelRunStatus = pgEnum("model_run_status", [
  "started",
  "completed",
  "failed",
  "superseded",
]);

export const zoraLanguage = pgEnum("zora_language", ["en", "ha", "yo", "ig", "ff"]);

export const advisoryChannel = pgEnum("advisory_channel", [
  "web",
  "mobile",
  "voice",
  "extension_assisted",
]);

export const advisoryStatus = pgEnum("advisory_status", [
  "active",
  "resolved",
  "escalated",
  "archived",
]);

export const advisoryRole = pgEnum("advisory_role", [
  "farmer",
  "zora",
  "extension_officer",
  "system",
]);

export const climateAlertSeverity = pgEnum("climate_alert_severity", [
  "information",
  "watch",
  "warning",
  "critical",
]);

export const organizations = pgTable(
  "organizations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    countryCode: text("country_code"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
    ...auditColumns(),
  },
  (table) => [
    uniqueIndex("organizations_slug_uidx").on(table.slug),
    check(
      "organizations_country_code_chk",
      sql`${table.countryCode} IS NULL OR char_length(${table.countryCode}) = 2`,
    ),
  ],
);

export const accessRequests = pgTable(
  "access_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fullName: text("full_name").notNull(),
    email: text("email").notNull(),
    organizationName: text("organization_name").notNull(),
    requestedRole: text("requested_role").notNull(),
    country: text("country"),
    useCase: text("use_case").notNull(),
    status: accessRequestStatus("status").default("pending").notNull(),
    consentVersion: text("consent_version").notNull(),
    consentedAt: timestamp("consented_at", { withTimezone: true }).defaultNow().notNull(),
    requestFingerprint: text("request_fingerprint").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    reviewedBy: uuid("reviewed_by"),
    reviewNotes: text("review_notes"),
  },
  (table) => [
    uniqueIndex("access_requests_pending_email_uidx")
      .on(table.email)
      .where(sql`${table.status} = 'pending'::access_request_status`),
    index("access_requests_status_created_idx").on(table.status, table.createdAt),
    index("access_requests_fingerprint_created_idx").on(table.requestFingerprint, table.createdAt),
    check("access_requests_email_normalized_chk", sql`${table.email} = lower(${table.email})`),
    check(
      "access_requests_full_name_length_chk",
      sql`char_length(${table.fullName}) between 2 and 120`,
    ),
    check(
      "access_requests_use_case_length_chk",
      sql`char_length(${table.useCase}) between 20 and 1200`,
    ),
  ],
);

export const organizationMembers = pgTable(
  "organization_members",
  {
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    // References Supabase auth.users.id logically. The auth schema is managed externally.
    userId: uuid("user_id").notNull(),
    role: organizationRole("role").notNull(),
    joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
    invitedBy: uuid("invited_by"),
  },
  (table) => [
    primaryKey({
      name: "organization_members_pk",
      columns: [table.organizationId, table.userId],
    }),
    index("organization_members_user_idx").on(table.userId),
  ],
);

export const farmerProfiles = pgTable(
  "farmer_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    externalFimsId: text("external_fims_id"),
    displayName: text("display_name").notNull(),
    preferredLanguage: zoraLanguage("preferred_language").default("en").notNull(),
    phoneE164Encrypted: text("phone_e164_encrypted"),
    community: text("community"),
    stateCode: text("state_code"),
    consentVersion: text("consent_version"),
    consentedAt: timestamp("consented_at", { withTimezone: true }),
    active: boolean("active").default(true).notNull(),
    attributes: jsonb("attributes").$type<Record<string, unknown>>().default({}).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    updatedBy: uuid("updated_by").notNull(),
    ...auditColumns(),
  },
  (table) => [
    uniqueIndex("farmer_profiles_org_fims_uidx")
      .on(table.organizationId, table.externalFimsId)
      .where(sql`${table.externalFimsId} IS NOT NULL`),
    index("farmer_profiles_org_language_idx").on(table.organizationId, table.preferredLanguage),
    check(
      "farmer_profiles_consent_pair_chk",
      sql`(${table.consentVersion} IS NULL AND ${table.consentedAt} IS NULL) OR (${table.consentVersion} IS NOT NULL AND ${table.consentedAt} IS NOT NULL)`,
    ),
  ],
);

export const fields = pgTable(
  "fields",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    primaryFarmerId: uuid("primary_farmer_id").references(() => farmerProfiles.id, {
      onDelete: "set null",
    }),
    externalId: text("external_id"),
    name: text("name").notNull(),
    status: fieldStatus("status").default("active").notNull(),
    boundary: postgisMultiPolygon("boundary").notNull(),
    areaHectares: numeric("area_hectares", { precision: 14, scale: 4 }).notNull(),
    cropCode: text("crop_code"),
    soilProfile: jsonb("soil_profile").$type<Record<string, unknown>>().default({}).notNull(),
    properties: jsonb("properties").$type<Record<string, unknown>>().default({}).notNull(),
    version: integer("version").default(1).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    updatedBy: uuid("updated_by").notNull(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    ...auditColumns(),
  },
  (table) => [
    uniqueIndex("fields_org_external_id_uidx")
      .on(table.organizationId, table.externalId)
      .where(sql`${table.externalId} IS NOT NULL`),
    index("fields_organization_idx").on(table.organizationId),
    index("fields_primary_farmer_idx").on(table.primaryFarmerId),
    index("fields_boundary_gist_idx").using("gist", table.boundary),
    check("fields_area_positive_chk", sql`${table.areaHectares} > 0`),
    check("fields_version_positive_chk", sql`${table.version} > 0`),
    check(
      "fields_boundary_valid_chk",
      sql`extensions.ST_SRID(${table.boundary}) = 4326 AND extensions.ST_IsValid(${table.boundary})`,
    ),
  ],
);

export const advisorySessions = pgTable(
  "advisory_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    farmerId: uuid("farmer_id").references(() => farmerProfiles.id, { onDelete: "set null" }),
    fieldId: uuid("field_id").references(() => fields.id, { onDelete: "set null" }),
    language: zoraLanguage("language").notNull(),
    channel: advisoryChannel("channel").notNull(),
    status: advisoryStatus("status").default("active").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    summary: text("summary"),
    context: jsonb("context").$type<Record<string, unknown>>().default({}).notNull(),
    ...auditColumns(),
  },
  (table) => [
    index("advisory_sessions_org_time_idx").on(table.organizationId, table.startedAt),
    index("advisory_sessions_farmer_time_idx").on(table.farmerId, table.startedAt),
    index("advisory_sessions_field_time_idx").on(table.fieldId, table.startedAt),
    check(
      "advisory_sessions_end_after_start_chk",
      sql`${table.endedAt} IS NULL OR ${table.endedAt} >= ${table.startedAt}`,
    ),
  ],
);

export const advisoryMessages = pgTable(
  "advisory_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => advisorySessions.id, { onDelete: "cascade" }),
    sequence: integer("sequence").notNull(),
    role: advisoryRole("role").notNull(),
    content: text("content").notNull(),
    audioStorageKey: text("audio_storage_key"),
    mediaId: uuid("media_id"),
    confidence: numeric("confidence", { precision: 5, scale: 4 }),
    knowledgeBasis: jsonb("knowledge_basis").$type<string[]>().default([]).notNull(),
    reasoningTraceHash: text("reasoning_trace_hash"),
    modelMetadata: jsonb("model_metadata").$type<Record<string, unknown>>().default({}).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("advisory_messages_session_sequence_uidx").on(table.sessionId, table.sequence),
    index("advisory_messages_org_time_idx").on(table.organizationId, table.createdAt),
    check("advisory_messages_sequence_chk", sql`${table.sequence} > 0`),
    check(
      "advisory_messages_confidence_chk",
      sql`${table.confidence} IS NULL OR (${table.confidence} >= 0 AND ${table.confidence} <= 1)`,
    ),
  ],
);

export const climateAlerts = pgTable(
  "climate_alerts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    fieldId: uuid("field_id").references(() => fields.id, { onDelete: "cascade" }),
    alertType: text("alert_type").notNull(),
    severity: climateAlertSeverity("severity").notNull(),
    headline: text("headline").notNull(),
    recommendation: text("recommendation").notNull(),
    validFrom: timestamp("valid_from", { withTimezone: true }).notNull(),
    validThrough: timestamp("valid_through", { withTimezone: true }).notNull(),
    provider: text("provider").notNull(),
    providerReference: text("provider_reference"),
    payload: jsonb("payload").$type<Record<string, unknown>>().default({}).notNull(),
    acknowledgedAt: timestamp("acknowledged_at", { withTimezone: true }),
    acknowledgedBy: uuid("acknowledged_by"),
    ...auditColumns(),
  },
  (table) => [
    index("climate_alerts_org_validity_idx").on(table.organizationId, table.validFrom),
    index("climate_alerts_field_validity_idx").on(table.fieldId, table.validFrom),
    check("climate_alerts_validity_chk", sql`${table.validThrough} > ${table.validFrom}`),
  ],
);

export const sensorNodes = pgTable(
  "sensor_nodes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    fieldId: uuid("field_id").references(() => fields.id, { onDelete: "set null" }),
    hardwareId: text("hardware_id").notNull(),
    displayName: text("display_name").notNull(),
    manufacturer: text("manufacturer"),
    model: text("model"),
    firmwareVersion: text("firmware_version"),
    connectivity: sensorConnectivity("connectivity").notNull(),
    status: sensorStatus("status").default("provisioning").notNull(),
    location: postgisPoint("location").notNull(),
    capabilities: jsonb("capabilities").$type<string[]>().default([]).notNull(),
    mqttTopic: text("mqtt_topic"),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
    commissionedAt: timestamp("commissioned_at", { withTimezone: true }),
    retiredAt: timestamp("retired_at", { withTimezone: true }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    updatedBy: uuid("updated_by").notNull(),
    ...auditColumns(),
  },
  (table) => [
    uniqueIndex("sensor_nodes_org_hardware_uidx").on(table.organizationId, table.hardwareId),
    index("sensor_nodes_field_idx").on(table.fieldId),
    index("sensor_nodes_location_gist_idx").using("gist", table.location),
    check(
      "sensor_nodes_location_valid_chk",
      sql`extensions.ST_SRID(${table.location}) = 4326 AND extensions.ST_IsValid(${table.location})`,
    ),
  ],
);

export const sensorReadings = pgTable(
  "sensor_readings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    sensorNodeId: uuid("sensor_node_id")
      .notNull()
      .references(() => sensorNodes.id, { onDelete: "cascade" }),
    observedAt: timestamp("observed_at", { withTimezone: true }).notNull(),
    ingestedAt: timestamp("ingested_at", { withTimezone: true }).defaultNow().notNull(),
    metric: text("metric").notNull(),
    value: numeric("value", { precision: 20, scale: 8 }).notNull(),
    unit: text("unit").notNull(),
    qualityFlag: text("quality_flag").default("unreviewed").notNull(),
    sequenceNumber: bigint("sequence_number", { mode: "number" }),
    payloadHash: text("payload_hash").notNull(),
    rawPayload: jsonb("raw_payload").$type<Record<string, unknown>>().notNull(),
  },
  (table) => [
    index("sensor_readings_node_time_idx").on(table.sensorNodeId, table.observedAt),
    index("sensor_readings_org_metric_time_idx").on(
      table.organizationId,
      table.metric,
      table.observedAt,
    ),
    uniqueIndex("sensor_readings_payload_hash_uidx").on(table.sensorNodeId, table.payloadHash),
  ],
);

export const fieldIndices = pgTable(
  "field_indices",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    fieldId: uuid("field_id")
      .notNull()
      .references(() => fields.id, { onDelete: "cascade" }),
    indexType: text("index_type").notNull(),
    observedAt: timestamp("observed_at", { withTimezone: true }).notNull(),
    value: numeric("value", { precision: 12, scale: 8 }).notNull(),
    cloudCoverPercent: numeric("cloud_cover_percent", { precision: 6, scale: 3 }),
    source: text("source").notNull(),
    sceneReference: text("scene_reference"),
    contentHash: text("content_hash").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
    ...auditColumns(),
  },
  (table) => [
    uniqueIndex("field_indices_field_type_time_uidx").on(
      table.fieldId,
      table.indexType,
      table.observedAt,
    ),
    index("field_indices_org_time_idx").on(table.organizationId, table.observedAt),
    check(
      "field_indices_cloud_cover_chk",
      sql`${table.cloudCoverPercent} IS NULL OR ${table.cloudCoverPercent} BETWEEN 0 AND 100`,
    ),
  ],
);

export const observations = pgTable(
  "observations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    fieldId: uuid("field_id")
      .notNull()
      .references(() => fields.id, { onDelete: "cascade" }),
    kind: observationKind("kind").notNull(),
    status: observationStatus("status").default("draft").notNull(),
    title: text("title").notNull(),
    notes: text("notes"),
    severity: integer("severity"),
    observedAt: timestamp("observed_at", { withTimezone: true }).notNull(),
    location: postgisPoint("location").notNull(),
    accuracyMeters: numeric("accuracy_meters", { precision: 10, scale: 2 }),
    deviceId: text("device_id").notNull(),
    idempotencyKey: text("idempotency_key").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().default({}).notNull(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    verifiedBy: uuid("verified_by"),
    version: integer("version").default(1).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    updatedBy: uuid("updated_by").notNull(),
    ...auditColumns(),
  },
  (table) => [
    uniqueIndex("observations_org_idempotency_uidx").on(table.organizationId, table.idempotencyKey),
    index("observations_field_time_idx").on(table.fieldId, table.observedAt),
    index("observations_location_gist_idx").using("gist", table.location),
    check(
      "observations_severity_chk",
      sql`${table.severity} IS NULL OR ${table.severity} BETWEEN 1 AND 5`,
    ),
    check(
      "observations_verification_chk",
      sql`${table.status} <> 'verified' OR (${table.verifiedAt} IS NOT NULL AND ${table.verifiedBy} IS NOT NULL)`,
    ),
    check("observations_version_positive_chk", sql`${table.version} > 0`),
  ],
);

export const observationMedia = pgTable(
  "observation_media",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    observationId: uuid("observation_id")
      .notNull()
      .references(() => observations.id, { onDelete: "cascade" }),
    storageKey: text("storage_key"),
    localUri: text("local_uri"),
    mimeType: text("mime_type").notNull(),
    byteSize: bigint("byte_size", { mode: "number" }).notNull(),
    sha256: text("sha256").notNull(),
    captureMetadata: jsonb("capture_metadata")
      .$type<Record<string, unknown>>()
      .default({})
      .notNull(),
    uploadStatus: mediaUploadStatus("upload_status").default("local").notNull(),
    capturedAt: timestamp("captured_at", { withTimezone: true }).notNull(),
    uploadedAt: timestamp("uploaded_at", { withTimezone: true }),
    ...auditColumns(),
  },
  (table) => [
    uniqueIndex("observation_media_sha_uidx").on(table.observationId, table.sha256),
    index("observation_media_observation_idx").on(table.observationId),
    check("observation_media_byte_size_chk", sql`${table.byteSize} > 0`),
    check(
      "observation_media_location_chk",
      sql`${table.storageKey} IS NOT NULL OR ${table.localUri} IS NOT NULL`,
    ),
  ],
);

export const carbonCertificates = pgTable(
  "carbon_certificates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "restrict" }),
    fieldId: uuid("field_id").references(() => fields.id, { onDelete: "restrict" }),
    standard: carbonStandard("standard").notNull(),
    methodologyCode: text("methodology_code").notNull(),
    registrySerial: text("registry_serial").notNull(),
    vintageStart: timestamp("vintage_start", { withTimezone: true }).notNull(),
    vintageEnd: timestamp("vintage_end", { withTimezone: true }).notNull(),
    quantityTco2e: numeric("quantity_tco2e", { precision: 20, scale: 6 }).notNull(),
    issuedAt: timestamp("issued_at", { withTimezone: true }).notNull(),
    evidenceMerkleRoot: text("evidence_merkle_root").notNull(),
    issuanceDocumentHash: text("issuance_document_hash").notNull(),
    registryUrl: text("registry_url"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
    ...auditColumns(),
  },
  (table) => [
    uniqueIndex("carbon_certificates_standard_serial_uidx").on(
      table.standard,
      table.registrySerial,
    ),
    index("carbon_certificates_org_vintage_idx").on(table.organizationId, table.vintageStart),
    index("carbon_certificates_field_idx").on(table.fieldId),
    check("carbon_certificates_vintage_chk", sql`${table.vintageEnd} >= ${table.vintageStart}`),
    check("carbon_certificates_quantity_chk", sql`${table.quantityTco2e} > 0`),
  ],
);

export const carbonCertificateEvents = pgTable(
  "carbon_certificate_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    certificateId: uuid("certificate_id")
      .notNull()
      .references(() => carbonCertificates.id, { onDelete: "restrict" }),
    sequence: integer("sequence").notNull(),
    eventType: carbonEventType("event_type").notNull(),
    eventAt: timestamp("event_at", { withTimezone: true }).notNull(),
    actorId: uuid("actor_id").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    previousEventHash: text("previous_event_hash"),
    eventHash: text("event_hash").notNull(),
    signature: text("signature"),
    signingKeyId: text("signing_key_id"),
    ledgerNetwork: text("ledger_network"),
    ledgerTransactionId: text("ledger_transaction_id"),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("carbon_certificate_events_sequence_uidx").on(table.certificateId, table.sequence),
    uniqueIndex("carbon_certificate_events_hash_uidx").on(table.eventHash),
    index("carbon_certificate_events_timeline_idx").on(table.certificateId, table.eventAt),
    check("carbon_certificate_events_sequence_chk", sql`${table.sequence} > 0`),
    check(
      "carbon_certificate_events_hash_chain_chk",
      sql`${table.previousEventHash} IS NULL OR ${table.previousEventHash} <> ${table.eventHash}`,
    ),
  ],
);

export const mrvEvidence = pgTable(
  "mrv_evidence",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "restrict" }),
    certificateId: uuid("certificate_id")
      .notNull()
      .references(() => carbonCertificates.id, { onDelete: "restrict" }),
    fieldId: uuid("field_id").references(() => fields.id, { onDelete: "restrict" }),
    evidenceType: evidenceType("evidence_type").notNull(),
    sourceEntityId: uuid("source_entity_id"),
    storageKey: text("storage_key"),
    contentHash: text("content_hash").notNull(),
    capturedAt: timestamp("captured_at", { withTimezone: true }).notNull(),
    provenance: jsonb("provenance").$type<Record<string, unknown>>().notNull(),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    verifiedBy: uuid("verified_by"),
    ...auditColumns(),
  },
  (table) => [
    uniqueIndex("mrv_evidence_certificate_hash_uidx").on(table.certificateId, table.contentHash),
    index("mrv_evidence_field_time_idx").on(table.fieldId, table.capturedAt),
  ],
);

export const modelRuns = pgTable(
  "model_runs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "restrict" }),
    fieldId: uuid("field_id")
      .notNull()
      .references(() => fields.id, { onDelete: "restrict" }),
    modelName: text("model_name").notNull(),
    modelVersion: text("model_version").notNull(),
    artifactHash: text("artifact_hash").notNull(),
    inputHash: text("input_hash").notNull(),
    evidenceMerkleRoot: text("evidence_merkle_root").notNull(),
    status: modelRunStatus("status").notNull(),
    outputs: jsonb("outputs").$type<Record<string, unknown>>().notNull(),
    uncertainty: jsonb("uncertainty").$type<Record<string, unknown>>().notNull(),
    constraints: jsonb("constraints").$type<string[]>().default([]).notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    ...auditColumns(),
  },
  (table) => [
    uniqueIndex("model_runs_input_model_uidx").on(
      table.fieldId,
      table.modelVersion,
      table.inputHash,
    ),
    index("model_runs_org_time_idx").on(table.organizationId, table.startedAt),
    index("model_runs_evidence_root_idx").on(table.evidenceMerkleRoot),
  ],
);

export const syncReceipts = pgTable(
  "sync_receipts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    idempotencyKey: text("idempotency_key").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: uuid("entity_id").notNull(),
    serverVersion: integer("server_version").notNull(),
    payloadHash: text("payload_hash").notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("sync_receipts_org_idempotency_uidx").on(
      table.organizationId,
      table.idempotencyKey,
    ),
    index("sync_receipts_entity_idx").on(table.entityType, table.entityId),
    check("sync_receipts_server_version_chk", sql`${table.serverVersion} > 0`),
  ],
);

export const auditEvents = pgTable(
  "audit_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "restrict" }),
    entityType: text("entity_type").notNull(),
    entityId: uuid("entity_id").notNull(),
    sequence: integer("sequence").notNull(),
    action: auditAction("action").notNull(),
    actorId: uuid("actor_id").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    requestId: text("request_id").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    previousEventHash: text("previous_event_hash"),
    payloadHash: text("payload_hash").notNull(),
    eventHash: text("event_hash").notNull(),
    signature: text("signature"),
    signingKeyId: text("signing_key_id"),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("audit_events_entity_sequence_uidx").on(
      table.organizationId,
      table.entityType,
      table.entityId,
      table.sequence,
    ),
    uniqueIndex("audit_events_hash_uidx").on(table.eventHash),
    index("audit_events_entity_timeline_idx").on(
      table.entityType,
      table.entityId,
      table.occurredAt,
    ),
    index("audit_events_request_idx").on(table.requestId),
    check("audit_events_sequence_chk", sql`${table.sequence} > 0`),
  ],
);
