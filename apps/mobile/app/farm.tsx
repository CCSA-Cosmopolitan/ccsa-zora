import React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bug, Shovel, Tractor, Volume2 } from "lucide-react-native";
import { router, useFocusEffect } from "expo-router";

import { useVoiceStore } from "@/features/voice/voice-store";
import { EXTRAS } from "@/features/i18n/extras";
import { ZoraHeader } from "@/components/navigation/ZoraHeader";
import { TabBar } from "@/components/navigation/TabBar";
import { FloatingVoicePill } from "@/components/voice/FloatingVoicePill";
import { ListRow, OutlineButton, ScreenSubtitle, ScreenTitle, layout } from "@/components/ui";

export default function FarmScreen() {
  const { t, colors, language, speakText, stopSpeaking, isSpeaking } = useVoiceStore();
  const extra = EXTRAS[language];
  const f = t.farmPage;

  useFocusEffect(React.useCallback(() => () => void stopSpeaking(), [stopSpeaking]));

  function hearChoices() {
    if (isSpeaking) {
      void stopSpeaking();
      return;
    }
    const text = [f.title, f.subtitle, `${f.cropDisease}. ${f.cropDiseaseSub}`, `${f.farmArea}. ${f.farmAreaSub}`, `${f.soil}. ${f.soilSub}`].join(" ");
    void speakText(text).catch(() => {});
  }

  const go = (kind: "disease" | "area" | "soil") =>
    router.push({ pathname: "/farm-check" as never, params: { kind } });

  return (
    <SafeAreaView style={[layout.safe, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      <ZoraHeader mode="back" />
      <ScrollView style={layout.flex} contentContainerStyle={layout.content} showsVerticalScrollIndicator={false}>
        <ScreenTitle>{f.title}</ScreenTitle>
        <ScreenSubtitle>{f.subtitle}</ScreenSubtitle>

        <View>
          <ListRow Icon={Bug} title={f.cropDisease} subtitle={f.cropDiseaseSub} onPress={() => go("disease")} />
          <ListRow Icon={Tractor} title={f.farmArea} subtitle={f.farmAreaSub} onPress={() => go("area")} />
          <ListRow Icon={Shovel} title={f.soil} subtitle={f.soilSub} onPress={() => go("soil")} last />
        </View>

        <OutlineButton
          Icon={Volume2}
          label={isSpeaking ? extra.stopListening : f.hearChoices}
          onPress={hearChoices}
          style={{ marginTop: 24 }}
        />
      </ScrollView>
      <FloatingVoicePill />
      <TabBar />
    </SafeAreaView>
  );
}
