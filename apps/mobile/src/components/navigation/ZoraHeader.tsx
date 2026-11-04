import React from "react";
import { View, Text, Pressable, StyleSheet, Image } from "react-native";
import { ArrowLeft, Languages } from "lucide-react-native";
import { router } from "expo-router";

import { useVoiceStore } from "@/features/voice/voice-store";
import { LANGUAGES } from "@/features/i18n/languages";

interface ZoraHeaderProps {
  mode?: "home" | "back";
  onBack?: () => void;
}

const logo = require("../../../assets/brand/zora-square.jpeg");
export function ZoraHeader({ mode = "home", onBack }: ZoraHeaderProps) {
  const { language, t, colors } = useVoiceStore();
  const currentLang = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[4]!;

  function handleBack() {
    if (onBack) onBack();
    else if (router.canGoBack()) router.back();
    else router.replace("/");
  }

  if (mode === "back") {
    return (
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t.back}
          onPress={handleBack}
          hitSlop={12}
          style={styles.backButton}
        >
          <ArrowLeft size={22} color={colors.text} />
          <Text style={[styles.backText, { color: colors.text }]}>{t.back}</Text>
        </Pressable>
        <Image source={logo} style={styles.logo} />
      </View>
    );
  }

  return (
    <View style={[styles.header, { backgroundColor: colors.background }]}>
      <Image source={logo} style={styles.logo} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t.tabs.language}
        onPress={() => router.push("/language")}
        hitSlop={12}
        style={styles.language}
      >
        <Languages size={22} color={colors.text} />
        <Text style={[styles.languageText, { color: colors.text }]}>{currentLang.nativeName}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
  },
  logo: {
    width: 60,
    height: 56,
    borderRadius: 6,
    backgroundColor: "#ffffff",
    padding: 2,
    resizeMode: "contain",
  },
  backButton: { flexDirection: "row", alignItems: "center", gap: 8 },
  backText: { fontSize: 17, fontWeight: "500" },
  language: { flexDirection: "row", alignItems: "center", gap: 8 },
  languageText: { fontSize: 17, fontWeight: "500" },
});
