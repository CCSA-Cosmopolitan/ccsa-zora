import { createHash, randomUUID } from "node:crypto";

import type { DatabaseTransaction } from "@ccsa-zora/db/client";
import type {
  DashboardSnapshot,
  FieldSummary,
  KgmlInferenceInput,
  KgmlInferenceResult,
  ObservationPayload,
  ObservationMediaPayload,
  ObservationRecord,
  SensorIngestionResponse,
  SensorReadingInput,
  SyncPullResponse,
  ZoraAdvisoryInput,
  ZoraAdvisoryResult,
} from "@ccsa-zora/utils/api";
import type { OutboxEnvelope, PushResult } from "@ccsa-zora/utils/sync";

import {
  createDemoDashboard,
  demoFields,
  getDemoState,
} from "./demo-data";
import { getDatabase } from "./database";
import { assertProductionConfiguration } from "./env";

export interface ZoraRepository {
  readonly source: "database" | "demo";
  isMember(organizationId: string, userId: string): Promise<boolean>;
  getDashboard(organizationId: string, userId: string): Promise<DashboardSnapshot>;
  pull(organizationId: string, userId: string, cursor: string | null): Promise<SyncPullResponse>;
  pushObservation(
    organizationId: string,
    userId: string,
    requestId: string,
    envelope: OutboxEnvelope<ObservationPayload>,
  ): Promise<PushResult>;
  ingestSensorReadings(
    organizationId: string,
    readings: SensorReadingInput[],
  ): Promise<SensorIngestionResponse>;
  recordModelRun(
    organizationId: string,
    userId: string,
    input: KgmlInferenceInput,
    result: KgmlInferenceResult,
  ): Promise<void>;
  recordAdvisory(
    organizationId: string,
    userId: string,
    input: ZoraAdvisoryInput,
    result: ZoraAdvisoryResult,
  ): Promise<void>;
  recordObservationMedia(
    organizationId: string,
    userId: string,
    requestId: string,
    idempotencyKey: string,
    payload: ObservationMediaPayload & { storageKey: string },
  ): Promise<PushResult>;
}

class DemoRepository implements ZoraRepository {
  readonly source = "demo" as const;

  async isMember() {
    return true;
  }

  async getDashboard() {
    return createDemoDashboard(getDemoState().observations.size);
  }

  async pull(organizationId: string, _userId: string, cursor: string | null) {
    const state = getDemoState();
    const cursorTime = cursor ? Date.parse(cursor) : 0;
    const observations = [...state.observations.values()].filter(
      (item) => Date.parse(item.updatedAt) > cursorTime,
    );
    const serverTime = new Date().toISOString();
    return {
      cursor: serverTime,
      hasMore: false,
      fields: demoFields.filter(() => organizationId.length > 0),
      observations,
      serverTime,
    } satisfies SyncPullResponse;
  }

  async pushObservation(
    _organizationId: string,
    _userId: string,
    _requestId: string,
    envelope: OutboxEnvelope<ObservationPayload>,
  ) {
    const state = getDemoState();
    const receipt = state.receipts.get(envelope.idempotencyKey);
    if (receipt) {
      return { idempotencyKey: envelope.idempotencyKey, ...receipt };
    }
    const acceptedAt = new Date().toISOString();
    const existing = state.observations.get(envelope.entityId);
    const serverVersion = (existing?.version ?? 0) + 1;
    state.observations.set(envelope.entityId, {
      ...envelope.payload,
      version: serverVersion,
      updatedAt: acceptedAt,
      syncStatus: "synced",
    });
    state.receipts.set(envelope.idempotencyKey, { serverVersion, acceptedAt });
    return { idempotencyKey: envelope.idempotencyKey, serverVersion, acceptedAt };
  }

  async ingestSensorReadings(_organizationId: string, readings: SensorReadingInput[]) {
    return {
      accepted: readings.reduce((sum, reading) => sum + Object.keys(reading.metrics).length, 0),
      duplicates: 0,
      rejected: 0,
      receivedAt: new Date().toISOString(),
    };
  }

  async recordModelRun() {}

  async recordAdvisory() {}

