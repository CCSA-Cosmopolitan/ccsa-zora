"use client";

import { useQuery } from "@tanstack/react-query";

import { createZoraClient } from "@ccsa-zora/api-client";

import { getAccessToken } from "@/lib/supabase";

export const activeOrganizationId =
  process.env.NEXT_PUBLIC_ZORA_ORGANIZATION_ID ?? "00000000-0000-4000-8000-000000000001";

const api = createZoraClient({ getAccessToken });

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard", activeOrganizationId],
    queryFn: () => api.dashboard(activeOrganizationId),
    refetchInterval: 60_000,
  });
}
