import { create } from "zustand";

interface ScoutingState {
  selectedFieldId: string | null;
  activeDraftId: string | null;
  selectField: (fieldId: string) => void;
  setActiveDraft: (draftId: string | null) => void;
}

export const useScoutingStore = create<ScoutingState>((set) => ({
  selectedFieldId: null,
  activeDraftId: null,
  selectField: (selectedFieldId) => set({ selectedFieldId }),
  setActiveDraft: (activeDraftId) => set({ activeDraftId }),
}));