  async recordObservationMedia(
    _organizationId: string,
    _userId: string,
    _requestId: string,
    idempotencyKey: string,
  ) {
    const state = getDemoState();
    const existing = state.receipts.get(idempotencyKey);
    if (existing) return { idempotencyKey, ...existing };
    const receipt = { serverVersion: 1, acceptedAt: new Date().toISOString() };
    state.receipts.set(idempotencyKey, receipt);
    return { idempotencyKey, ...receipt };
  }
}

type JsonValue =
  | null
  | string
  | number
  | boolean
  | JsonValue[]
  | { [key: string]: JsonValue | undefined };

function toJsonValue(value: unknown): JsonValue {
  const serialized = JSON.stringify(value);
  if (serialized === undefined) throw new TypeError("Value is not JSON serializable");
  return JSON.parse(serialized) as JsonValue;
}

async function withDatabaseContext<T>(
  organizationId: string,
  userId: string | null,
  service: "web" | "iot",
  callback: (transaction: DatabaseTransaction) => Promise<T>,
): Promise<T> {
  const { client } = getDatabase();
  const result = await client.begin(async (transaction) => {
    await transaction`
      select
        set_config('app.organization_id', ${organizationId}, true),
        set_config('app.user_id', ${userId ?? ""}, true),
        set_config('app.service', ${service}, true)
    `;
    return callback(transaction);
  });
  return result as T;
}

interface DbFieldRow {
  id: string;
  name: string;
  status: FieldSummary["status"];
  crop_code: string | null;
  area_hectares: string;
  boundary: FieldSummary["boundary"];
  centroid: FieldSummary["centroid"];
  ndvi: string | null;
  soil_moisture: string | null;
  last_evidence_at: Date | string | null;
}

function conditionFor(ndvi: number | null, moisture: number | null): FieldSummary["condition"] {
  if (moisture !== null && moisture < 20) return "water_stress";
  if (ndvi === null) return "unknown";
  if (ndvi < 0.6) return "inspect";
  return "healthy";
}

function mapField(row: DbFieldRow): FieldSummary {
  const ndvi = row.ndvi === null ? null : Number(row.ndvi);
  const moisture = row.soil_moisture === null ? null : Number(row.soil_moisture);
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    cropCode: row.crop_code,
    areaHectares: Number(row.area_hectares),
    boundary: row.boundary,
    centroid: row.centroid,
    ndvi,
    soilMoisturePercent: moisture,
    condition: conditionFor(ndvi, moisture),
    lastEvidenceAt: row.last_evidence_at
      ? new Date(row.last_evidence_at).toISOString()
      : null,
  };
}

class PostgresRepository implements ZoraRepository {
  readonly source = "database" as const;

  async isMember(organizationId: string, userId: string) {
    return withDatabaseContext(organizationId, userId, "web", async (transaction) => {
      const rows = await transaction`
        select 1
          from public.organization_members
         where organization_id = ${organizationId}::uuid
           and user_id = ${userId}::uuid
         limit 1
      `;
      return rows.length === 1;
    });
  }

  private async fields(transaction: DatabaseTransaction, organizationId: string): Promise<FieldSummary[]> {
    const rows = await transaction`
      select
        f.id,
        f.name,
        f.status,
        f.crop_code,
        f.area_hectares,
        extensions.ST_AsGeoJSON(f.boundary)::jsonb as boundary,
        extensions.ST_AsGeoJSON(extensions.ST_PointOnSurface(f.boundary))::jsonb as centroid,
        ndvi.value as ndvi,
        moisture.value as soil_moisture,
        evidence.last_evidence_at
      from public.fields as f
      left join lateral (
        select i.value
          from public.field_indices as i
         where i.field_id = f.id and i.index_type = 'ndvi'
         order by i.observed_at desc limit 1
      ) as ndvi on true
      left join lateral (
        select r.value
          from public.sensor_readings as r
          join public.sensor_nodes as n on n.id = r.sensor_node_id
         where n.field_id = f.id and r.metric = 'soil_moisture_percent'
         order by r.observed_at desc limit 1
      ) as moisture on true
      left join lateral (
        select max(o.observed_at) as last_evidence_at
          from public.observations as o
         where o.field_id = f.id
      ) as evidence on true
      where f.organization_id = ${organizationId}::uuid
        and f.archived_at is null
      order by f.name
    `;
    return (rows as unknown as DbFieldRow[]).map(mapField);
  }

