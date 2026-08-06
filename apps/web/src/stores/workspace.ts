import { create } from "zustand";

type TimeWindow = "7d" | "30d" | "season";

interface WorkspaceState {
  selectedFieldId: string;
  timeWindow: TimeWindow;
  setSelectedFieldId: (fieldId: string) => void;
  setTimeWindow: (timeWindow: TimeWindow) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  selectedFieldId: "00000000-0000-4000-8000-000000000101",
  timeWindow: "30d",
  setSelectedFieldId: (selectedFieldId) => set({ selectedFieldId }),
  setTimeWindow: (timeWindow) => set({ timeWindow }),
}));
