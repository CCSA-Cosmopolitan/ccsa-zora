import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { ChevronRight, type LucideIcon } from "lucide-react-native";

import { useVoiceStore } from "@/features/voice/voice-store";

export function ListRow({
  Icon,
  title,
  subtitle,
  onPress,
  last,
  trailing,
}: {
  Icon?: LucideIcon;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  last?: boolean;
  trailing?: React.ReactNode;
}) {
  const { colors } = useVoiceStore();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: colors.divider, borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth },
        pressed && { opacity: 0.6 },
      ]}
    >
      {Icon ? (
        <View style={styles.rowIcon}>
          <Icon size={26} color={colors.text} strokeWidth={1.7} />
        </View>
      ) : null}
      <View style={styles.rowText}>
        <Text style={[styles.rowTitle, { color: colors.text }]}>{title}</Text>
        {subtitle ? <Text style={[styles.rowSub, { color: colors.textSecondary }]}>{subtitle}</Text> : null}
      </View>
      {trailing ?? <ChevronRight size={22} color={colors.textMuted} />}
    </Pressable>
  );
}

export function OutlineButton({
  Icon,
  label,
  onPress,
  disabled,
  style,
}: {
  Icon?: LucideIcon;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useVoiceStore();
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { borderColor: colors.cardBorder, backgroundColor: colors.background, opacity: disabled ? 0.5 : pressed ? 0.7 : 1 },
        style,
      ]}
    >
      {Icon ? <Icon size={20} color={colors.text} /> : null}
      <Text style={[styles.buttonText, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

export function SolidButton({
  Icon,
  label,
  onPress,
  disabled,
  loading,
  style,
}: {
  Icon?: LucideIcon;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useVoiceStore();
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          borderColor: colors.voicePillBg,
          backgroundColor: colors.voicePillBg,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.voicePillText} />
      ) : Icon ? (
        <Icon size={20} color={colors.voicePillText} />
      ) : null}
      <Text style={[styles.buttonText, { color: colors.voicePillText }]}>{label}</Text>
    </Pressable>
  );
}

export function Callout({ Icon, children }: { Icon?: LucideIcon; children: string }) {
  const { colors } = useVoiceStore();
  return (
    <View style={[styles.callout, { backgroundColor: colors.callout }]}>
      {Icon ? <Icon size={22} color={colors.text} /> : null}
      <Text style={[styles.calloutText, { color: colors.text }]}>{children}</Text>
    </View>
  );
}

export function ScreenTitle({ children }: { children: string }) {
  const { colors } = useVoiceStore();
  return <Text style={[styles.title, { color: colors.text }]}>{children}</Text>;
}

export function ScreenSubtitle({ children }: { children: string }) {
  const { colors } = useVoiceStore();
  return <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{children}</Text>;
}

export const layout = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  content: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 24 },
});

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 20, gap: 16 },
  rowIcon: { width: 32, alignItems: "center" },
  rowText: { flex: 1, gap: 3 },
  rowTitle: { fontSize: 19, fontWeight: "600" },
  rowSub: { fontSize: 16, lineHeight: 22 },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 20,
  },
  buttonText: { fontSize: 17, fontWeight: "600" },
  callout: { flexDirection: "row", gap: 14, padding: 18, borderRadius: 14, alignItems: "flex-start" },
  calloutText: { flex: 1, fontSize: 16, lineHeight: 23 },
  title: { fontSize: 32, fontWeight: "700", letterSpacing: -0.6, lineHeight: 38, marginBottom: 10 },
  subtitle: { fontSize: 17, lineHeight: 25, marginBottom: 20 },
});
