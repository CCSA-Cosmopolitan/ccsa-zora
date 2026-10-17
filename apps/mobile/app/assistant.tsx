import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Volume2,
  Camera,
  Keyboard,
  Languages,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, router } from "expo-router";

import { useVoiceStore } from "@/features/voice/voice-store";
import { ZoraHeader } from "@/components/navigation/ZoraHeader";
import { TabBar } from "@/components/navigation/TabBar";
import { FloatingVoicePill } from "@/components/voice/FloatingVoicePill";
import { LANGUAGES } from "@/features/i18n/languages";

interface Message {
  id: string;
  sender: "user" | "zora";
  text: string;
  imageUri?: string;
  suggestedAction?: "photo" | "hear";
}

export default function AssistantScreen() {
  const { language, t, colors, isSpeaking, speakText, stopSpeaking } =
    useVoiceStore();
  const params = useLocalSearchParams<{ initialPrompt?: string }>();
  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[4]!;

  const defaultUserText =
    language === "ha"
      ? "Ganyen masarata suna yin rawaya. Me zan yi?"
      : language === "yo"
        ? "Awọn ewe agbado mi ti n yipada si ofeefee. Kini o yẹ ki n ṣe?"
        : language === "ig"
          ? "Akwụkwọ ọka m na-acha odo odo. Kedu ihe m kwesịrị ime?"
          : language === "pcm"
            ? "My maize leaf dey turn yellow. Wetin I fit do?"
            : "The leaves on my maize crop are turning yellow. What should I do?";

  const defaultZoraText =
    language === "ha"
      ? "Za ka iya daukar hoton ganyen da ya yi rawaya? Ka tabbatar ganyen ya fito fili a hoton."
      : language === "yo"
        ? "Ṣe o le ya fọto ewe ti o ti yipada si ofeefee? Rii daju pe ewe naa han gbangba ninu fọto."
        : language === "ig"
          ? "Ị nwere ike see foto akwụkwọ ahụ na-acha odo odo? Hụ na akwụkwọ ahụ pụtara nke ọma na foto ahụ."
          : language === "pcm"
            ? "You fit snap photo of the leaf wey dey turn yellow? Make sure say the leaf show well inside the photo."
            : "Could you take a clear photo of the yellow leaf? Make sure the leaf is well-lit and in focus.";

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "user",
      text: params.initialPrompt ?? defaultUserText,
    },
    {
      id: "2",
      sender: "zora",
      text: defaultZoraText,
      suggestedAction: "photo",
    },
  ]);

  const [inputVal, setInputVal] = useState("");

  function handleListenResponse(text: string) {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speakText(text);
    }
  }

  async function handleTakePhoto() {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const photoUri = result.assets[0].uri;
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: "user",
            text: language === "ha" ? "Ga hoton ganyen nan." : "Here is the photo.",
            imageUri: photoUri,
          },
          {
            id: (Date.now() + 1).toString(),
            sender: "zora",
            text:
              language === "ha"
                ? "Na gani. Wannan yana nuna rashin sinadarin nitrogen ne a ƙasa. Zuba takin nitrogen da safe zai gyara shi."
                : "I see it clearly. This pattern indicates nitrogen deficiency along the leaf midrib. Applying balanced nitrogen fertilizer will restore leaf vigor.",
          },
        ]);
        speakText(
          language === "ha"
            ? "Na gani. Wannan yana nuna rashin sinadarin nitrogen ne a ƙasa."
            : "I see it clearly. This pattern indicates nitrogen deficiency.",
        );
      }
    } catch {
      // Fallback
    }
  }

  function handleSendMessage() {
    if (!inputVal.trim()) return;
    const userText = inputVal.trim();
    setInputVal("");

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: "user",
        text: userText,
      },
    ]);

    setTimeout(() => {
      const reply =
        language === "ha"
          ? "Zora ya fahimci maganarka. Ina nazarin wannan don ba ka cikakkiyar amsa."
          : "Zora understands. Analyzing your farm context to provide the best recommendation.";
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "zora",
          text: reply,
        },
      ]);
      speakText(reply);
    }, 800);
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={["top", "left", "right"]}
    >
      <ZoraHeader mode="back" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.screenTitle, { color: colors.text }]}>
          {t.tabs.askZora}
        </Text>

        <Pressable
          onPress={() => router.push("/language")}
          style={styles.languageIndicator}
        >
          <Languages size={16} color={colors.accent} />
          <Text style={[styles.languageText, { color: colors.accent }]}>
            {currentLang.nativeName}
          </Text>
        </Pressable>

        <View style={styles.conversation}>
          {messages.map((m) => (
            <View key={m.id} style={styles.messageWrapper}>
              {m.sender === "user" ? (
                /* User Message Bubble */
                <View
                  style={[
                    styles.userBubble,
                    {
                      backgroundColor: colors.inputBg,
                      borderColor: colors.cardBorder,
                    },
                  ]}
                >
                  <Text style={[styles.userLabel, { color: colors.textSecondary }]}>
                    {t.chat.you}
                  </Text>
                  <Text style={[styles.userMessageText, { color: colors.text }]}>
                    {m.text}
                  </Text>
                  {m.imageUri ? (
                    <Image
                      source={{ uri: m.imageUri }}
                      style={styles.attachedImage}
                    />
                  ) : null}
                </View>
              ) : (
                /* Zora Response */
                <View style={styles.zoraBubble}>
                  <Text style={[styles.zoraLabel, { color: colors.accent }]}>
                    {t.chat.zora}
                  </Text>
                  <Text style={[styles.zoraMessageText, { color: colors.text }]}>
                    {m.text}
                  </Text>

                  {/* Actions under Zora response */}
                  <View style={styles.zoraActions}>
                    <Pressable
                      onPress={() => handleListenResponse(m.text)}
                      style={[
                        styles.actionButtonOutline,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.cardBorder,
                        },
                      ]}
                    >
                      <Volume2 size={20} color={colors.text} />
                      <Text
                        style={[
                          styles.actionButtonText,
                          { color: colors.text },
                        ]}
                      >
                        {isSpeaking ? "Dakata" : t.chat.listenResponse}
                      </Text>
                    </Pressable>

                    {m.suggestedAction === "photo" ? (
                      <Pressable
                        onPress={handleTakePhoto}
                        style={[
                          styles.actionButtonFilled,
                          { backgroundColor: colors.voicePillBg },
                        ]}
                      >
                        <Camera size={20} color={colors.voicePillText} />
                        <Text
                          style={[
                            styles.actionButtonTextFilled,
                            { color: colors.voicePillText },
                          ]}
                        >
                          {t.chat.takePhoto}
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Input Field */}
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: colors.inputBg,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <Keyboard size={20} color={colors.textMuted} />
          <TextInput
            value={inputVal}
            onChangeText={setInputVal}
            placeholder={t.orTypeHere}
            placeholderTextColor={colors.textMuted}
            style={[styles.input, { color: colors.text }]}
            onSubmitEditing={handleSendMessage}
            returnKeyType="send"
          />
        </View>
      </ScrollView>

      {/* Floating Voice Pill */}
      <FloatingVoicePill
        onRecordComplete={(transcript) => {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              sender: "user",
              text: transcript,
            },
            {
              id: (Date.now() + 1).toString(),
              sender: "zora",
              text:
                language === "ha"
                  ? "Na fahimci tambayarka. Za ka iya daukar hoton don na bincika sosai?"
                  : "I heard your question. Could you take a photo so I can confirm the diagnosis?",
              suggestedAction: "photo",
            },
          ]);
        }}
      />

      {/* Bottom Tab Bar */}
      <TabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 16,
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  languageIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
    marginBottom: 24,
  },
  languageText: {
    fontSize: 15,
    fontWeight: "700",
  },
  conversation: {
    gap: 20,
    marginBottom: 20,
  },
  messageWrapper: {
    marginBottom: 8,
  },
  userBubble: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    alignSelf: "stretch",
  },
  userLabel: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
  },
  userMessageText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  attachedImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginTop: 12,
    resizeMode: "cover",
  },
  zoraBubble: {
    paddingVertical: 12,
  },
  zoraLabel: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 8,
  },
  zoraMessageText: {
    fontSize: 17,
    lineHeight: 26,
    marginBottom: 16,
  },
  zoraActions: {
    gap: 12,
  },
  actionButtonOutline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  actionButtonFilled: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 14,
    paddingVertical: 14,
  },
  actionButtonTextFilled: {
    fontSize: 16,
    fontWeight: "700",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
});
