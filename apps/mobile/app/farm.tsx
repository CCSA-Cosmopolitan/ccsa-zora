import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Bug,
  Tractor,
  Sprout,
  Volume2,
  Camera,
  ChevronRight,
  Keyboard,
} from "lucide-react-native";

import { useVoiceStore } from "@/features/voice/voice-store";
import { ZoraHeader } from "@/components/navigation/ZoraHeader";
import { TabBar } from "@/components/navigation/TabBar";
import { FloatingVoicePill } from "@/components/voice/FloatingVoicePill";

type FarmCheckMode = "category" | "soil" | "disease" | "area";

export default function FarmScreen() {
  const { t, colors, isSpeaking, speakText, stopSpeaking } = useVoiceStore();
  const [activeCheck, setActiveCheck] = useState<FarmCheckMode>("category");
  const [typedAnswer, setTypedAnswer] = useState("");
  const [answered, setAnswered] = useState(false);

  function handleHearChoices() {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speakText(
        `${t.farmPage.title}. Option 1: ${t.farmPage.cropDisease}. Option 2: ${t.farmPage.farmArea}. Option 3: ${t.farmPage.soil}.`,
      );
    }
  }

  function handleHearSoilInfo() {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speakText(
        `${t.farmPage.soilTitle}. ${t.farmPage.soilObservation}. ${t.farmPage.zoraAsks}: ${t.farmPage.soilQuestion}`,
      );
    }
  }

  function handleAnswerSubmit() {
    if (typedAnswer.trim()) {
      setAnswered(true);
      speakText(
        "Thank you. Based on the dry soil and lack of recent rain, deep drip irrigation in early morning is recommended to prevent water loss.",
      );
    }
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={["top", "left", "right"]}
    >
      <ZoraHeader
        mode="back"
        onBack={activeCheck !== "category" ? () => setActiveCheck("category") : undefined}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeCheck === "category" ? (
          /* Selection Screen: What needs checking? */
          <View>
            <Text style={[styles.title, { color: colors.text }]}>
              {t.farmPage.title}
            </Text>

            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {t.farmPage.subtitle}
            </Text>

            <View style={styles.list}>
              {/* Crop disease or pests */}
              <Pressable
                onPress={() => setActiveCheck("disease")}
                style={[
                  styles.optionCard,
                  { borderBottomColor: colors.divider },
                ]}
              >
                <View style={styles.iconCol}>
                  <Bug size={28} color={colors.text} />
                </View>
                <View style={styles.textCol}>
                  <Text style={[styles.optionTitle, { color: colors.text }]}>
                    {t.farmPage.cropDisease}
                  </Text>
                  <Text
                    style={[
                      styles.optionSub,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {t.farmPage.cropDiseaseSub}
                  </Text>
                </View>
                <ChevronRight size={22} color={colors.textMuted} />
              </Pressable>

              {/* Farm area */}
              <Pressable
                onPress={() => setActiveCheck("area")}
                style={[
                  styles.optionCard,
                  { borderBottomColor: colors.divider },
                ]}
              >
                <View style={styles.iconCol}>
                  <Tractor size={28} color={colors.text} />
                </View>
                <View style={styles.textCol}>
                  <Text style={[styles.optionTitle, { color: colors.text }]}>
                    {t.farmPage.farmArea}
                  </Text>
                  <Text
                    style={[
                      styles.optionSub,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {t.farmPage.farmAreaSub}
                  </Text>
                </View>
                <ChevronRight size={22} color={colors.textMuted} />
              </Pressable>

              {/* Soil */}
              <Pressable
                onPress={() => setActiveCheck("soil")}
                style={[
                  styles.optionCard,
                  { borderBottomColor: colors.divider },
                ]}
              >
                <View style={styles.iconCol}>
                  <Sprout size={28} color={colors.text} />
                </View>
                <View style={styles.textCol}>
                  <Text style={[styles.optionTitle, { color: colors.text }]}>
                    {t.farmPage.soil}
                  </Text>
                  <Text
                    style={[
                      styles.optionSub,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {t.farmPage.soilSub}
                  </Text>
                </View>
                <ChevronRight size={22} color={colors.textMuted} />
              </Pressable>
            </View>

            {/* Spoken choices button */}
            <Pressable
              onPress={handleHearChoices}
              style={[
                styles.hearChoicesButton,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                },
              ]}
            >
              <Volume2 size={20} color={colors.text} />
              <Text
                style={[
                  styles.hearChoicesText,
                  { color: colors.text },
                ]}
              >
                {t.farmPage.hearChoices}
              </Text>
            </Pressable>
          </View>
        ) : (
          /* Soil Diagnostic & Follow-up Workflow */
          <View>
            <View style={styles.detailHeader}>
              <Text style={[styles.title, { color: colors.text }]}>
                {t.farmPage.soilTitle}
              </Text>

              <Pressable
                onPress={handleHearSoilInfo}
                style={styles.detailHearRow}
              >
                <Volume2 size={20} color={colors.accent} />
                <Text style={[styles.detailHearText, { color: colors.accent }]}>
                  {t.farmPage.listen}
                </Text>
              </Pressable>
            </View>

            {/* Soil Photo */}
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1592417817098-8f3d69103a89?w=800&auto=format&fit=crop&q=80",
              }}
              style={styles.soilImage}
            />

            <View style={styles.photoControlRow}>
              <Text
                style={[
                  styles.photoControlLabel,
                  { color: colors.textSecondary },
                ]}
              >
                {t.farmPage.yourSoilPhoto}
              </Text>
              <Pressable
                onPress={() => {}}
                style={styles.takeAnotherButton}
              >
                <Camera size={18} color={colors.text} />
                <Text style={[styles.takeAnotherText, { color: colors.text }]}>
                  {t.farmPage.takeAnother}
                </Text>
              </Pressable>
            </View>

            <Text
              style={[styles.observationText, { color: colors.textSecondary }]}
            >
              {t.farmPage.soilObservation}
            </Text>

            {/* Interactive Follow-up Question from Zora */}
            <View style={styles.questionSection}>
              <Text style={[styles.zoraAsksLabel, { color: colors.accent }]}>
                {t.farmPage.zoraAsks}
              </Text>
              <Text style={[styles.questionText, { color: colors.text }]}>
                {t.farmPage.soilQuestion}
              </Text>

              <View
                style={[
                  styles.answerInputRow,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                <Keyboard size={20} color={colors.textMuted} />
                <TextInput
                  value={typedAnswer}
                  onChangeText={setTypedAnswer}
                  placeholder={t.orTypeHere}
                  placeholderTextColor={colors.textMuted}
                  style={[styles.answerInput, { color: colors.text }]}
                  onSubmitEditing={handleAnswerSubmit}
                  returnKeyType="done"
                />
              </View>

              {answered ? (
                <View
                  style={[
                    styles.adviceCard,
                    {
                      backgroundColor: colors.accentLight,
                      borderColor: colors.accent,
                    },
                  ]}
                >
                  <Text style={[styles.adviceTitle, { color: colors.accentDark }]}>
                    Zora recommendation
                  </Text>
                  <Text style={[styles.adviceBody, { color: colors.text }]}>
                    Deep morning watering recommended before noon sun. Mulch with dry leaves to conserve soil moisture.
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Floating Voice Pill */}
      <FloatingVoicePill
        onRecordComplete={(transcript) => {
          setTypedAnswer("3 days ago");
          setAnswered(true);
          speakText(
            "Understood. Since it rained three days ago and the topsoil has dried, shallow roots need watering now.",
          );
        }}
      />

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
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  list: {
    marginBottom: 28,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconCol: {
    width: 36,
    marginRight: 16,
    alignItems: "center",
  },
  textCol: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
  },
  optionSub: {
    fontSize: 14,
  },
  hearChoicesButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
  },
  hearChoicesText: {
    fontSize: 16,
    fontWeight: "700",
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  detailHearRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  detailHearText: {
    fontSize: 16,
    fontWeight: "700",
  },
  soilImage: {
    width: "100%",
    height: 220,
    borderRadius: 18,
    resizeMode: "cover",
    marginBottom: 12,
  },
  photoControlRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  photoControlLabel: {
    fontSize: 14,
  },
  takeAnotherButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  takeAnotherText: {
    fontSize: 14,
    fontWeight: "700",
  },
  observationText: {
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 24,
  },
  questionSection: {
    marginBottom: 20,
  },
  zoraAsksLabel: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 4,
  },
  questionText: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: 16,
  },
  answerInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  answerInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  adviceCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
  },
  adviceTitle: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 4,
  },
  adviceBody: {
    fontSize: 14,
    lineHeight: 20,
  },
});
