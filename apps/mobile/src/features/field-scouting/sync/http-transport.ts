import { createZoraClient } from "@ccsa-zora/api-client";
import type { ObservationMediaPayload, ObservationPayload } from "@ccsa-zora/utils/api";
import type { OutboxEnvelope } from "@ccsa-zora/utils/sync";

import { getMobileAccessToken } from "@/auth/supabase";

const api = createZoraClient({
  baseUrl: process.env.EXPO_PUBLIC_API_URL ?? "http://127.0.0.1:3000",
  getAccessToken: getMobileAccessToken,
});

export const httpSyncTransport = {
  pull: (organizationId: string, cursor: string | null) => api.pull(organizationId, cursor),
  async push(envelope: OutboxEnvelope) {
    if (envelope.entity === "observation") {
      return api.push(envelope as OutboxEnvelope<ObservationPayload>);
    }
    const mediaEnvelope = envelope as OutboxEnvelope<ObservationMediaPayload>;
    const response = await fetch(mediaEnvelope.payload.localUri);
    if (!response.ok) throw new Error("The local evidence photo is no longer readable");
    const blob = await response.blob();
    return api.uploadObservationMedia(mediaEnvelope, blob);
  },
};
