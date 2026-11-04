export interface ThemeColors {
  background: string;
  card: string;
  cardBorder: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentLight: string;
  accentDark: string;
  accentMuted: string;
  voicePillBg: string;
  voicePillText: string;
  inputBg: string;
  inputBorder: string;
  divider: string;
  warningBg: string;
  warningBorder: string;
  warningText: string;
  dangerBg: string;
  dangerText: string;
  callout: string;
}

// Sampled from zora-screenshots/mobile so the app matches the approved designs.
export const lightTheme: ThemeColors = {
  background: "#ffffff",
  card: "#ffffff",
  cardBorder: "#e2e2e2",
  text: "#191b1a",
  textSecondary: "#505050",
  textMuted: "#707070",
  accent: "#207050",
  accentLight: "#eaf3ee",
  accentDark: "#17573b",
  accentMuted: "#b9d8c3",
  voicePillBg: "#191b1a",
  voicePillText: "#ffffff",
  inputBg: "#ffffff",
  inputBorder: "#e2e2e2",
  divider: "#f0f0f0",
  warningBg: "#fef9ee",
  warningBorder: "#fde68a",
  warningText: "#854d0e",
  dangerBg: "#fef2f2",
  dangerText: "#991b1b",
  callout: "#f4f4f4",
};

export const darkTheme: ThemeColors = {
  background: "#191b1a",
  card: "#222423",
  cardBorder: "#3a3f3c",
  text: "#f8f8f0",
  textSecondary: "#b0b8b0",
  textMuted: "#8a938a",
  accent: "#a8d8b8",
  accentLight: "#22352a",
  accentDark: "#207050",
  accentMuted: "#2d5e3c",
  voicePillBg: "#f8f8f0",
  voicePillText: "#191b1a",
  inputBg: "#191b1a",
  inputBorder: "#3a3f3c",
  divider: "#283030",
  warningBg: "#2d2410",
  warningBorder: "#785816",
  warningText: "#fef08a",
  dangerBg: "#331414",
  dangerText: "#fca5a5",
  callout: "#242725",
};
