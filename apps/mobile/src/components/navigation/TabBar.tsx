import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MessageCircle, Sprout, Tractor, Languages } from "lucide-react-native";
import { router, usePathname } from "expo-router";

import { useVoiceStore } from "@/features/voice/voice-store";

export type TabKey = "ask" | "plants" | "farm" | "language";

export function TabBar() {
  const { t, colors } = useVoiceStore();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const tabs: { key: TabKey; label: string; href: string; Icon: typeof Sprout; active: boolean }[] = [
    {
      key: "ask",
      label: t.tabs.askZora,
      href: "/",
      Icon: MessageCircle,
      active: pathname === "/" || pathname === "/assistant" || pathname === "/live",
    },
    {
      key: "plants",
      label: t.tabs.plants,
      href: "/plants",
      Icon: Sprout,
      active: pathname.startsWith("/plant"),
    },
    { key: "farm", label: t.tabs.farm, href: "/farm", Icon: Tractor, active: pathname.startsWith("/farm") },
    {
      key: "language",
      label: t.tabs.language,
      href: "/language",
      Icon: Languages,
      active: pathname === "/language",
    },
  ];

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: colors.background,
          borderTopColor: colors.divider,
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}
    >
      {tabs.map(({ key, label, href, Icon, active }) => (
        <Pressable
          key={key}
          accessibilityRole="tab"
          accessibilityState={{ selected: active }}
          onPress={() => {
            if (!active) router.replace(href as never);
          }}
          style={styles.item}
        >
          <Icon size={24} color={active ? colors.accent : colors.textSecondary} strokeWidth={active ? 2.2 : 1.8} />
          <Text
            style={[
              styles.label,
              { color: active ? colors.accent : colors.textSecondary, fontWeight: active ? "700" : "500" },
            ]}
          >
            {label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
  },
  item: { flex: 1, alignItems: "center", gap: 4, paddingVertical: 4 },
  label: { fontSize: 14 },
});
