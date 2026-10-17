import React from "react";
import { View, Text, Pressable, StyleSheet, Animated } from "react-native";
import { Mic, Square } from "lucide-react-native";
import { useVoiceStore } from "../../features/voice/voice-store";
import { router, usePathname } from "expo-router";

interface FloatingVoicePillProps {
  onRecordComplete?: (transcript: string) => void;
}

export function FloatingVoicePill({ onRecordComplete }: FloatingVoicePillProps) {
  const { t, colors, isRecording, isProcessing, startRecording, stopRecording } =
    useVoiceStore();
  const pathname = usePathname();

  function handlePress() {
    if (isRecording) {
      stopRecording();
      if (onRecordComplete) {
        onRecordComplete("Ganyen masarata suna yin rawaya. Me zan yi?");
      } else if (pathname !== "/assistant") {
        router.push("/assistant");
      }
    } else {
      startRecording();
    }
  }

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Pressable
        onPress={handlePress}
        style={[
          styles.pill,
          {
            backgroundColor: isRecording ? "#991b1b" : colors.voicePillBg,
          },
        ]}
      >
        {isRecording ? (
          <Square size={20} color="#ffffff" fill="#ffffff" />
        ) : (
          <Mic size={20} color={colors.voicePillText} />
        )}
        <Text
          style={[
            styles.pillText,
            { color: isRecording ? "#ffffff" : colors.voicePillText },
          ]}
        >
          {isRecording
            ? t.stopRecording
            : isProcessing
              ? "Thinking..."
              : t.tapToSpeak}
        </Text>
      </Pressable>

      <Text
        style={[
          styles.subtext,
          {
            color: isRecording ? colors.accent : colors.textSecondary,
            fontWeight: isRecording ? "700" : "400",
          },
        ]}
      >
        {isRecording
          ? t.listeningSpeakNow
          : isProcessing
            ? "Analyzing voice..."
            : t.askInOwnWords}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 999,
    minWidth: 220,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  pillText: {
    fontSize: 16,
    fontWeight: "700",
  },
  subtext: {
    fontSize: 12,
    marginTop: 6,
    textAlign: "center",
  },
});
