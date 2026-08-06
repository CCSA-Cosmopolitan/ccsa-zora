import * as Crypto from "expo-crypto";
import type { SQLiteDatabase } from "expo-sqlite";

import type {
  FieldSummary,
  ObservationMediaPayload,
  ObservationPayload,
  ObservationRecord,
  SyncPullResponse,
} from "@ccsa-zora/utils/api";

export interface DraftObservationInput {
  id: string;
  organizationId: string;
  fieldId: string;
  kind: ObservationPayload["kind"];
  title: string;
  notes: string | null;
  severity: number | null;
  observedAt: string;
  longitude: number;
  latitude: number;
  accuracyMeters: number | null;
  deviceId: string;
  createdAt: string;
  media?: Omit<ObservationMediaPayload, "organizationId" | "observationId" | "fieldId">;
}

export async function saveDraftObservation(db: SQLiteDatabase, input: DraftObservationInput) {
  const idempotencyKey = `observation:${input.id}:create`;
  const payload: ObservationPayload = {
    id: input.id,
    organizationId: input.organizationId,
    fieldId: input.fieldId,
    kind: input.kind,
    status: "submitted",
    title: input.title,
    notes: input.notes,
    severity: input.severity,
    observedAt: input.observedAt,
    location: { type: "Point", coordinates: [input.longitude, input.latitude] },
    accuracyMeters: input.accuracyMeters,
    deviceId: input.deviceId,
  };

  await db.withExclusiveTransactionAsync(async (transaction) => {
    await transaction.runAsync(
      `INSERT INTO local_observations (
        id, organization_id, field_id, kind, status, title, notes, severity,
        observed_at, longitude, latitude, accuracy_meters, device_id,
        sync_status, payload_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'submitted', ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?);`,
      input.id, input.organizationId, input.fieldId, input.kind, input.title,
      input.notes, input.severity, input.observedAt, input.longitude, input.latitude,
      input.accuracyMeters, input.deviceId, JSON.stringify(payload), input.createdAt,
      input.createdAt,
    );
    await transaction.runAsync(
      `INSERT INTO sync_outbox (
        id, idempotency_key, entity_type, entity_id, operation, payload_json, created_at
      ) VALUES (?, ?, 'observation', ?, 'create', ?, ?);`,
      idempotencyKey, idempotencyKey, input.id, JSON.stringify(payload), input.createdAt,
    );

    if (input.media) {
      const mediaPayload: ObservationMediaPayload = {
        ...input.media,
        organizationId: input.organizationId,
        observationId: input.id,
        fieldId: input.fieldId,
      };
      const mediaKey = `observation-media:${input.media.id}:create`;
      await transaction.runAsync(
        `INSERT INTO local_observation_media (
          id, observation_id, local_uri, mime_type, sha256, byte_size,
          captured_at, upload_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'queued');`,
        input.media.id, input.id, input.media.localUri, input.media.mimeType,
        input.media.sha256, input.media.byteSize, input.media.capturedAt,
      );
      await transaction.runAsync(
        `INSERT INTO sync_outbox (
          id, idempotency_key, entity_type, entity_id, operation, payload_json, created_at
        ) VALUES (?, ?, 'observation_media', ?, 'create', ?, ?);`,
        mediaKey, mediaKey, input.media.id, JSON.stringify(mediaPayload), input.createdAt,
      );
    }
  });
}

