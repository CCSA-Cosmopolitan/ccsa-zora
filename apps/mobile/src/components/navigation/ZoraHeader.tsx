import React from "react";
import { View, Text, Pressable, StyleSheet, Image } from "react-native";
import { ArrowLeft, Languages, Moon, Sun } from "lucide-react-native";
import { router } from "expo-router";
import { useVoiceStore } from "../../features/voice/voice-store";
import { LANGUAGES } from "../../features/i18n/languages";

interface ZoraHeaderProps {
  mode?: "home" | "back";
  title?: string;
  onBack?: () => void;
}

export function ZoraHeader({ mode = "home", title, onBack }: ZoraHeaderProps) {
  const { language, t, colors, themeMode, toggleTheme } = useVoiceStore();
  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[4]!;

  function handleBack() {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/");
    }
  }

  return (
    <View style={[styles.header, { backgroundColor: colors.background }]}>
      {mode === "back" ? (
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={22} color={colors.text} />
          <Text style={[styles.backText, { color: colors.text }]}>{t.back}</Text>
        </Pressable>
      ) : (
        <View style={styles.brandRow}>
          <Image
            source={require("../../../assets/brand/zora-square.jpeg")}
            style={styles.logo}
          />
        </View>
      )}

      {title ? (
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
      ) : null}

      <View style={styles.actionsRow}>
        <Pressable onPress={toggleTheme} style={[styles.iconButton, { borderColor: colors.cardBorder }]}>
          {themeMode === "light" ? (
            <Moon size={16} color={colors.textSecondary} />
          ) : (
            <Sun size={16} color={colors.textSecondary} />
          )}
        </Pressable>

        {mode === "home" ? (
          <Pressable
            onPress={() => router.push("/language")}
            style={[styles.langPill, { borderColor: colors.cardBorder }]}
          >
            <Languages size={16} color={colors.textSecondary} />
            <Text style={[styles.langText, { color: colors.text }]}>
              {currentLang.nativeName}
            </Text>
          </Pressable>
        ) : (
          <Image
            source={require("../../../assets/brand/zora-square.jpeg")}
            style={styles.logoSmall}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 10,
    resizeMode: "contain",
  },
  logoSmall: {
    width: 36,
    height: 36,
    borderRadius: 8,
    resizeMode: "contain",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  backText: {
    fontSize: 16,
    fontWeight: "600",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  langPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  langText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
