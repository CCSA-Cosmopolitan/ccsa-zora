import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { MessageCircle, Sprout, Tractor, Languages } from "lucide-react-native";
import { router, usePathname } from "expo-router";
import { useVoiceStore } from "../../features/voice/voice-store";

export type TabKey = "ask" | "plants" | "farm" | "language";

export function TabBar() {
  const { t, colors } = useVoiceStore();
  const pathname = usePathname();

  const isAskActive = pathname === "/" || pathname === "/assistant" || pathname === "/live";
  const isPlantsActive = pathname.startsWith("/plants");
  const isFarmActive = pathname.startsWith("/farm");
  const isLanguageActive = pathname === "/language";

  return (
    <View style={[styles.tabBar, { backgroundColor: colors.background, borderTopColor: colors.cardBorder }]}>
      <Pressable onPress={() => router.push("/")} style={styles.tabItem}>
        <MessageCircle
          size={24}
          color={isAskActive ? colors.accent : colors.textMuted}
          strokeWidth={isAskActive ? 2.4 : 1.8}
        />
        <Text
          style={[
            styles.tabLabel,
            {
              color: isAskActive ? colors.accent : colors.textMuted,
              fontWeight: isAskActive ? "800" : "500",
            },
          ]}
        >
          {t.tabs.askZora}
        </Text>
        {isAskActive ? <View style={[styles.activeIndicator, { backgroundColor: colors.accent }]} /> : null}
      </Pressable>

      <Pressable onPress={() => router.push("/plants")} style={styles.tabItem}>
        <Sprout
          size={24}
          color={isPlantsActive ? colors.accent : colors.textMuted}
          strokeWidth={isPlantsActive ? 2.4 : 1.8}
        />
        <Text
          style={[
            styles.tabLabel,
            {
              color: isPlantsActive ? colors.accent : colors.textMuted,
              fontWeight: isPlantsActive ? "800" : "500",
            },
          ]}
        >
          {t.tabs.plants}
        </Text>
        {isPlantsActive ? <View style={[styles.activeIndicator, { backgroundColor: colors.accent }]} /> : null}
      </Pressable>

      <Pressable onPress={() => router.push("/farm")} style={styles.tabItem}>
        <Tractor
          size={24}
          color={isFarmActive ? colors.accent : colors.textMuted}
          strokeWidth={isFarmActive ? 2.4 : 1.8}
        />
        <Text
          style={[
            styles.tabLabel,
            {
              color: isFarmActive ? colors.accent : colors.textMuted,
              fontWeight: isFarmActive ? "800" : "500",
            },
          ]}
        >
          {t.tabs.farm}
        </Text>
        {isFarmActive ? <View style={[styles.activeIndicator, { backgroundColor: colors.accent }]} /> : null}
      </Pressable>

      <Pressable onPress={() => router.push("/language")} style={styles.tabItem}>
        <Languages
          size={24}
          color={isLanguageActive ? colors.accent : colors.textMuted}
          strokeWidth={isLanguageActive ? 2.4 : 1.8}
        />
        <Text
          style={[
            styles.tabLabel,
            {
              color: isLanguageActive ? colors.accent : colors.textMuted,
              fontWeight: isLanguageActive ? "800" : "500",
            },
          ]}
        >
          {t.tabs.language}
        </Text>
        {isLanguageActive ? <View style={[styles.activeIndicator, { backgroundColor: colors.accent }]} /> : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingBottom: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    position: "relative",
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  activeIndicator: {
    position: "absolute",
    bottom: -4,
    width: 24,
    height: 3,
    borderRadius: 2,
  },
});
