export const CSA_PILLARS = [
  {
    id: "productivity",
    label: "Productivity",
    description: "Increase yields and farmer income without degrading natural resources.",
  },
  {
    id: "adaptation",
    label: "Adaptation",
    description: "Reduce climate exposure and strengthen long-term farm resilience.",
  },
  {
    id: "mitigation",
    label: "Mitigation",
    description: "Reduce or remove greenhouse-gas emissions per unit of production.",
  },
] as const;

export type CsaPillar = (typeof CSA_PILLARS)[number]["id"];
