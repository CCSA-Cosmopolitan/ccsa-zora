import { create } from "zustand";
import { speakZora,stopAudio } from "@/services/assistant";
import * as SecureStore from "expo-secure-store";
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
    void SecureStore.setItemAsync("zora.language",lang);
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

  speakText: async (text,customLang) => {set({isSpeaking:true});try{await speakZora(text,customLang??get().language);}finally{set({isSpeaking:false});}},
  stopSpeaking: async () => {stopAudio();set({isSpeaking:false});},

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
