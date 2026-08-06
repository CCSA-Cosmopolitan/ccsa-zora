import * as Network from "expo-network";
import { useQueryClient } from "@tanstack/react-query";
import { useSQLiteContext, type SQLiteDatabase } from "expo-sqlite";
import { AppState } from "react-native";
import { useEffect } from "react";

import { httpSyncTransport } from "./http-transport";
import { FieldScoutingSyncEngine } from "./sync-engine";
import { useSyncStore } from "../state/sync-store";

export const activeOrganizationId =
  process.env.EXPO_PUBLIC_ZORA_ORGANIZATION_ID ??
  "00000000-0000-4000-8000-000000000001";

export async function runFieldSync(db: SQLiteDatabase) {
  const store = useSyncStore.getState();
  if (store.running) return null;
  store.begin();
  try {
    const result = await new FieldScoutingSyncEngine(db, httpSyncTransport).synchronize(
      activeOrganizationId,
    );
    useSyncStore.getState().succeed(new Date().toISOString());
    return result;
  } catch (error) {
    useSyncStore.getState().fail(
      error instanceof Error ? error.message : "Field synchronization failed",
    );
    throw error;
  }
}

export function FieldSyncCoordinator() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const network = Network.useNetworkState();

  useEffect(() => {
    if (network.isInternetReachable === false) return;
    let cancelled = false;
    const sync = async () => {
      try {
        await runFieldSync(db);
        if (!cancelled) await queryClient.invalidateQueries({ queryKey: ["scouting"] });
      } catch {
        // The store exposes a concise user-visible error; the outbox retains work.
      }
    };
    void sync();
    const interval = setInterval(sync, 60_000);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void sync();
    });
    return () => {
      cancelled = true;
      clearInterval(interval);
      subscription.remove();
    };
  }, [db, network.isInternetReachable, queryClient]);

  return null;
}
