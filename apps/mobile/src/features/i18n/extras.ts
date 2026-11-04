import { SupportedLanguage } from "./languages";

/** Small UI strings that are not part of the main translation table. */
export interface ExtraStrings {
  stopListening: string;
  signOut: string;
  analyzing: string;
  identifying: string;
  tryAgain: string;
  photoNeeded: string;
  askAnswerPlaceholder: string;
  sendLabel: string;
  askAboutPlant: string;
  newCheck: string;
}

export const EXTRAS: Record<SupportedLanguage, ExtraStrings> = {
  en: {
    stopListening: "Stop listening",
    signOut: "Sign out",
    analyzing: "Zora is looking at your photo…",
    identifying: "Zora is identifying this plant…",
    tryAgain: "Try again",
    photoNeeded: "Take or choose a clear photo first.",
    askAnswerPlaceholder: "Or type here",
    sendLabel: "Send",
    askAboutPlant: "Ask Zora about this plant",
    newCheck: "Start a new check",
  },
  ha: {
    stopListening: "Dakatar da saurare",
    signOut: "Fita",
    analyzing: "Zora tana duba hotonka…",
    identifying: "Zora tana gano wannan tsiron…",
    tryAgain: "Sake gwadawa",
    photoNeeded: "Da farko ɗauki hoto mai haske ko zaɓi ɗaya.",
    askAnswerPlaceholder: "Ko rubuta a nan",
    sendLabel: "Aika",
    askAboutPlant: "Tambayi Zora game da wannan tsiron",
    newCheck: "Fara sabon bincike",
  },
  yo: {
    stopListening: "Dẹ́kun gbígbọ́",
    signOut: "Jáde",
    analyzing: "Zora ń wo fọ́tò rẹ…",
    identifying: "Zora ń dá ewéko yìí mọ̀…",
    tryAgain: "Tún gbìyànjú",
    photoNeeded: "Kọ́kọ́ yan tàbí yá fọ́tò tó hàn kedere.",
    askAnswerPlaceholder: "Tàbí kọ síbí",
    sendLabel: "Fi ránṣẹ́",
    askAboutPlant: "Béèrè lọ́wọ́ Zora nípa ewéko yìí",
    newCheck: "Bẹ̀rẹ̀ ìwádìí tuntun",
  },
  ig: {
    stopListening: "Kwụsị ige ntị",
    signOut: "Pụọ",
    analyzing: "Zora na-ele foto gị…",
    identifying: "Zora na-achọpụta osisi a…",
    tryAgain: "Nwaa ọzọ",
    photoNeeded: "buru ụzọ were ma ọ bụ họrọ foto doro anya.",
    askAnswerPlaceholder: "Ma ọ bụ dee ebe a",
    sendLabel: "Zipu",
    askAboutPlant: "Jụọ Zora gbasara osisi a",
    newCheck: "Malite nlele ọhụrụ",
  },
  pcm: {
    stopListening: "Stop to listen",
    signOut: "Sign out",
    analyzing: "Zora dey look your photo…",
    identifying: "Zora dey find out wetin be this plant…",
    tryAgain: "Try again",
    photoNeeded: "First take or pick one clear photo.",
    askAnswerPlaceholder: "Or type here",
    sendLabel: "Send",
    askAboutPlant: "Ask Zora about this plant",
    newCheck: "Start new check",
  },
};
