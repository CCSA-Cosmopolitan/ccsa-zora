import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AudioLines, Keyboard, Scan, Sprout, Volume2 } from "lucide-react-native";
import { router, useFocusEffect } from "expo-router";

import { useVoiceStore } from "@/features/voice/voice-store";
import { EXTRAS } from "@/features/i18n/extras";
import { ZoraHeader } from "@/components/navigation/ZoraHeader";
import { TabBar } from "@/components/navigation/TabBar";
import { FloatingVoicePill } from "@/components/voice/FloatingVoicePill";
import { ListRow, layout } from "@/components/ui";

export default function HomeScreen() {
  const { t, colors, language, isSpeaking, speakText, stopSpeaking } = useVoiceStore();
  const extra = EXTRAS[language];
  const [typed, setTyped] = useState("");

  useFocusEffect(React.useCallback(() => () => void stopSpeaking(), [stopSpeaking]));

  function hearIntro() {
    if (isSpeaking) void stopSpeaking();
    else void speakText(`${t.homeTitle}. ${t.homeSubtitle}`).catch(() => {});
  }

  function submit() {
    const text = typed.trim();
    if (text.length < 2) return;
    setTyped("");
    router.push({ pathname: "/assistant", params: { initialPrompt: text } });
  }

  return (
    <SafeAreaView style={[layout.safe, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      <ZoraHeader mode="home" />

      <ScrollView
        style={layout.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.eyebrow, { color: colors.textSecondary }]}>{t.yourFarmingCompanion}</Text>
        <Text style={[styles.heading, { color: colors.text }]}>{t.homeTitle}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t.homeSubtitle}</Text>

        <Pressable accessibilityRole="button" onPress={hearIntro} hitSlop={8} style={styles.hear}>
          <Volume2 size={22} color={colors.accent} />
          <Text style={[styles.hearText, { color: colors.accent }]}>
            {isSpeaking ? extra.stopListening : t.hearHowToUse}
          </Text>
        </Pressable>

        <View style={[styles.input, { borderColor: colors.cardBorder, backgroundColor: colors.inputBg }]}>
          <Keyboard size={20} color={colors.textMuted} />
          <TextInput
            value={typed}
            onChangeText={setTyped}
            placeholder={t.orTypeHere}
            placeholderTextColor={colors.textMuted}
            style={[styles.inputText, { color: colors.text }]}
            returnKeyType="send"
            onSubmitEditing={submit}
          />
        </View>

        <View style={styles.list}>
          <ListRow
            Icon={Scan}
            title={t.identifyPlant}
            subtitle={t.identifyPlantSub}
            onPress={() => router.push("/plants")}
          />
          <ListRow
            Icon={Sprout}
            title={t.checkFarmProblem}
            subtitle={t.checkFarmProblemSub}
            onPress={() => router.push("/farm")}
          />
          <ListRow
            Icon={AudioLines}
            title={t.zoraLive}
            subtitle={t.zoraLiveSub}
            onPress={() => router.push("/assistant")}
            last
          />
        </View>
      </ScrollView>

      <FloatingVoicePill />
      <TabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 22, paddingTop: 16, paddingBottom: 16 },
  eyebrow: { fontSize: 17, marginBottom: 8 },
  heading: { fontSize: 36, fontWeight: "700", letterSpacing: -0.8, lineHeight: 42, marginBottom: 14 },
  subtitle: { fontSize: 17, lineHeight: 25, marginBottom: 14 },
  hear: { flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "flex-start", marginBottom: 22 },
  hearText: { fontSize: 17, fontWeight: "700" },
  input: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 12,
  },
  inputText: { flex: 1, fontSize: 17, padding: 0 },
  list: {},
});
