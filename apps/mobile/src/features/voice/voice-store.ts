import { create } from "zustand";
import * as Speech from "expo-speech";
import { SupportedLanguage, TRANSLATIONS, TranslationStrings, LANGUAGES } from "../i18n/languages";
import { lightTheme, darkTheme, ThemeColors } from "../../theme/colors";

interface VoiceStoreState {
  language: SupportedLanguage;
  t: TranslationStrings;
  themeMode: "light" | "dark";
  colors: ThemeColors;
  isSpeaking: boolean;
  isRecording: boolean;
  isProcessing: boolean;
  setLanguage: (lang: SupportedLanguage) => void;
  toggleTheme: () => void;
  speakText: (text: string, customLang?: SupportedLanguage) => Promise<void>;
  stopSpeaking: () => Promise<void>;
  startRecording: () => void;
  stopRecording: () => void;
}

export const useVoiceStore = create<VoiceStoreState>((set, get) => ({
  language: "en",
  t: TRANSLATIONS.en,
  themeMode: "light",
  colors: lightTheme,
  isSpeaking: false,
  isRecording: false,
  isProcessing: false,

  setLanguage: (lang: SupportedLanguage) => {
    set({
      language: lang,
      t: TRANSLATIONS[lang] ?? TRANSLATIONS.en,
    });
  },

  toggleTheme: () => {
    const nextMode = get().themeMode === "light" ? "dark" : "light";
    set({
      themeMode: nextMode,
      colors: nextMode === "light" ? lightTheme : darkTheme,
    });
  },

  speakText: async (text: string, customLang?: SupportedLanguage) => {
    try {
      const activeLang = customLang ?? get().language;
      const isCurrentlySpeaking = await Speech.isSpeakingAsync();
      if (isCurrentlySpeaking) {
        await Speech.stop();
      }

      set({ isSpeaking: true });

      // Language mappings for native voices
      const voiceLang =
        activeLang === "ha"
          ? "ha-NG"
          : activeLang === "yo"
            ? "yo-NG"
            : activeLang === "ig"
              ? "ig-NG"
              : activeLang === "pcm"
                ? "en-NG"
                : "en-US";

      Speech.speak(text, {
        language: voiceLang,
        pitch: 1.0,
        rate: 0.9,
        onDone: () => set({ isSpeaking: false }),
        onStopped: () => set({ isSpeaking: false }),
        onError: () => set({ isSpeaking: false }),
      });
    } catch {
      set({ isSpeaking: false });
    }
  },

  stopSpeaking: async () => {
    try {
      await Speech.stop();
    } finally {
      set({ isSpeaking: false });
    }
  },

  startRecording: () => {
    set({ isRecording: true, isProcessing: false });
  },

  stopRecording: () => {
    set({ isRecording: false, isProcessing: true });
    setTimeout(() => {
      set({ isProcessing: false });
    }, 1200);
  },
}));
