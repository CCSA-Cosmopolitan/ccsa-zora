import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
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
import { Camera, Keyboard, Languages, Volume2 } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";

import { useVoiceStore } from "@/features/voice/voice-store";
import { LANGUAGES } from "@/features/i18n/languages";
import { EXTRAS } from "@/features/i18n/extras";
import { askZora } from "@/services/assistant";
import { ZoraHeader } from "@/components/navigation/ZoraHeader";
import { TabBar } from "@/components/navigation/TabBar";
import { FloatingVoicePill } from "@/components/voice/FloatingVoicePill";
import { OutlineButton, SolidButton, layout } from "@/components/ui";

interface Message {
  id: string;
  sender: "user" | "zora";
  text: string;
  imageUri?: string;
}

const PHOTO_PROMPT = "What can you observe about this plant? Ask me if more information is needed.";

export default function AssistantScreen() {
  const { language, t, colors, isSpeaking, speakText, stopSpeaking } = useVoiceStore();
  const extra = EXTRAS[language];
  const params = useLocalSearchParams<{ initialPrompt?: string }>();
  const currentLang = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[4]!;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const conversationId = useRef<string | undefined>(undefined);
  const active = useRef(true);
  const pending = useRef(false);
  const started = useRef(false);
  const scroller = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      active.current = true;
      return () => {
        active.current = false;
        void stopSpeaking();
      };
    }, [stopSpeaking]),
  );

  useEffect(() => {
    if (params.initialPrompt && !started.current) {
      started.current = true;
      void send(params.initialPrompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function send(text: string, image?: string, imageUri?: string) {
    const message = text.trim();
    if (pending.current || message.length < 2) return;
    pending.current = true;
    setBusy(true);
    setError("");
    setMessages((old) => [...old, { id: `${Date.now()}`, sender: "user", text: message, imageUri }]);
    try {
      const reply = await askZora({ message, language, conversationId: conversationId.current, image });
      if (!active.current || AppState.currentState !== "active") return;
      conversationId.current = reply.conversationId;
      setMessages((old) => [...old, { id: `${Date.now()}-reply`, sender: "zora", text: reply.spoken }]);
      try {
        await speakText(reply.spoken);
      } catch {
        setError("Voice playback is unavailable. Tap Listen to try again.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Zora is temporarily unavailable");
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  async function listen(text: string) {
    if (isSpeaking) {
      await stopSpeaking();
      return;
    }
    try {
      await speakText(text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Voice unavailable");
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
      await send(input.trim() || PHOTO_PROMPT, `data:image/jpeg;base64,${asset.base64}`, asset.uri);
      setInput("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Camera unavailable");
    }
  }

  function submit() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    void send(text);
  }

  const lastId = messages[messages.length - 1]?.id;

  return (
    <SafeAreaView style={[layout.safe, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      <ZoraHeader mode="back" />
      <KeyboardAvoidingView style={layout.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          ref={scroller}
          style={layout.flex}
          contentContainerStyle={layout.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scroller.current?.scrollToEnd({ animated: true })}
        >
          <Text style={[styles.title, { color: colors.text }]}>{t.tabs.askZora}</Text>
          <Pressable onPress={() => router.push("/language")} hitSlop={8} style={styles.langIndicator}>
            <Languages size={18} color={colors.accent} />
            <Text style={[styles.langText, { color: colors.accent }]}>{currentLang.nativeName}</Text>
          </Pressable>

          {messages.map((m) =>
            m.sender === "user" ? (
              <View key={m.id} style={[styles.userBubble, { backgroundColor: colors.callout }]}>
                <Text style={[styles.userLabel, { color: colors.textSecondary }]}>{t.chat.you}</Text>
                <Text style={[styles.userText, { color: colors.text }]}>{m.text}</Text>
                {m.imageUri ? <Image source={{ uri: m.imageUri }} style={styles.attached} /> : null}
              </View>
            ) : (
              <View key={m.id} style={styles.zora}>
                <Text style={[styles.zoraLabel, { color: colors.accent }]}>{t.chat.zora}</Text>
                <Text style={[styles.zoraText, { color: colors.text }]}>{m.text}</Text>
                <View style={styles.actions}>
                  <OutlineButton
                    Icon={Volume2}
                    label={isSpeaking ? extra.stopListening : t.chat.listenResponse}
                    onPress={() => void listen(m.text)}
                  />
                  {m.id === lastId ? (
                    <SolidButton Icon={Camera} label={t.chat.takePhoto} onPress={takePhoto} disabled={busy} />
                  ) : null}
                </View>
              </View>
            ),
          )}

          {busy ? (
            <View style={styles.busy}>
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : null}
          {!!error && (
            <Text accessibilityRole="alert" style={[styles.error, { color: colors.dangerText }]}>
              {error}
            </Text>
          )}

          {messages.length === 0 && !busy ? (
            <SolidButton Icon={Camera} label={t.chat.takePhoto} onPress={takePhoto} style={styles.firstPhoto} />
          ) : null}

          <View style={[styles.inputRow, { borderColor: colors.cardBorder, backgroundColor: colors.inputBg }]}>
            <Keyboard size={20} color={colors.textMuted} />
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={t.orTypeHere}
              placeholderTextColor={colors.textMuted}
              style={[styles.inputText, { color: colors.text }]}
              returnKeyType="send"
              editable={!busy}
              onSubmitEditing={submit}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <FloatingVoicePill disabled={busy} onRecordComplete={(text) => void send(text)} />
      <TabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 32, fontWeight: "700", letterSpacing: -0.6 },
  langIndicator: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8, marginBottom: 26 },
  langText: { fontSize: 17, fontWeight: "600" },
  userBubble: { alignSelf: "stretch", borderRadius: 18, padding: 18, marginBottom: 22, gap: 4 },
  userLabel: { fontSize: 14, fontWeight: "600" },
  userText: { fontSize: 18, lineHeight: 26, fontWeight: "500" },
  attached: { width: "100%", height: 180, borderRadius: 12, marginTop: 12 },
  zora: { marginBottom: 24, gap: 10 },
  zoraLabel: { fontSize: 17, fontWeight: "700" },
  zoraText: { fontSize: 18, lineHeight: 28 },
  actions: { gap: 12, marginTop: 8 },
  busy: { alignItems: "flex-start", paddingVertical: 12 },
  error: { fontSize: 15, marginBottom: 12 },
  firstPhoto: { marginBottom: 16 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    marginTop: 4,
  },
  inputText: { flex: 1, fontSize: 17, padding: 0 },
});
