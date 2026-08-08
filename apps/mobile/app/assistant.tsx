import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import * as Speech from "expo-speech";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
import { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { createZoraClient } from "@ccsa-zora/api-client";
import type { ZoraAdvisoryResult, ZoraLanguage } from "@ccsa-zora/utils/api";

import { getMobileAccessToken } from "@/auth/supabase";
import { listLocalFields } from "@/features/field-scouting/data/scouting.repository";

const api = createZoraClient({
  baseUrl: process.env.EXPO_PUBLIC_API_URL ?? "http://127.0.0.1:3000",
  getAccessToken: getMobileAccessToken,
});

const organizationId =
  process.env.EXPO_PUBLIC_ZORA_ORGANIZATION_ID ?? "00000000-0000-4000-8000-000000000001";

const defaultLanguage: { id: ZoraLanguage; label: string; locale: string } = {
  id: "en",
  label: "English",
  locale: "en-NG",
};

const languages: { id: ZoraLanguage; label: string; locale: string }[] = [
  defaultLanguage,
  { id: "ha", label: "Hausa", locale: "ha-NG" },
  { id: "yo", label: "Yorùbá", locale: "yo-NG" },
  { id: "ig", label: "Igbo", locale: "ig-NG" },
  { id: "ff", label: "Fulfulde", locale: "ff-NG" },
];

interface ConversationItem {
  id: string;
  role: "farmer" | "zora";
  text: string;
  result?: ZoraAdvisoryResult;
}

export default function ZoraAssistantScreen() {
  const db = useSQLiteContext();
  const fieldsQuery = useQuery({
    queryKey: ["scouting", "fields"],
    queryFn: () => listLocalFields(db),
  });
  const fields = fieldsQuery.data ?? [];
  const [language, setLanguage] = useState<ZoraLanguage>("en");
  const [prompt, setPrompt] = useState("");
  const [voiceUri, setVoiceUri] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConversationItem[]>([
    { id: "welcome", role: "zora", text: "Sannu. I am Zora. Tell me what you see in your field." },
  ]);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 250);
  const activeLanguage = useMemo(
    () => languages.find((item) => item.id === language) ?? defaultLanguage,
    [language],
  );

  const advisory = useMutation({
    mutationFn: (message: string) =>
      api.advisory({
        organizationId,
        fieldId: fields[0]?.id ?? null,
        language,
        message,
        channel: voiceUri ? "voice" : "mobile",
        context: {
          connectivity: "offline-first",
          voiceCaptured: Boolean(voiceUri),
        },
      }),
  });

  async function toggleRecording() {
    try {
      if (recorderState.isRecording) {
        await recorder.stop();
        setVoiceUri(recorder.uri);
        return;
      }
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Microphone unavailable", "Microphone access is required for voice questions.");
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setVoiceUri(null);
    } catch (error) {
      Alert.alert(
        "Voice capture failed",
        error instanceof Error ? error.message : "Please try again.",
      );
    }
  }

  async function askZora() {
    const message = prompt.trim();
    if (message.length < 2) {
      Alert.alert(
        "Add a question",
        voiceUri
          ? "Voice capture is ready. Add a short text summary while production transcription is being configured."
          : "Describe the crop, livestock, or field issue.",
      );
      return;
    }
    setMessages((current) => [
      ...current,
      { id: `${Date.now()}-farmer`, role: "farmer", text: message },
    ]);
    setPrompt("");
    try {
      const result = await advisory.mutateAsync(message);
      setMessages((current) => [
        ...current,
        { id: result.advisoryId, role: "zora", text: result.answer, result },
      ]);
      Speech.speak(result.answer, { language: activeLanguage.locale, rate: 0.92 });
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-error`,
          role: "zora",
          text:
            error instanceof Error
              ? `I could not reach the intelligence service: ${error.message}`
              : "I could not reach the intelligence service.",
        },
      ]);
    }
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Image source={require("../assets/brand/zora-square.jpeg")} style={styles.logo} />
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>ZORA SUPER INTELLIGENCE</Text>
            <Text style={styles.title}>Speak naturally. Farm confidently.</Text>
            <Text style={styles.subtitle}>
              Voice-first, multilingual guidance grounded in field context and KGML-Ag.
            </Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.languages}>
          {languages.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => setLanguage(item.id)}
              style={[styles.languageChip, language === item.id && styles.languageChipActive]}
            >
              <Text
                style={[styles.languageText, language === item.id && styles.languageTextActive]}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.conversation}>
          {messages.map((message) => (
            <View
              key={message.id}
              style={[styles.message, message.role === "farmer" && styles.farmerMessage]}
            >
              <Text
                style={[styles.messageLabel, message.role === "farmer" && styles.farmerMessageText]}
              >
                {message.role === "zora" ? "ZORA" : "YOU"}
              </Text>
              <Text
                style={[styles.messageText, message.role === "farmer" && styles.farmerMessageText]}
              >
                {message.text}
              </Text>
              {message.result ? (
                <View style={styles.advisoryDetails}>
                  <Text style={styles.confidence}>
                    {Math.round(message.result.confidence * 100)}% confidence ·{" "}
                    {message.result.severity} priority
                  </Text>
                  {message.result.actions.map((action) => (
                    <Text key={action} style={styles.action}>
                      • {action}
                    </Text>
                  ))}
                  <Pressable
                    onPress={() =>
                      Speech.speak(message.text, { language: activeLanguage.locale, rate: 0.92 })
                    }
                  >
                    <Text style={styles.listen}>Listen again</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          ))}
          {advisory.isPending ? (
            <Text style={styles.reasoning}>Zora is connecting field evidence and knowledge…</Text>
          ) : null}
        </View>

        <View style={styles.composer}>
          <TextInput
            multiline
            onChangeText={setPrompt}
            placeholder="Ask about a crop, animal, weather risk, or field operation…"
            placeholderTextColor="#7b8b82"
            style={styles.input}
            textAlignVertical="top"
            value={prompt}
          />
          <View style={styles.composerActions}>
            <Pressable
              onPress={toggleRecording}
              style={[styles.micButton, recorderState.isRecording && styles.micButtonActive]}
            >
              <Text style={styles.micText}>{recorderState.isRecording ? "■ Stop" : "● Voice"}</Text>
            </Pressable>
            <Text style={styles.voiceStatus}>
              {voiceUri
                ? "Voice note ready"
                : recorderState.isRecording
                  ? `${Math.round(recorderState.durationMillis / 1000)} sec`
                  : ""}
            </Text>
            <Pressable disabled={advisory.isPending} onPress={askZora} style={styles.sendButton}>
              <Text style={styles.sendText}>Ask Zora</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.disclaimer}>
          Reference guidance must be confirmed with field evidence and locally approved extension or
          veterinary protocols.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f3f7f2" },
  content: { padding: 16, paddingBottom: 34 },
  hero: {
    flexDirection: "row",
    gap: 14,
    borderRadius: 18,
    padding: 16,
    backgroundColor: "#063d2a",
  },
  logo: { width: 70, height: 70, borderRadius: 14 },
  heroCopy: { flex: 1 },
  eyebrow: { color: "#edaf1d", fontSize: 9, fontWeight: "900", letterSpacing: 1.3 },
  title: { color: "#ffffff", fontSize: 21, fontWeight: "800", lineHeight: 25, marginTop: 4 },
  subtitle: { color: "#b9d3c5", fontSize: 11, lineHeight: 16, marginTop: 5 },
  languages: { marginTop: 14, marginBottom: 12 },
  languageChip: {
    borderWidth: 1,
    borderColor: "#c7d6cb",
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: "#ffffff",
  },
  languageChipActive: { borderColor: "#e5aa20", backgroundColor: "#e5aa20" },
  languageText: { color: "#52675c", fontSize: 11, fontWeight: "700" },
  languageTextActive: { color: "#063d2a" },
  conversation: { gap: 9 },
  message: {
    alignSelf: "flex-start",
    maxWidth: "92%",
    borderRadius: 16,
    borderBottomLeftRadius: 5,
    padding: 13,
    backgroundColor: "#e5efe7",
  },
  farmerMessage: {
    alignSelf: "flex-end",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 5,
    backgroundColor: "#063d2a",
  },
  messageLabel: { color: "#0b7042", fontSize: 8, fontWeight: "900", letterSpacing: 1.2 },
  messageText: { color: "#17382b", fontSize: 13, lineHeight: 19, marginTop: 4 },
  farmerMessageText: { color: "#ffffff" },
  advisoryDetails: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#b8cbbd",
    marginTop: 10,
    paddingTop: 8,
  },
  confidence: { color: "#607168", fontSize: 9, fontWeight: "800", textTransform: "uppercase" },
  action: { color: "#315444", fontSize: 11, lineHeight: 17, marginTop: 4 },
  listen: { color: "#087246", fontSize: 11, fontWeight: "800", marginTop: 8 },
  reasoning: { color: "#607168", fontSize: 11, fontStyle: "italic", padding: 8 },
  composer: {
    borderWidth: 1,
    borderColor: "#c7d6cb",
    borderRadius: 16,
    marginTop: 14,
    padding: 10,
    backgroundColor: "#ffffff",
  },
  input: { minHeight: 88, color: "#123126", fontSize: 13, lineHeight: 19 },
  composerActions: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  micButton: {
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 9,
    backgroundColor: "#e5efe7",
  },
  micButtonActive: { backgroundColor: "#a13d31" },
  micText: { color: "#0a6840", fontSize: 11, fontWeight: "800" },
  voiceStatus: { flex: 1, color: "#607168", fontSize: 9, marginLeft: 8 },
  sendButton: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#e5aa20",
  },
  sendText: { color: "#063d2a", fontSize: 11, fontWeight: "900" },
  disclaimer: { color: "#738078", fontSize: 9, lineHeight: 14, marginTop: 12, textAlign: "center" },
});
