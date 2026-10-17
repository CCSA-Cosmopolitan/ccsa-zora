import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Scan,
  Sprout,
  AudioLines,
  Volume2,
  Keyboard,
  ChevronRight,
} from "lucide-react-native";
import { router } from "expo-router";

import { useVoiceStore } from "@/features/voice/voice-store";
import { ZoraHeader } from "@/components/navigation/ZoraHeader";
import { TabBar } from "@/components/navigation/TabBar";
import { FloatingVoicePill } from "@/components/voice/FloatingVoicePill";

export default function HomeScreen() {
  const { t, colors, isSpeaking, speakText, stopSpeaking } = useVoiceStore();
  const [typedPrompt, setTypedPrompt] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  function handleHearIntro() {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speakText(`${t.homeTitle}. ${t.homeSubtitle}`);
    }
  }

  function handleTypeSubmit() {
    if (typedPrompt.trim()) {
      router.push({
        pathname: "/assistant",
        params: { initialPrompt: typedPrompt.trim() },
      });
      setTypedPrompt("");
      setIsTyping(false);
    }
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={["top", "left", "right"]}
    >
      <ZoraHeader mode="home" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.eyebrow, { color: colors.textSecondary }]}>
          {t.yourFarmingCompanion}
        </Text>

        <Text style={[styles.mainHeading, { color: colors.text }]}>
          {t.homeTitle}
        </Text>

        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {t.homeSubtitle}
        </Text>

        <Pressable onPress={handleHearIntro} style={styles.hearButton}>
          <Volume2 size={20} color={colors.accent} />
          <Text style={[styles.hearText, { color: colors.accent }]}>
            {isSpeaking ? "Stop listening" : t.hearHowToUse}
          </Text>
        </Pressable>

        {/* Text Input Row */}
        {isTyping ? (
          <View
            style={[
              styles.inputRow,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.accent,
              },
            ]}
          >
            <Keyboard size={20} color={colors.accent} />
            <TextInput
              value={typedPrompt}
              onChangeText={setTypedPrompt}
              placeholder={t.orTypeHere}
              placeholderTextColor={colors.textMuted}
              style={[styles.textInput, { color: colors.text }]}
              autoFocus
              onSubmitEditing={handleTypeSubmit}
              returnKeyType="send"
            />
          </View>
        ) : (
          <Pressable
            onPress={() => setIsTyping(true)}
            style={[
              styles.inputRow,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <Keyboard size={20} color={colors.textMuted} />
            <Text style={[styles.inputPlaceholder, { color: colors.textMuted }]}>
              {t.orTypeHere}
            </Text>
          </Pressable>
        )}

        {/* Feature Action List */}
        <View style={styles.actionList}>
          {/* Identify a plant */}
          <Pressable
            onPress={() => router.push("/plants")}
            style={({ pressed }) => [
              styles.actionCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <View style={styles.iconContainer}>
              <Scan size={26} color={colors.text} />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={[styles.actionTitle, { color: colors.text }]}>
                {t.identifyPlant}
              </Text>
              <Text
                style={[
                  styles.actionSubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                {t.identifyPlantSub}
              </Text>
            </View>
            <ChevronRight size={22} color={colors.textMuted} />
          </Pressable>

          {/* Check a farm problem */}
          <Pressable
            onPress={() => router.push("/farm")}
            style={({ pressed }) => [
              styles.actionCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <View style={styles.iconContainer}>
              <Sprout size={26} color={colors.text} />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={[styles.actionTitle, { color: colors.text }]}>
                {t.checkFarmProblem}
              </Text>
              <Text
                style={[
                  styles.actionSubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                {t.checkFarmProblemSub}
              </Text>
            </View>
            <ChevronRight size={22} color={colors.textMuted} />
          </Pressable>

          {/* Zora Live */}
          <Pressable
            onPress={() => router.push("/live")}
            style={({ pressed }) => [
              styles.actionCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <View style={styles.iconContainer}>
              <AudioLines size={26} color={colors.text} />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={[styles.actionTitle, { color: colors.text }]}>
                {t.zoraLive}
              </Text>
              <Text
                style={[
                  styles.actionSubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                {t.zoraLiveSub}
              </Text>
            </View>
            <ChevronRight size={22} color={colors.textMuted} />
          </Pressable>
        </View>
      </ScrollView>

      {/* Floating Voice Button */}
      <FloatingVoicePill />

      {/* 4-Tab Bottom Footer */}
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
    paddingTop: 20,
    paddingBottom: 16,
  },
  eyebrow: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  mainHeading: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
    lineHeight: 38,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  hearButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    marginBottom: 24,
    paddingVertical: 4,
  },
  hearText: {
    fontSize: 16,
    fontWeight: "700",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 28,
  },
  inputPlaceholder: {
    fontSize: 15,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  actionList: {
    gap: 14,
    marginBottom: 20,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  iconContainer: {
    width: 36,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 3,
  },
  actionSubtitle: {
    fontSize: 13,
  },
});