  async getDashboard(organizationId: string, userId: string): Promise<DashboardSnapshot> {
    return withDatabaseContext(organizationId, userId, "web", async (transaction) => {
      const [organizationRows, fields, sensorRows, certificateRows, auditRows] = await Promise.all([
      transaction`select id, name from public.organizations where id = ${organizationId}::uuid`,
      this.fields(transaction, organizationId),
      transaction`
        select
          count(*)::integer as total,
          count(*) filter (where last_seen_at >= now() - interval '24 hours')::integer as reporting,
          count(*) filter (where status = 'degraded')::integer as degraded,
          count(*) filter (where status = 'offline')::integer as offline
        from public.sensor_nodes where organization_id = ${organizationId}::uuid
      `,
      transaction`
        select coalesce(sum(c.quantity_tco2e) filter (where s.current_state in ('issued', 'transferred')), 0) as verified,
               count(*) filter (where s.current_state = 'issued')::integer as pending
          from public.carbon_certificates c
          left join public.current_carbon_certificate_state s on s.certificate_id = c.id
         where c.organization_id = ${organizationId}::uuid
      `,
      transaction`select count(*)::integer as count from public.audit_events where organization_id = ${organizationId}::uuid`,
    ]);
    const organization = organizationRows[0] as { id: string; name: string } | undefined;
    if (!organization) throw new Error("Organization not found");
    const sensors = sensorRows[0] as { total: number; reporting: number; degraded: number; offline: number };
    const certificates = certificateRows[0] as { verified: string; pending: number };
    const audit = auditRows[0] as { count: number };
    const ndviValues = fields.flatMap((field) => (field.ndvi === null ? [] : [field.ndvi]));
    const sensorAvailability = sensors.total === 0 ? 0 : (sensors.reporting / sensors.total) * 100;
      return {
      organization,
      generatedAt: new Date().toISOString(),
      source: "database",
      metrics: {
        meanNdvi: ndviValues.length ? ndviValues.reduce((a, b) => a + b, 0) / ndviValues.length : null,
        sensorAvailabilityPercent: sensorAvailability,
        verifiedRemovalsTco2e: Number(certificates.verified),
        heatRiskDays: 0,
        signedRecordCount: audit.count,
        pendingVerificationCount: certificates.pending,
      },
      sensors,
      mrv: {
        boundaryValidationPercent: fields.length ? 100 : 0,
        practiceEvidenceComplete: 0,
        practiceEvidenceRequired: fields.length,
        sensorContinuityPercent: sensorAvailability,
        verifierStatus: certificates.pending ? "in_review" : "not_started",
      },
      fields,
      };
    });
  }

  async pull(organizationId: string, userId: string, cursor: string | null): Promise<SyncPullResponse> {
    return withDatabaseContext(organizationId, userId, "web", async (transaction) => {
      const serverTime = new Date().toISOString();
      const [fields, rows] = await Promise.all([
      this.fields(transaction, organizationId),
      transaction`
        select id, organization_id, field_id, kind, status, title, notes, severity,
               observed_at,
               extensions.ST_AsGeoJSON(location)::jsonb as location,
               accuracy_meters, device_id, payload, version, updated_at
          from public.observations
         where organization_id = ${organizationId}::uuid
           and updated_at > coalesce(${cursor}::timestamptz, '-infinity'::timestamptz)
         order by updated_at
         limit 500
      `,
    ]);
    const observations = rows.map((row) => {
      const item = row as unknown as Record<string, unknown>;
      return {
        id: String(item.id),
        organizationId: String(item.organization_id),
        fieldId: String(item.field_id),
        kind: item.kind,
        status: item.status === "draft" ? "draft" : "submitted",
        title: String(item.title),
        notes: item.notes === null ? null : String(item.notes),
        severity: item.severity === null ? null : Number(item.severity),
        observedAt: new Date(item.observed_at as string).toISOString(),
        location: item.location,
        accuracyMeters: item.accuracy_meters === null ? null : Number(item.accuracy_meters),
        deviceId: String(item.device_id),
        payload: item.payload as Record<string, unknown>,
        version: Number(item.version),
        updatedAt: new Date(item.updated_at as string).toISOString(),
        syncStatus: "synced",
      } as ObservationRecord;
    });
      return { cursor: serverTime, hasMore: rows.length === 500, fields, observations, serverTime };
    });
  }

