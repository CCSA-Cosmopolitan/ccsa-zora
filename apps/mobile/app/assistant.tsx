import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
import { useMemo, useRef, useState } from "react";
import {
  Alert,
  Image,
  Modal,
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
import { useSubscriptionStore } from "@/features/subscription/subscription-store";

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
  photoUri?: string;
  result?: ZoraAdvisoryResult;
}

export default function ZoraAssistantScreen() {
  const db = useSQLiteContext();
  const { currentTier, canAskQuery, queriesRemaining, recordQuery } = useSubscriptionStore();
  const fieldsQuery = useQuery({
    queryKey: ["scouting", "fields"],
    queryFn: () => listLocalFields(db),
  });
  const fields = fieldsQuery.data ?? [];
  const [language, setLanguage] = useState<ZoraLanguage>("en");
  const [prompt, setPrompt] = useState("");
  const [voiceUri, setVoiceUri] = useState<string | null>(null);
  const [attachedPhotoUri, setAttachedPhotoUri] = useState<string | null>(null);
  const [cameraModalVisible, setCameraModalVisible] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const [messages, setMessages] = useState<ConversationItem[]>([
    {
      id: "welcome",
      role: "zora",
      text: "Sannu / E kaaro / Nno. I am Zora. Speak or type what you see in your field, or snap a photo of a pest or leaf.",
    },
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
          hasPhotoEvidence: Boolean(attachedPhotoUri),
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

  async function openCameraForDiagnosis() {
    const permission = cameraPermission?.granted
      ? cameraPermission
      : await requestCameraPermission();
    if (!permission.granted) {
      Alert.alert("Camera unavailable", "Camera permission is needed to diagnose leaf pests.");
      return;
    }
    setCameraModalVisible(true);
  }

  async function takeDiagnosisPhoto() {
    try {
      const picture = await cameraRef.current?.takePictureAsync({ quality: 0.6, exif: false });
      if (picture?.uri) {
        setAttachedPhotoUri(picture.uri);
        setCameraModalVisible(false);
      }
    } catch (err) {
      Alert.alert("Capture failed", "Could not take photo. Please try again.");
    }
  }

  async function askZora() {
    // 1. Freemium Quota Verification
    if (!canAskQuery()) {
      Alert.alert(
        "Weekly Quota Limit Reached 🌾",
        "You have used your 3 free voice questions for this week. Upgrade to Zora Pro Farmer for only ₦750/month to get unlimited agronomic advice, instant camera pest diagnosis, and severe weather SMS alerts.",
        [
          { text: "Later", style: "cancel" },
          { text: "Upgrade to Pro (₦750)", onPress: () => router.push("/subscribe") },
        ],
      );
      return;
    }

    const message = prompt.trim();
    if (message.length < 2 && !attachedPhotoUri) {
      Alert.alert(
        "Add a question or photo",
        voiceUri
          ? "Voice note captured. Please enter a brief title or question."
          : "Describe what is happening on your farm, or snap a photo of the affected crop.",
      );
      return;
    }

    const outgoingMessage = message || "Please diagnose this crop leaf issue.";
    const currentPhoto = attachedPhotoUri;

    setMessages((current) => [
      ...current,
      {
        id: `${Date.now()}-farmer`,
        role: "farmer",
        text: outgoingMessage,
        photoUri: currentPhoto ?? undefined,
      },
    ]);
    setPrompt("");
    setAttachedPhotoUri(null);

    // Record question in user quota
    recordQuery();

    try {
      const queryPayload = currentPhoto
        ? `${outgoingMessage} (Photo attached: plant leaf examination)`
        : outgoingMessage;

      const result = await advisory.mutateAsync(queryPayload);
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
        {/* Hero Section */}
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

        {/* Freemium Quota Indicator Banner */}
        <View style={styles.quotaBanner}>
          <View style={styles.quotaLeft}>
            <Text style={styles.quotaBadge}>
              {currentTier === "FREE" ? "FREE PLAN" : "ZORA PRO"}
            </Text>
            <Text style={styles.quotaText}>
              {currentTier === "FREE"
                ? `${queriesRemaining()} of 3 free questions left this week`
                : "Unlimited AI agronomy questions active"}
            </Text>
          </View>
          {currentTier === "FREE" ? (
            <Pressable onPress={() => router.push("/subscribe")} style={styles.upgradeSmallBtn}>
              <Text style={styles.upgradeSmallText}>Upgrade (₦750)</Text>
            </Pressable>
          ) : null}
        </View>

        {/* Language Selection */}
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

        {/* Conversation Stream */}
        <View style={styles.conversation}>
          {messages.map((message) => (
            <View
              key={message.id}
              style={[styles.message, message.role === "farmer" && styles.farmerMessage]}
            >
              <Text
                style={[styles.messageLabel, message.role === "farmer" && styles.farmerMessageText]}
              >
                {message.role === "zora" ? "ZORA ADVISORY" : "YOU"}
              </Text>

              {message.photoUri ? (
                <Image source={{ uri: message.photoUri }} style={styles.chatImage} />
              ) : null}

              <Text
                style={[styles.messageText, message.role === "farmer" && styles.farmerMessageText]}
              >
                {message.text}
              </Text>

              {message.result ? (
                <View style={styles.advisoryDetails}>
                  <Text style={styles.confidence}>
                    {Math.round(message.result.confidence * 100)}% confidence ·{" "}
                    {message.result.severity.toUpperCase()} PRIORITY
                  </Text>
                  {message.result.actions.map((action, idx) => (
                    <Text key={idx} style={styles.action}>
                      • {action}
                    </Text>
                  ))}
                  <Pressable
                    onPress={() =>
                      Speech.speak(message.text, { language: activeLanguage.locale, rate: 0.92 })
                    }
                  >
                    <Text style={styles.listen}>🔊 Listen again ({activeLanguage.label})</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          ))}
          {advisory.isPending ? (
            <Text style={styles.reasoning}>Zora is connecting field evidence and agro-knowledge…</Text>
          ) : null}
        </View>

        {/* Attached Photo Preview */}
        {attachedPhotoUri ? (
          <View style={styles.attachedPreview}>
            <Image source={{ uri: attachedPhotoUri }} style={styles.previewThumb} />
            <Text style={styles.previewText}>Leaf / Pest Photo Attached</Text>
            <Pressable onPress={() => setAttachedPhotoUri(null)}>
              <Text style={styles.removePhoto}>✕ Remove</Text>
            </Pressable>
          </View>
        ) : null}

        {/* Composer & Input */}
        <View style={styles.composer}>
          <TextInput
            multiline
            onChangeText={setPrompt}
            placeholder="Ask about crops, pests, fertilizer, or snap a photo of damaged leaves…"
            placeholderTextColor="#7b8b82"
            style={styles.input}
            textAlignVertical="top"
            value={prompt}
          />
          <View style={styles.composerActions}>
            <Pressable
              onPress={toggleRecording}
              style={[styles.actionBtn, recorderState.isRecording && styles.micButtonActive]}
            >
              <Text style={styles.actionBtnText}>
                {recorderState.isRecording ? "■ Stop" : "🎤 Voice"}
              </Text>
            </Pressable>

            <Pressable onPress={openCameraForDiagnosis} style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>📷 Photo</Text>
            </Pressable>

            <Text style={styles.voiceStatus}>
              {voiceUri
                ? "Voice ready"
                : recorderState.isRecording
                  ? `${Math.round(recorderState.durationMillis / 1000)}s`
                  : ""}
            </Text>

            <Pressable disabled={advisory.isPending} onPress={askZora} style={styles.sendButton}>
              <Text style={styles.sendText}>Ask Zora</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.disclaimer}>
          Grounded with IITA, FAO & CCSA agricultural research protocols. Always confirm severe outbreaks with your local extension agent.
        </Text>
      </ScrollView>

      {/* Camera Capture Modal */}
      <Modal visible={cameraModalVisible} animationType="slide">
        <SafeAreaView style={styles.cameraContainer}>
          <CameraView ref={cameraRef} style={styles.cameraView} facing="back">
            <View style={styles.cameraOverlay}>
              <Text style={styles.cameraGuideText}>
                Center the damaged leaf or pest inside the frame
              </Text>
              <View style={styles.cameraControls}>
                <Pressable
                  onPress={() => setCameraModalVisible(false)}
                  style={styles.cameraCancelBtn}
                >
                  <Text style={styles.cameraCancelText}>Cancel</Text>
                </Pressable>
                <Pressable onPress={takeDiagnosisPhoto} style={styles.captureBtn}>
                  <View style={styles.captureBtnInner} />
                </Pressable>
              </View>
            </View>
          </CameraView>
        </SafeAreaView>
      </Modal>
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
  quotaBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#d5e2d8",
  },
  quotaLeft: {
    flex: 1,
  },
  quotaBadge: {
    fontSize: 9,
    fontWeight: "900",
    color: "#196f3d",
    letterSpacing: 0.8,
  },
  quotaText: {
    fontSize: 12,
    color: "#2c3e50",
    fontWeight: "600",
    marginTop: 2,
  },
  upgradeSmallBtn: {
    backgroundColor: "#1e8449",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  upgradeSmallText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800",
  },
  languages: { marginTop: 12, marginBottom: 12 },
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
  chatImage: {
    width: 200,
    height: 150,
    borderRadius: 10,
    marginTop: 6,
    marginBottom: 6,
  },
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
  attachedPreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eafaf1",
    padding: 8,
    borderRadius: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#a9dfbf",
  },
  previewThumb: { width: 36, height: 36, borderRadius: 6, marginRight: 8 },
  previewText: { flex: 1, fontSize: 12, fontWeight: "600", color: "#145a32" },
  removePhoto: { color: "#c0392b", fontSize: 11, fontWeight: "700" },
  composer: {
    borderWidth: 1,
    borderColor: "#c7d6cb",
    borderRadius: 16,
    marginTop: 14,
    padding: 10,
    backgroundColor: "#ffffff",
  },
  input: { minHeight: 88, color: "#123126", fontSize: 13, lineHeight: 19 },
  composerActions: { flexDirection: "row", alignItems: "center", marginTop: 8, gap: 6 },
  actionBtn: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    backgroundColor: "#e5efe7",
  },
  micButtonActive: { backgroundColor: "#a13d31" },
  actionBtnText: { color: "#0a6840", fontSize: 11, fontWeight: "800" },
  voiceStatus: { flex: 1, color: "#607168", fontSize: 9, marginLeft: 4 },
  sendButton: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#e5aa20",
  },
  sendText: { color: "#063d2a", fontSize: 11, fontWeight: "900" },
  disclaimer: { color: "#738078", fontSize: 9, lineHeight: 14, marginTop: 12, textAlign: "center" },
  cameraContainer: { flex: 1, backgroundColor: "#000000" },
  cameraView: { flex: 1 },
  cameraOverlay: {
    flex: 1,
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  cameraGuideText: {
    color: "#ffffff",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  cameraControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 20,
  },
  cameraCancelBtn: {
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  cameraCancelText: { color: "#ffffff", fontWeight: "700" },
  captureBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 4,
    borderColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  captureBtnInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#ffffff",
  },
});
