import type { SQLiteDatabase } from "expo-sqlite";

const migrations = [
  {
    version: 1,
    sql: `
      CREATE TABLE IF NOT EXISTS local_observations (
        id TEXT PRIMARY KEY NOT NULL,
        organization_id TEXT NOT NULL,
        field_id TEXT NOT NULL,
        kind TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        title TEXT NOT NULL,
        notes TEXT,
        observed_at TEXT NOT NULL,
        longitude REAL NOT NULL,
        latitude REAL NOT NULL,
        accuracy_meters REAL,
        device_id TEXT NOT NULL,
        server_version INTEGER,
        sync_status TEXT NOT NULL DEFAULT 'pending',
        payload_json TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS local_observations_field_time_idx
        ON local_observations (field_id, observed_at DESC);

      CREATE INDEX IF NOT EXISTS local_observations_sync_idx
        ON local_observations (sync_status, updated_at);

      CREATE TABLE IF NOT EXISTS local_observation_media (
        id TEXT PRIMARY KEY NOT NULL,
        observation_id TEXT NOT NULL,
        local_uri TEXT NOT NULL,
        storage_key TEXT,
        mime_type TEXT NOT NULL,
        sha256 TEXT NOT NULL,
        byte_size INTEGER NOT NULL,
        captured_at TEXT NOT NULL,
        upload_status TEXT NOT NULL DEFAULT 'local',
        FOREIGN KEY (observation_id)
          REFERENCES local_observations (id)
          ON DELETE CASCADE
      );

      CREATE UNIQUE INDEX IF NOT EXISTS local_observation_media_sha_uidx
        ON local_observation_media (observation_id, sha256);

      CREATE TABLE IF NOT EXISTS sync_outbox (
        id TEXT PRIMARY KEY NOT NULL,
        idempotency_key TEXT NOT NULL UNIQUE,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        operation TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        attempt_count INTEGER NOT NULL DEFAULT 0,
        next_attempt_at TEXT,
        last_error TEXT,
        created_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS sync_outbox_ready_idx
        ON sync_outbox (next_attempt_at, created_at);

      CREATE TABLE IF NOT EXISTS sync_state (
        organization_id TEXT PRIMARY KEY NOT NULL,
        pull_cursor TEXT,
        last_pulled_at TEXT,
        last_pushed_at TEXT
      );
    `,
  },
  {
    version: 2,
    sql: `
      ALTER TABLE local_observations ADD COLUMN severity INTEGER;

      CREATE TABLE IF NOT EXISTS local_fields (
        id TEXT PRIMARY KEY NOT NULL,
        organization_id TEXT NOT NULL,
        name TEXT NOT NULL,
        status TEXT NOT NULL,
        crop_code TEXT,
        area_hectares REAL NOT NULL,
        boundary_json TEXT NOT NULL,
        centroid_longitude REAL NOT NULL,
        centroid_latitude REAL NOT NULL,
        ndvi REAL,
        soil_moisture_percent REAL,
        condition TEXT NOT NULL,
        last_evidence_at TEXT,
        synchronized_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS local_fields_organization_idx
        ON local_fields (organization_id, name);

      CREATE TABLE IF NOT EXISTS sync_conflicts (
        id TEXT PRIMARY KEY NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        local_payload_json TEXT NOT NULL,
        server_payload_json TEXT NOT NULL,
        detected_at TEXT NOT NULL,
        resolved_at TEXT
      );

      CREATE INDEX IF NOT EXISTS sync_conflicts_unresolved_idx
        ON sync_conflicts (resolved_at, detected_at);
    `,
  },
] as const;

export async function initializeLocalDatabase(db: SQLiteDatabase) {
  await db.execAsync("PRAGMA journal_mode = WAL;");
  await db.execAsync("PRAGMA foreign_keys = ON;");
  await db.execAsync("PRAGMA busy_timeout = 5000;");

  const current = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version;");
  const currentVersion = current?.user_version ?? 0;

  for (const migration of migrations) {
    if (migration.version <= currentVersion) {
      continue;
    }

    await db.withExclusiveTransactionAsync(async (transaction) => {
      await transaction.execAsync(migration.sql);
      await transaction.execAsync(`PRAGMA user_version = ${migration.version};`);
    });
  }
}
