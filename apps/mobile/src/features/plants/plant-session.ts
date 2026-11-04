import { create } from "zustand";
import type { PlantResult } from "@/services/assistant";

interface PlantSessionState {
  photoUri: string | null;
  result: PlantResult | null;
  set: (photoUri: string, result: PlantResult) => void;
  clear: () => void;
}

/** Holds the latest identification so the result screen needs no large route params. */
export const usePlantSession = create<PlantSessionState>((set) => ({
  photoUri: null,
  result: null,
  set: (photoUri, result) => set({ photoUri, result }),
  clear: () => set({ photoUri: null, result: null }),
}));
