import type { SQLiteDatabase } from "expo-sqlite";

import type { OutboxEnvelope, PushResult } from "@ccsa-zora/utils/sync";
import type { SyncPullResponse } from "@ccsa-zora/utils/api";

import { applySyncPull, getPullCursor } from "../data/scouting.repository";

interface OutboxRow {
  id: string;
  idempotency_key: string;
  entity_type: "observation" | "observation_media";
  entity_id: string;
  operation: "create" | "update" | "delete";
  payload_json: string;
  attempt_count: number;
  created_at: string;
}

export interface SyncTransport {
  push: (envelope: OutboxEnvelope) => Promise<PushResult>;
  pull: (organizationId: string, cursor: string | null) => Promise<SyncPullResponse>;
}

export class FieldScoutingSyncEngine {
  constructor(
    private readonly db: SQLiteDatabase,
    private readonly transport: SyncTransport,
  ) {}

  async pushPending(limit = 25): Promise<number> {
    const rows = await this.db.getAllAsync<OutboxRow>(
      `SELECT *
         FROM sync_outbox
        WHERE next_attempt_at IS NULL OR next_attempt_at <= ?
        ORDER BY CASE entity_type WHEN 'observation' THEN 0 ELSE 1 END, created_at
        LIMIT ?;`,
      new Date().toISOString(),
      limit,
    );

    let pushed = 0;

    for (const row of rows) {
      const envelope: OutboxEnvelope = {
        id: row.id,
        idempotencyKey: row.idempotency_key,
        entity: row.entity_type,
        entityId: row.entity_id,
        operation: row.operation,
        payload: JSON.parse(row.payload_json) as unknown,
        clientCreatedAt: row.created_at,
        attemptCount: row.attempt_count,
      };

      try {
        const result = await this.transport.push(envelope);

        await this.db.withExclusiveTransactionAsync(async (transaction) => {
          if (row.entity_type === "observation") {
            await transaction.runAsync(
              `UPDATE local_observations
                  SET sync_status = 'synced',
                      server_version = ?,
                      updated_at = ?
                WHERE id = ?;`,
              result.serverVersion,
              result.acceptedAt,
              row.entity_id,
            );
          } else {
            await transaction.runAsync(
              `UPDATE local_observation_media
                  SET upload_status = 'uploaded'
                WHERE id = ?;`,
              row.entity_id,
            );
          }
          await transaction.runAsync("DELETE FROM sync_outbox WHERE id = ?;", row.id);
        });
        pushed += 1;
      } catch (error) {
        const attempts = row.attempt_count + 1;
        const backoffSeconds = Math.min(900, 2 ** attempts);
        const nextAttempt = new Date(Date.now() + backoffSeconds * 1_000).toISOString();

        await this.db.runAsync(
          `UPDATE sync_outbox
              SET attempt_count = ?,
                  next_attempt_at = ?,
                  last_error = ?
            WHERE id = ?;`,
          attempts,
          nextAttempt,
          error instanceof Error ? error.message.slice(0, 500) : "Unknown sync error",
          row.id,
        );
      }
    }

    return pushed;
  }

  async pullLatest(organizationId: string) {
    const cursor = await getPullCursor(this.db, organizationId);
    const response = await this.transport.pull(organizationId, cursor);
    await applySyncPull(this.db, organizationId, response);
    return response.observations.length + response.fields.length;
  }

  async synchronize(organizationId: string) {
    const pushed = await this.pushPending();
    const pulled = await this.pullLatest(organizationId);
    return { pushed, pulled };
  }
}