  async pushObservation(
    organizationId: string,
    userId: string,
    requestId: string,
    envelope: OutboxEnvelope<ObservationPayload>,
  ): Promise<PushResult> {
    return withDatabaseContext(organizationId, userId, "web", async (transaction) => {
      const rows = await transaction`
        select * from public.accept_mobile_observation(
          ${organizationId}::uuid,
          ${userId}::uuid,
          ${envelope.idempotencyKey},
          ${requestId},
          ${transaction.json(toJsonValue(envelope.payload))}::jsonb
        )
      `;
      const receipt = rows[0] as { idempotency_key: string; server_version: number; accepted_at: Date };
      return {
        idempotencyKey: receipt.idempotency_key,
        serverVersion: receipt.server_version,
        acceptedAt: new Date(receipt.accepted_at).toISOString(),
      };
    });
  }

  async ingestSensorReadings(
    organizationId: string,
    readings: SensorReadingInput[],
  ): Promise<SensorIngestionResponse> {
    return withDatabaseContext(organizationId, null, "iot", async (transaction) => {
      let accepted = 0;
      let duplicates = 0;
      let rejected = 0;
      for (const reading of readings) {
        const nodes = await transaction`
        select id from public.sensor_nodes
         where organization_id = ${organizationId}::uuid
           and hardware_id = ${reading.sensorHardwareId}
         limit 1
      `;
        const node = nodes[0] as { id: string } | undefined;
        if (!node) {
          rejected += Object.keys(reading.metrics).length;
          continue;
        }
        for (const [metric, measurement] of Object.entries(reading.metrics)) {
          const canonical = JSON.stringify({ ...reading, metric, measurement });
          const payloadHash = createHash("sha256").update(canonical).digest("hex");
          const inserted = await transaction`
          insert into public.sensor_readings (
            organization_id, sensor_node_id, observed_at, metric, value, unit,
            sequence_number, payload_hash, raw_payload
          ) values (
            ${organizationId}::uuid, ${node.id}::uuid, ${reading.observedAt}::timestamptz,
            ${metric}, ${measurement.value}, ${measurement.unit},
            ${reading.sequenceNumber ?? null}, ${payloadHash}, ${transaction.json(toJsonValue(reading.rawPayload ?? {}))}::jsonb
          ) on conflict (sensor_node_id, payload_hash) do nothing
          returning id
        `;
          inserted.length ? accepted++ : duplicates++;
        }
        await transaction`
        update public.sensor_nodes
           set last_seen_at = ${reading.observedAt}::timestamptz,
               status = 'active'
         where id = ${node.id}::uuid
      `;
      }
      return { accepted, duplicates, rejected, receivedAt: new Date().toISOString() };
    });
  }

  async recordModelRun(
    organizationId: string,
    userId: string,
    input: KgmlInferenceInput,
    result: KgmlInferenceResult,
  ) {
    const inputHash = createHash("sha256").update(JSON.stringify(input)).digest("hex");
    await withDatabaseContext(organizationId, userId, "web", async (transaction) => {
      await transaction`
      insert into public.model_runs (
        id, organization_id, field_id, model_name, model_version, artifact_hash,
        input_hash, evidence_merkle_root, status, outputs, uncertainty, constraints,
        started_at, completed_at, created_by
      ) values (
        ${result.inferenceId}::uuid, ${organizationId}::uuid, ${input.fieldId}::uuid,
        ${result.model.name}, ${result.model.version}, ${result.model.artifactHash},
        ${inputHash}, ${result.evidenceMerkleRoot}, 'completed',
        ${transaction.json(result.outputs)}::jsonb,
        ${transaction.json({ lower95Tco2e: result.outputs.lower95Tco2e, upper95Tco2e: result.outputs.upper95Tco2e })}::jsonb,
        ${transaction.json(result.constraints)}::jsonb,
        ${result.generatedAt}::timestamptz, ${result.generatedAt}::timestamptz, ${userId}::uuid
      ) on conflict (field_id, model_version, input_hash) do nothing
      `;
    });
  }

