import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, AppState, Pressable, StyleSheet, Text, View } from "react-native";
import { Mic, Square } from "lucide-react-native";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from "expo-audio";
import { router, useFocusEffect } from "expo-router";

import { useVoiceStore } from "@/features/voice/voice-store";
import { stopAudio, transcribe } from "@/services/assistant";

const MAX_RECORDING_MS = 60_000;

interface FloatingVoicePillProps {
  /** Receives the transcript. Without it, speech opens the assistant with the text. */
  onRecordComplete?: (text: string) => void;
  disabled?: boolean;
}

export function FloatingVoicePill({ onRecordComplete, disabled = false }: FloatingVoicePillProps) {
  const { t, colors, language } = useVoiceStore();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const [focused, setFocused] = useState(true);
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);

  const active = useRef(true);
  const isRecording = useRef(false);
  const lock = useRef(false);

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );

  useEffect(() => {
    active.current = focused;

    const cancel = () => {
      active.current = false;
      if (isRecording.current) {
        isRecording.current = false;
        void recorder.stop().catch(() => {});
      }
      setRecording(false);
      stopAudio();
    };

    if (!focused) cancel();

    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active") cancel();
      else active.current = focused;
    });

    return () => {
      sub.remove();
      cancel();
    };
  }, [focused, recorder]);

  async function finish() {
    if (lock.current) return;
    lock.current = true;
    setRecording(false);
    setBusy(true);
    try {
      isRecording.current = false;
      await recorder.stop();
      if (!active.current) return;
      if (!recorder.uri) throw new Error("Recording was not saved");
      const text = await transcribe(recorder.uri, language);
      if (!active.current) return;
      if (onRecordComplete) onRecordComplete(text);
      else router.push({ pathname: "/assistant", params: { initialPrompt: text } });
    } catch (e) {
      Alert.alert("Zora", e instanceof Error ? e.message : "Could not hear you");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!recording) return;
    const timer = setTimeout(() => void finish(), MAX_RECORDING_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recording]);

  async function press() {
    if (recording) {
      await finish();
      return;
    }
    if (disabled || busy || lock.current) return;
    lock.current = true;
    try {
      stopAudio();
      const permission = await requestRecordingPermissionsAsync();
      if (!active.current) return;
      if (!permission.granted) throw new Error("Please allow microphone access");
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      if (!active.current) return;
      recorder.record();
      isRecording.current = true;
      setRecording(true);
    } catch (e) {
      Alert.alert("Zora", e instanceof Error ? e.message : "Microphone unavailable");
    } finally {
      lock.current = false;
    }
  }

  const label = recording ? t.stopRecording : t.tapToSpeak;

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        disabled={busy || disabled}
        onPress={press}
        style={({ pressed }) => [
          styles.pill,
          { backgroundColor: colors.voicePillBg, opacity: disabled ? 0.5 : pressed ? 0.9 : 1 },
        ]}
      >
        {busy ? (
          <ActivityIndicator color={colors.voicePillText} />
        ) : recording ? (
          <Square size={18} color={colors.voicePillText} fill={colors.voicePillText} />
        ) : (
          <Mic size={22} color={colors.voicePillText} />
        )}
        <Text style={[styles.pillText, { color: colors.voicePillText }]}>{label}</Text>
      </Pressable>
      <Text
        style={[styles.caption, { color: recording ? colors.accent : colors.textSecondary }]}
        accessibilityLiveRegion="polite"
      >
        {recording ? t.listeningSpeakNow : t.askInOwnWords}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", paddingTop: 8, paddingBottom: 12 },
  pill: {
    minWidth: 235,
    height: 58,
    paddingHorizontal: 28,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  pillText: { fontSize: 19, fontWeight: "600" },
  caption: { marginTop: 8, fontSize: 15, fontWeight: "400" },
});
