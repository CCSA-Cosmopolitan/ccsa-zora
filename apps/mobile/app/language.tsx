import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Volume2, CheckCircle2, Circle } from "lucide-react-native";

import { useVoiceStore } from "@/features/voice/voice-store";
import { LANGUAGES, SupportedLanguage } from "@/features/i18n/languages";
import { ZoraHeader } from "@/components/navigation/ZoraHeader";
import { TabBar } from "@/components/navigation/TabBar";
import { FloatingVoicePill } from "@/components/voice/FloatingVoicePill";

export default function LanguageScreen() {
  const { language, setLanguage, t, colors, isSpeaking, speakText, stopSpeaking } =
    useVoiceStore();

  function handleHearSample(sample: string, lang: SupportedLanguage) {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speakText(sample, lang);
    }
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={["top", "left", "right"]}
    >
      <ZoraHeader mode="back" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.text }]}>
          {t.languagePage.title}
        </Text>

        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {t.languagePage.subtitle}
        </Text>

        <View style={styles.list}>
          {LANGUAGES.map((item) => {
            const isSelected = language === item.code;
            return (
              <View
                key={item.code}
                style={[
                  styles.languageRow,
                  { borderBottomColor: colors.divider },
                ]}
              >
                <Pressable
                  onPress={() => setLanguage(item.code)}
                  style={styles.languageInfo}
                >
                  {isSelected ? (
                    <CheckCircle2 size={24} color={colors.accent} />
                  ) : (
                    <Circle size={24} color={colors.textMuted} />
                  )}

                  <View style={styles.textColumn}>
                    <Text
                      style={[
                        styles.languageName,
                        {
                          color: colors.text,
                          fontWeight: isSelected ? "800" : "600",
                        },
                      ]}
                    >
                      {item.name}
                    </Text>
                    {isSelected ? (
                      <Text
                        style={[
                          styles.selectedTag,
                          { color: colors.accent },
                        ]}
                      >
                        {t.languagePage.selected}
                      </Text>
                    ) : null}
                  </View>
                </Pressable>

                <Pressable
                  onPress={() => handleHearSample(item.speechSample, item.code)}
                  style={styles.hearButton}
                >
                  <Volume2 size={20} color={colors.textSecondary} />
                  <Text
                    style={[styles.hearText, { color: colors.textSecondary }]}
                  >
                    {t.languagePage.hear}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>

        <Text style={[styles.disclaimer, { color: colors.textSecondary }]}>
          {t.languagePage.disclaimer}
        </Text>
      </ScrollView>

      {/* Floating Voice Button */}
      <FloatingVoicePill />

      {/* Bottom Tab Bar */}
      <TabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
    lineHeight: 38,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  list: {
    marginBottom: 24,
  },
  languageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  languageInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  textColumn: {
    gap: 2,
  },
  languageName: {
    fontSize: 19,
  },
  selectedTag: {
    fontSize: 13,
    fontWeight: "700",
  },
  hearButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  hearText: {
    fontSize: 15,
    fontWeight: "600",
  },
  disclaimer: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
});
