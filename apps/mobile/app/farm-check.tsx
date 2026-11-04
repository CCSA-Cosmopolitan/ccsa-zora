import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Camera, Keyboard, Volume2 } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useLocalSearchParams } from "expo-router";

import { useVoiceStore } from "@/features/voice/voice-store";
import { EXTRAS } from "@/features/i18n/extras";
import { askZora } from "@/services/assistant";
import { ZoraHeader } from "@/components/navigation/ZoraHeader";
import { TabBar } from "@/components/navigation/TabBar";
import { FloatingVoicePill } from "@/components/voice/FloatingVoicePill";
import { SolidButton, ScreenTitle, layout } from "@/components/ui";

type Kind = "disease" | "area" | "soil";

interface Entry {
  id: string;
  answer?: string;
  observation: string;
  steps: string[];
  followUp: string;
}

const CONTEXT: Record<Kind, string> = {
  disease:
    "Farm check: crop disease or pests. Describe what you can observe in this photo, say what it could be without claiming a confirmed diagnosis, give safe next steps, and ask one short follow-up question.",
  area:
    "Farm check: a part of my farm that worries me. Describe what you can observe in this photo, mention possible causes without claiming certainty, give next steps, and ask one short follow-up question.",
  soil:
    "Farm check: soil. Describe what you can observe in this soil photo. Be clear that a photo cannot measure nutrients or pH. Ask one short follow-up question that helps you advise better.",
};

