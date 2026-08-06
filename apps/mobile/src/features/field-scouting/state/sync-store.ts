import { create } from "zustand";

interface SyncState {
  running: boolean;
  lastSyncedAt: string | null;
  lastError: string | null;
  begin: () => void;
  succeed: (at: string) => void;
  fail: (message: string) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  running: false,
  lastSyncedAt: null,
  lastError: null,
  begin: () => set({ running: true, lastError: null }),
  succeed: (lastSyncedAt) => set({ running: false, lastSyncedAt, lastError: null }),
  fail: (lastError) => set({ running: false, lastError }),
}));
