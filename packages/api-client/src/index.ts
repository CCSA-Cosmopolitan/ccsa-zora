import type {
  DashboardSnapshot,
  KgmlInferenceInput,
  KgmlInferenceResult,
  ObservationPayload,
  ObservationMediaPayload,
  SensorIngestionResponse,
  SensorReadingInput,
  SyncPullResponse,
  ZoraAdvisoryInput,
  ZoraAdvisoryResult,
} from "@ccsa-zora/utils/api";
import type { OutboxEnvelope, PushResult } from "@ccsa-zora/utils/sync";

export class ZoraApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ZoraApiError";
  }
}

export interface ZoraClientOptions {
  baseUrl?: string;
  getAccessToken?: () => Promise<string | null>;
  fetchImpl?: typeof fetch;
}

export function createZoraClient(options: ZoraClientOptions = {}) {
  const fetchImpl = options.fetchImpl ?? fetch;
  const baseUrl = (options.baseUrl ?? "").replace(/\/$/, "");

  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const accessToken = await options.getAccessToken?.();
    const headers = new Headers(init.headers);
    headers.set("accept", "application/json");
    if (init.body && !(init.body instanceof FormData)) {
      headers.set("content-type", "application/json");
    }
    if (accessToken) {
      headers.set("authorization", `Bearer ${accessToken}`);
    }

    const response = await fetchImpl(`${baseUrl}${path}`, {
      ...init,
      headers,
    });
    const contentType = response.headers.get("content-type") ?? "";
    const body = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const message =
        typeof body === "object" && body && "error" in body
          ? String((body as { error: unknown }).error)
          : `Zora API request failed (${response.status})`;
      throw new ZoraApiError(message, response.status, body);
    }

    return body as T;
  }

  return {
    dashboard(organizationId: string) {
      return request<DashboardSnapshot>(
        `/api/dashboard?organizationId=${encodeURIComponent(organizationId)}`,
      );
    },
    pull(organizationId: string, cursor?: string | null) {
      const query = new URLSearchParams({ organizationId });
      if (cursor) query.set("cursor", cursor);
      return request<SyncPullResponse>(`/api/sync/pull?${query.toString()}`);
    },
    push(envelope: OutboxEnvelope<ObservationPayload>) {
      return request<PushResult>("/api/sync/push", {
        method: "POST",
        headers: { "idempotency-key": envelope.idempotencyKey },
        body: JSON.stringify(envelope),
      });
    },
    uploadObservationMedia(
      envelope: OutboxEnvelope<ObservationMediaPayload>,
      file: Blob,
    ) {
      const form = new FormData();
      form.append("metadata", JSON.stringify(envelope));
      form.append("file", file);
      return request<PushResult>("/api/media", {
        method: "POST",
        headers: { "idempotency-key": envelope.idempotencyKey },
        body: form,
      });
    },
    ingestSensorReadings(
      organizationId: string,
      readings: SensorReadingInput[],
      signature: string,
      timestamp: string,
    ) {
      return request<SensorIngestionResponse>("/api/iot/readings", {
        method: "POST",
        headers: {
          "x-zora-organization": organizationId,
          "x-zora-signature": signature,
          "x-zora-timestamp": timestamp,
        },
        body: JSON.stringify({ readings }),
      });
    },
    infer(input: KgmlInferenceInput) {
      return request<KgmlInferenceResult>("/api/kgml/inferences", {
        method: "POST",
        body: JSON.stringify(input),
      });
    },
    advisory(input: ZoraAdvisoryInput) {
      return request<ZoraAdvisoryResult>("/api/advisory", {
        method: "POST",
        headers: { "x-zora-organization": input.organizationId },
        body: JSON.stringify(input),
      });
    },
  };
}

export type ZoraClient = ReturnType<typeof createZoraClient>;