  async recordAdvisory(
    organizationId: string,
    userId: string,
    input: ZoraAdvisoryInput,
    result: ZoraAdvisoryResult,
  ) {
    const sessionId = randomUUID();
    const farmerMessageId = randomUUID();
    const reasoningTraceHash = createHash("sha256")
      .update(JSON.stringify(result))
      .digest("hex");
    await withDatabaseContext(organizationId, userId, "web", async (transaction) => {
      await transaction`
        insert into public.advisory_sessions (
          id, organization_id, field_id, language, channel, status, ended_at, summary,
          context, created_by
        ) values (
          ${sessionId}::uuid, ${organizationId}::uuid,
          ${input.fieldId ?? null}::uuid, ${input.language}, ${input.channel},
          'resolved', ${result.generatedAt}::timestamptz, ${result.diagnosis},
          ${transaction.json(toJsonValue(input.context ?? {}))}::jsonb,
          ${userId}::uuid
        )
      `;
      await transaction`
        insert into public.advisory_messages (
          id, organization_id, session_id, sequence, role, content
        ) values (
          ${farmerMessageId}::uuid, ${organizationId}::uuid, ${sessionId}::uuid,
          1, 'farmer', ${input.message}
        )
      `;
      await transaction`
        insert into public.advisory_messages (
          id, organization_id, session_id, sequence, role, content, confidence,
          knowledge_basis, reasoning_trace_hash, model_metadata
        ) values (
          ${result.advisoryId}::uuid, ${organizationId}::uuid, ${sessionId}::uuid,
          2, 'zora', ${result.answer}, ${result.confidence},
          ${transaction.json(result.knowledgeBasis)}::jsonb,
          ${reasoningTraceHash},
          ${transaction.json(result.model)}::jsonb
        )
      `;
    });
  }

  async recordObservationMedia(
    organizationId: string,
    userId: string,
    requestId: string,
    idempotencyKey: string,
    payload: ObservationMediaPayload & { storageKey: string },
  ) {
    return withDatabaseContext(organizationId, userId, "web", async (transaction) => {
      const rows = await transaction`
        select * from public.accept_observation_media(
          ${organizationId}::uuid,
          ${userId}::uuid,
          ${idempotencyKey},
          ${requestId},
          ${transaction.json(toJsonValue(payload))}::jsonb
        )
      `;
      const receipt = rows[0] as { idempotency_key: string; server_version: number; accepted_at: Date };
      return {
        idempotencyKey: receipt.idempotency_key,
        serverVersion: receipt.server_version,
        acceptedAt: new Date(receipt.accepted_at).toISOString(),
      };
    });
  }
}

let repository: ZoraRepository | undefined;

export function getRepository(): ZoraRepository {
  assertProductionConfiguration();
  repository ??=
    process.env.ZORA_DEMO_MODE === "true"
      ? new DemoRepository()
      : new PostgresRepository();
  return repository;
}

export async function assertOrganizationAccess(
  repository: ZoraRepository,
  organizationId: string,
  userId: string,
) {
  if (!(await repository.isMember(organizationId, userId))) {
    const error = new Error("You are not a member of this organization");
    error.name = "OrganizationAccessError";
    throw error;
  }
}

export async function checkDatabaseReadiness(): Promise<{ ok: boolean; latencyMs: number; code: string }> {
  if (process.env.ZORA_DEMO_MODE === "true") return { ok: true, latencyMs: 0, code: "demo" };
  const startedAt = Date.now();
  try {
    const { client } = getDatabase();
    const query = client`
      select exists(select 1 from pg_extension where extname = 'postgis') as postgis,
             to_regprocedure('public.accept_mobile_observation(uuid,uuid,text,text,jsonb)') is not null as sync_api
    `;
    const rows = await Promise.race([
      query,
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("database_timeout")), 4_000)),
    ]);
    const status = rows[0] as { postgis: boolean; sync_api: boolean } | undefined;
    const ok = Boolean(status?.postgis && status.sync_api);
    return { ok, latencyMs: Date.now() - startedAt, code: ok ? "reachable" : "schema_incomplete" };
  } catch (error) {
    return {
      ok: false,
      latencyMs: Date.now() - startedAt,
      code: error instanceof Error && error.message === "database_timeout" ? "timeout" : "unreachable",
    };
  }
}
