export type SyncOperation = "create" | "update" | "delete";
export type SyncEntity = "observation" | "observation_media";

export interface OutboxEnvelope<TPayload = unknown> {
  id: string;
  idempotencyKey: string;
  entity: SyncEntity;
  entityId: string;
  operation: SyncOperation;
  payload: TPayload;
  clientCreatedAt: string;
  attemptCount: number;
}

export interface PullCursor {
  organizationId: string;
  cursor: string | null;
  lastPulledAt: string | null;
}

export interface PushResult {
  idempotencyKey: string;
  serverVersion: number;
  acceptedAt: string;
}