export default function FarmCheckScreen() {
  const params = useLocalSearchParams<{ kind?: string }>();
  const kind: Kind = params.kind === "disease" || params.kind === "area" ? params.kind : "soil";
  const { t, colors, language, speakText, stopSpeaking, isSpeaking } = useVoiceStore();
  const extra = EXTRAS[language];
  const f = t.farmPage;

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const conversationId = useRef<string | undefined>(undefined);
  const working = useRef(false);
  const mounted = useRef(true);

  useFocusEffect(
    React.useCallback(() => {
      mounted.current = true;
      return () => {
        mounted.current = false;
        void stopSpeaking();
      };
    }, [stopSpeaking]),
  );

  const title = kind === "soil" ? f.soilTitle : kind === "disease" ? f.cropDisease : f.farmArea;
  const intro = kind === "soil" ? f.soilSub : kind === "disease" ? f.cropDiseaseSub : f.farmAreaSub;
  const photoCaption = kind === "soil" ? f.yourSoilPhoto : title;

  async function run(message: string, image?: string, answer?: string) {
    if (working.current) return;
    working.current = true;
    setBusy(true);
    setError("");
    try {
      const reply = await askZora({ message, language, conversationId: conversationId.current, image });
      if (!mounted.current) return;
      conversationId.current = reply.conversationId;
      setEntries((old) => [
        ...old,
        {
          id: String(Date.now()),
          answer,
          observation: reply.spoken,
          steps: reply.steps ?? [],
          followUp: reply.followUp,
        },
      ]);
      void speakText(reply.followUp ? `${reply.spoken} ${reply.followUp}` : reply.spoken).catch(() => {});
    } catch (e) {
      if (mounted.current) setError(e instanceof Error ? e.message : extra.tryAgain);
    } finally {
      working.current = false;
      setBusy(false);
    }
  }

  async function takePhoto() {
    if (busy) return;
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) throw new Error("Please allow camera access");
      const result = await ImagePicker.launchCameraAsync({ quality: 0.5, base64: true });
      const asset = result.assets?.[0];
      if (result.canceled || !asset?.base64) return;
      void stopSpeaking();
      setPhotoUri(asset.uri);
      conversationId.current = undefined;
      setEntries([]);
      await run(CONTEXT[kind], `data:image/jpeg;base64,${asset.base64}`);
    } catch (e) {
      Alert.alert("Zora", e instanceof Error ? e.message : "Camera unavailable");
    }
  }

  function answer(text: string) {
    const value = text.trim();
    if (value.length < 2 || busy) return;
    setTyped("");
    void run(value, undefined, value);
  }

  const last = entries[entries.length - 1];

  function listen() {
    if (isSpeaking) {
      void stopSpeaking();
      return;
    }
    const text = last ? `${last.observation} ${last.followUp}` : intro;
    void speakText(text).catch(() => {});
  }

  return (
    <SafeAreaView style={[layout.safe, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      <ZoraHeader mode="back" />
      <KeyboardAvoidingView style={layout.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          style={layout.flex}
          contentContainerStyle={layout.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.titleRow}>
            <View style={layout.flex}>
              <ScreenTitle>{title}</ScreenTitle>
            </View>
            <Pressable onPress={listen} hitSlop={10} style={styles.listen}>
              <Volume2 size={22} color={colors.accent} />
              <Text style={[styles.listenText, { color: colors.accent }]}>
                {isSpeaking ? extra.stopListening : f.listen}
              </Text>
            </Pressable>
          </View>

          {photoUri ? (
            <>
              <Image source={{ uri: photoUri }} style={styles.photo} />
              <View style={styles.captionRow}>
                <Text style={[styles.caption, { color: colors.textSecondary }]}>{photoCaption}</Text>
                <Pressable onPress={takePhoto} hitSlop={10} style={styles.again} disabled={busy}>
                  <Camera size={18} color={colors.text} />
                  <Text style={[styles.againText, { color: colors.text }]}>{f.takeAnother}</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <View style={styles.start}>
              <Text style={[styles.intro, { color: colors.textSecondary }]}>{intro}</Text>
              <SolidButton Icon={Camera} label={t.chat.takePhoto} onPress={takePhoto} />
            </View>
          )}

          {busy ? (
            <View style={styles.busy}>
              <ActivityIndicator color={colors.accent} />
              <Text style={[styles.intro, { color: colors.textSecondary, marginBottom: 0 }]}>{extra.analyzing}</Text>
            </View>
          ) : null}

          {!!error && (
            <Text accessibilityRole="alert" style={[styles.error, { color: colors.dangerText }]}>
              {error}
            </Text>
          )}

          {entries.map((entry, index) => (
            <View key={entry.id} style={styles.entry}>
              {entry.answer ? (
                <View style={[styles.bubble, { backgroundColor: colors.callout }]}>
                  <Text style={[styles.bubbleLabel, { color: colors.textSecondary }]}>{t.chat.you}</Text>
                  <Text style={[styles.bubbleText, { color: colors.text }]}>{entry.answer}</Text>
                </View>
              ) : null}
              <Text style={[styles.observation, { color: colors.text }]}>{entry.observation}</Text>
              {entry.steps.map((step, i) => (
                <View key={i} style={styles.step}>
                  <Text style={[styles.stepNo, { color: colors.accent }]}>{i + 1}.</Text>
                  <Text style={[styles.stepText, { color: colors.text }]}>{step}</Text>
                </View>
              ))}
              {entry.followUp && index === entries.length - 1 ? (
                <View style={styles.ask}>
                  <Text style={[styles.askLabel, { color: colors.accent }]}>{f.zoraAsks}</Text>
                  <Text style={[styles.askText, { color: colors.text }]}>{entry.followUp}</Text>
                </View>
              ) : null}
            </View>
          ))}

          {photoUri ? (
            <View style={[styles.input, { borderColor: colors.cardBorder, backgroundColor: colors.inputBg }]}>
              <Keyboard size={20} color={colors.textMuted} />
              <TextInput
                value={typed}
                onChangeText={setTyped}
                placeholder={extra.askAnswerPlaceholder}
                placeholderTextColor={colors.textMuted}
                style={[styles.inputText, { color: colors.text }]}
                returnKeyType="send"
                editable={!busy}
                onSubmitEditing={() => answer(typed)}
              />
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
      <FloatingVoicePill disabled={busy || !photoUri} onRecordComplete={answer} />
      <TabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  listen: { flexDirection: "row", alignItems: "center", gap: 6, paddingTop: 10 },
  listenText: { fontSize: 16, fontWeight: "700" },
  photo: { width: "100%", aspectRatio: 16 / 10, borderRadius: 20, backgroundColor: "#ddd" },
  captionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12, marginBottom: 20 },
  caption: { fontSize: 15, flex: 1 },
  again: { flexDirection: "row", alignItems: "center", gap: 6 },
  againText: { fontSize: 15, fontWeight: "600" },
  start: { gap: 20, marginTop: 4 },
  intro: { fontSize: 17, lineHeight: 25 },
  busy: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  error: { fontSize: 15, marginBottom: 16 },
  entry: { gap: 12, marginBottom: 20 },
  bubble: { padding: 16, borderRadius: 16, gap: 4 },
  bubbleLabel: { fontSize: 13, fontWeight: "700" },
  bubbleText: { fontSize: 16, lineHeight: 23 },
  observation: { fontSize: 17, lineHeight: 26 },
  step: { flexDirection: "row", gap: 8 },
  stepNo: { fontSize: 16, fontWeight: "700", width: 22 },
  stepText: { flex: 1, fontSize: 16, lineHeight: 23 },
  ask: { gap: 6, marginTop: 4 },
  askLabel: { fontSize: 16, fontWeight: "700" },
  askText: { fontSize: 22, fontWeight: "700", lineHeight: 29 },
  input: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, height: 54 },
  inputText: { flex: 1, fontSize: 16, padding: 0 },
});