export async function applySyncPull(
  db: SQLiteDatabase,
  organizationId: string,
  response: SyncPullResponse,
) {
  await db.withExclusiveTransactionAsync(async (transaction) => {
    for (const field of response.fields) {
      await transaction.runAsync(
        `INSERT INTO local_fields (
          id, organization_id, name, status, crop_code, area_hectares,
          boundary_json, centroid_longitude, centroid_latitude, ndvi,
          soil_moisture_percent, condition, last_evidence_at, synchronized_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name=excluded.name, status=excluded.status, crop_code=excluded.crop_code,
          area_hectares=excluded.area_hectares, boundary_json=excluded.boundary_json,
          centroid_longitude=excluded.centroid_longitude,
          centroid_latitude=excluded.centroid_latitude, ndvi=excluded.ndvi,
          soil_moisture_percent=excluded.soil_moisture_percent,
          condition=excluded.condition, last_evidence_at=excluded.last_evidence_at,
          synchronized_at=excluded.synchronized_at;`,
        field.id, organizationId, field.name, field.status, field.cropCode,
        field.areaHectares, JSON.stringify(field.boundary), field.centroid.coordinates[0],
        field.centroid.coordinates[1], field.ndvi, field.soilMoisturePercent,
        field.condition, field.lastEvidenceAt, response.serverTime,
      );
    }

    for (const observation of response.observations) {
      const local = await transaction.getFirstAsync<{ sync_status: string; payload_json: string; server_version: number | null }>(
        "SELECT sync_status, payload_json, server_version FROM local_observations WHERE id = ?;",
        observation.id,
      );
      if (local?.sync_status === "pending" && (local.server_version ?? 0) < observation.version) {
        await transaction.runAsync(
          `INSERT OR IGNORE INTO sync_conflicts (
            id, entity_type, entity_id, local_payload_json, server_payload_json, detected_at
          ) VALUES (?, 'observation', ?, ?, ?, ?);`,
          Crypto.randomUUID(), observation.id, local.payload_json,
          JSON.stringify(observation), response.serverTime,
        );
        await transaction.runAsync(
          "UPDATE local_observations SET sync_status = 'conflict' WHERE id = ?;",
          observation.id,
        );
        continue;
      }
      const [longitude, latitude] = observation.location.coordinates;
      await transaction.runAsync(
        `INSERT INTO local_observations (
          id, organization_id, field_id, kind, status, title, notes, severity,
          observed_at, longitude, latitude, accuracy_meters, device_id,
          server_version, sync_status, payload_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced', ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          status=excluded.status, title=excluded.title, notes=excluded.notes,
          severity=excluded.severity, server_version=excluded.server_version,
          sync_status='synced', payload_json=excluded.payload_json,
          updated_at=excluded.updated_at;`,
        observation.id, observation.organizationId, observation.fieldId,
        observation.kind, observation.status, observation.title, observation.notes,
        observation.severity ?? null, observation.observedAt, longitude, latitude,
        observation.accuracyMeters, observation.deviceId, observation.version,
        JSON.stringify(observation), observation.observedAt, observation.updatedAt,
      );
    }
    await transaction.runAsync(
      `INSERT INTO sync_state (organization_id, pull_cursor, last_pulled_at)
       VALUES (?, ?, ?)
       ON CONFLICT(organization_id) DO UPDATE SET
         pull_cursor=excluded.pull_cursor, last_pulled_at=excluded.last_pulled_at;`,
      organizationId, response.cursor, response.serverTime,
    );
  });
}

export async function getPullCursor(db: SQLiteDatabase, organizationId: string) {
  const row = await db.getFirstAsync<{ pull_cursor: string | null }>(
    "SELECT pull_cursor FROM sync_state WHERE organization_id = ?;",
    organizationId,
  );
  return row?.pull_cursor ?? null;
}

interface LocalFieldRow {
  id: string; name: string; status: FieldSummary["status"]; crop_code: string | null;
  area_hectares: number; boundary_json: string; centroid_longitude: number;
  centroid_latitude: number; ndvi: number | null; soil_moisture_percent: number | null;
  condition: FieldSummary["condition"]; last_evidence_at: string | null;
}

export async function listLocalFields(db: SQLiteDatabase): Promise<FieldSummary[]> {
  const rows = await db.getAllAsync<LocalFieldRow>("SELECT * FROM local_fields ORDER BY name;");
  return rows.map((row) => ({
    id: row.id, name: row.name, status: row.status, cropCode: row.crop_code,
    areaHectares: row.area_hectares, boundary: JSON.parse(row.boundary_json),
    centroid: { type: "Point", coordinates: [row.centroid_longitude, row.centroid_latitude] },
    ndvi: row.ndvi, soilMoisturePercent: row.soil_moisture_percent,
    condition: row.condition, lastEvidenceAt: row.last_evidence_at,
  }));
}

export interface LocalObservationListItem {
  id: string; title: string; fieldName: string; status: string; observedAt: string;
  syncStatus: "pending" | "synced" | "conflict";
}

export async function getScoutingOverview(db: SQLiteDatabase) {
  const observations = await db.getAllAsync<LocalObservationListItem>(
    `SELECT o.id, o.title, coalesce(f.name, 'Unknown field') as fieldName,
            o.status, o.observed_at as observedAt, o.sync_status as syncStatus
       FROM local_observations o
       LEFT JOIN local_fields f ON f.id = o.field_id
      ORDER BY o.observed_at DESC LIMIT 20;`,
  );
  const counts = await db.getFirstAsync<{ fields: number; pending: number; conflicts: number }>(
    `SELECT
       (SELECT count(*) FROM local_fields) as fields,
       (SELECT count(*) FROM sync_outbox) as pending,
       (SELECT count(*) FROM sync_conflicts WHERE resolved_at IS NULL) as conflicts;`,
  );
  return { observations, fields: counts?.fields ?? 0, pending: counts?.pending ?? 0, conflicts: counts?.conflicts ?? 0 };
}
