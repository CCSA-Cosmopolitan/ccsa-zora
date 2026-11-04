import { ScrollView } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { useVoiceStore } from "@/features/voice/voice-store";
import { ZoraHeader } from "@/components/navigation/ZoraHeader";
import { SolidButton, ScreenSubtitle, ScreenTitle, layout } from "@/components/ui";

export default function AccessScreen() {
  const colors = useVoiceStore((s) => s.colors);
  return (
    <SafeAreaView style={[layout.safe, { backgroundColor: colors.background }]} edges={["top", "left", "right", "bottom"]}>
      <ZoraHeader mode="back" />
      <ScrollView contentContainerStyle={layout.content}>
        <ScreenTitle>Free access through CCSA</ScreenTitle>
        <ScreenSubtitle>
          When your FIMS administrator enables Zora, you can ask questions without subscription charges or a daily question quota.
        </ScreenSubtitle>
        <SolidButton label="Ask Zora" onPress={() => router.replace("/assistant")} />
      </ScrollView>
    </SafeAreaView>
  );
}
