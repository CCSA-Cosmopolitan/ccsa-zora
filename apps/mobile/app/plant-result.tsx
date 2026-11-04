import React, { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronDown, ChevronUp, MessageCircle, ShieldAlert, Volume2 } from "lucide-react-native";
import { router, useFocusEffect } from "expo-router";

import { useVoiceStore } from "@/features/voice/voice-store";
import { EXTRAS } from "@/features/i18n/extras";
import { usePlantSession } from "@/features/plants/plant-session";
import { ZoraHeader } from "@/components/navigation/ZoraHeader";
import { TabBar } from "@/components/navigation/TabBar";
import { FloatingVoicePill } from "@/components/voice/FloatingVoicePill";
import { Callout, OutlineButton, layout } from "@/components/ui";

type SectionKey = "healthNutrition" | "edibility" | "toxicitySafety" | "origin" | "growingCare";
const SECTIONS: SectionKey[] = ["healthNutrition", "edibility", "toxicitySafety", "origin", "growingCare"];

export default function PlantResultScreen() {
  const { t, colors, language, speakText, stopSpeaking, isSpeaking } = useVoiceStore();
  const extra = EXTRAS[language];
  const { photoUri, result } = usePlantSession();
  const [open, setOpen] = useState<SectionKey | null>("healthNutrition");

  useFocusEffect(
    React.useCallback(() => () => void stopSpeaking(), [stopSpeaking]),
  );

  if (!result) {
    return (
      <SafeAreaView style={[layout.safe, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
        <ZoraHeader mode="back" />
        <View style={styles.empty}>
          <OutlineButton label={t.plantsPage.title} onPress={() => router.replace("/plants")} />
        </View>
        <TabBar />
      </SafeAreaView>
    );
  }

  function listen() {
    if (isSpeaking) void stopSpeaking();
    else void speakText(result!.spoken).catch(() => {});
  }

  function askAbout() {
    const name = result!.commonName || result!.scientificName;
    router.push({
      pathname: "/assistant",
      params: { initialPrompt: `${name} (${result!.scientificName})` },
    });
  }

  const labels: Record<SectionKey, string> = {
    healthNutrition: t.plantsPage.healthNutrition,
    edibility: t.plantsPage.edibility,
    toxicitySafety: t.plantsPage.toxicitySafety,
    origin: t.plantsPage.origin,
    growingCare: t.plantsPage.growingCare,
  };

  return (
    <SafeAreaView style={[layout.safe, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      <ZoraHeader mode="back" onBack={() => router.replace("/plants")} />
      <ScrollView style={layout.flex} contentContainerStyle={layout.content} showsVerticalScrollIndicator={false}>
        {photoUri ? <Image source={{ uri: photoUri }} style={styles.hero} /> : null}

        {result.identified ? (
          <>
            <Text style={[styles.match, { color: colors.accent }]}>{t.plantsPage.possibleMatch}</Text>
            <Text style={[styles.name, { color: colors.text }]}>{result.commonName}</Text>
            <Text style={[styles.scientific, { color: colors.textSecondary }]}>{result.scientificName}</Text>
          </>
        ) : null}

        <OutlineButton
          Icon={Volume2}
          label={isSpeaking ? extra.stopListening : result.identified ? t.plantsPage.listenInfo : t.chat.listenResponse}
          onPress={listen}
          style={styles.listen}
        />

        {result.identified ? (
          <>
            <Callout Icon={ShieldAlert}>{t.plantsPage.safetyWarning}</Callout>

            <View style={styles.accordion}>
              {SECTIONS.map((key) => {
                const expanded = open === key;
                const Chevron = expanded ? ChevronUp : ChevronDown;
                return (
                  <Pressable
                    key={key}
                    accessibilityRole="button"
                    accessibilityState={{ expanded }}
                    onPress={() => setOpen(expanded ? null : key)}
                    style={[styles.section, { borderBottomColor: colors.divider }]}
                  >
                    <View style={styles.sectionHead}>
                      <Text style={[styles.sectionTitle, { color: colors.text }]}>{labels[key]}</Text>
                      <Chevron size={22} color={colors.textMuted} />
                    </View>
                    <Text
                      numberOfLines={expanded ? undefined : 1}
                      style={[styles.sectionBody, { color: colors.textSecondary }]}
                    >
                      {result[key]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <OutlineButton Icon={MessageCircle} label={extra.askAboutPlant} onPress={askAbout} style={styles.ask} />
          </>
        ) : (
          <Text style={[styles.sectionBody, { color: colors.textSecondary, marginTop: 8 }]}>{result.spoken}</Text>
        )}
      </ScrollView>
      <FloatingVoicePill />
      <TabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, justifyContent: "center", paddingHorizontal: 22 },
  hero: { width: "100%", aspectRatio: 16 / 10, borderRadius: 20, marginBottom: 20, backgroundColor: "#ddd" },
  match: { fontSize: 15, fontWeight: "700", marginBottom: 6 },
  name: { fontSize: 36, fontWeight: "700", letterSpacing: -0.8 },
  scientific: { fontSize: 18, fontStyle: "italic", marginTop: 2, marginBottom: 18 },
  listen: { marginBottom: 16 },
  accordion: { marginTop: 12 },
  section: { paddingVertical: 18, borderBottomWidth: StyleSheet.hairlineWidth, gap: 6 },
  sectionHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { fontSize: 18, fontWeight: "700" },
  sectionBody: { fontSize: 16, lineHeight: 23 },
  ask: { marginTop: 20 },
});
