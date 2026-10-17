import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Camera,
  Image as ImageIcon,
  Volume2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";

import { useVoiceStore } from "@/features/voice/voice-store";
import { ZoraHeader } from "@/components/navigation/ZoraHeader";
import { TabBar } from "@/components/navigation/TabBar";
import { FloatingVoicePill } from "@/components/voice/FloatingVoicePill";
import { NIGERIAN_PLANTS, PlantProfile } from "@/features/plants/plant-data";

export default function PlantsScreen() {
  const { language, t, colors, isSpeaking, speakText, stopSpeaking } =
    useVoiceStore();

  const [identifiedPlant, setIdentifiedPlant] = useState<PlantProfile | null>(
    null,
  );
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(
    "health",
  );

  function handleHearCameraGuidance() {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speakText(
        `${t.plantsPage.cameraInstruction} Tap take photo when you are ready.`,
      );
    }
  }

  function handleTakePhoto() {
    // Select first plant profile (Moringa) as demo match, or allow image pick
    const samplePlant = NIGERIAN_PLANTS[0]!;
    setIdentifiedPlant(samplePlant);
    setCapturedImageUri(samplePlant.imageUri);
  }

  async function handleChoosePhoto() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const samplePlant = NIGERIAN_PLANTS[0]!;
        setCapturedImageUri(result.assets[0].uri);
        setIdentifiedPlant(samplePlant);
      }
    } catch {
      handleTakePhoto();
    }
  }

  function handleListenPlantInfo() {
    if (!identifiedPlant) return;
    if (isSpeaking) {
      stopSpeaking();
    } else {
      const common = identifiedPlant.commonName[language];
      const health = identifiedPlant.healthNutrition[language];
      const edibility = identifiedPlant.edibility[language];
      const safety = identifiedPlant.toxicitySafety[language];
      speakText(`${common}. ${health}. ${edibility}. ${safety}`);
    }
  }

  function toggleSection(sectionKey: string) {
    setExpandedSection(expandedSection === sectionKey ? null : sectionKey);
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={["top", "left", "right"]}
    >
      <ZoraHeader
        mode="back"
        onBack={identifiedPlant ? () => setIdentifiedPlant(null) : undefined}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!identifiedPlant ? (
          /* Viewfinder & Capture Mode */
          <View>
            <Text style={[styles.title, { color: colors.text }]}>
              {t.plantsPage.title}
            </Text>

            {/* Viewfinder Preview Box */}
            <View style={styles.viewfinderContainer}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=800&auto=format&fit=crop&q=80",
                }}
                style={styles.viewfinderImage}
              />

              {/* Viewfinder Corner Overlays */}
              <View style={styles.viewfinderOverlay}>
                <View style={[styles.corner, styles.cornerTopLeft]} />
                <View style={[styles.corner, styles.cornerTopRight]} />
                <View style={[styles.corner, styles.cornerBottomLeft]} />
                <View style={[styles.corner, styles.cornerBottomRight]} />
              </View>

              <View style={styles.instructionBanner}>
                <Text style={styles.instructionText}>
                  {t.plantsPage.cameraInstruction}
                </Text>
              </View>
            </View>

            {/* Big Take Photo Trigger */}
            <Pressable onPress={handleTakePhoto} style={styles.cameraTriggerRow}>
              <View style={[styles.cameraCircle, { borderColor: colors.text }]}>
                <Camera size={32} color={colors.text} />
              </View>
              <Text style={[styles.cameraTriggerText, { color: colors.text }]}>
                {t.plantsPage.takePhoto}
              </Text>
            </Pressable>

            {/* Secondary Buttons */}
            <View style={styles.secondaryActions}>
              <Pressable
                onPress={handleChoosePhoto}
                style={[
                  styles.whiteButton,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                <ImageIcon size={20} color={colors.text} />
                <Text
                  style={[styles.whiteButtonText, { color: colors.text }]}
                >
                  {t.plantsPage.choosePhoto}
                </Text>
              </Pressable>

              <Pressable
                onPress={handleHearCameraGuidance}
                style={[
                  styles.whiteButton,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                <Volume2 size={20} color={colors.text} />
                <Text
                  style={[styles.whiteButtonText, { color: colors.text }]}
                >
                  {t.plantsPage.hearCameraGuidance}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          /* Identified Plant Detail Profile */
          <View>
            <Image
              source={{ uri: capturedImageUri ?? identifiedPlant.imageUri }}
              style={styles.plantHeroImage}
            />

            <Text style={[styles.matchStatus, { color: colors.accent }]}>
              {t.plantsPage.possibleMatch}
            </Text>

            <Text style={[styles.plantCommonName, { color: colors.text }]}>
              {identifiedPlant.commonName[language]}
            </Text>

            <Text
              style={[styles.plantScientific, { color: colors.textSecondary }]}
            >
              {identifiedPlant.scientificName}
            </Text>

            {/* Spoken Narration Button */}
            <Pressable
              onPress={handleListenPlantInfo}
              style={[
                styles.listenButton,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                },
              ]}
            >
              <Volume2 size={20} color={colors.text} />
              <Text style={[styles.listenText, { color: colors.text }]}>
                {isSpeaking ? "Stop listening" : t.plantsPage.listenInfo}
              </Text>
            </Pressable>

            {/* Safety Warning Banner */}
            <View
              style={[
                styles.safetyBanner,
                {
                  backgroundColor: colors.warningBg,
                  borderColor: colors.warningBorder,
                },
              ]}
            >
              <AlertTriangle size={20} color={colors.warningText} />
              <Text
                style={[styles.safetyText, { color: colors.warningText }]}
              >
                {t.plantsPage.safetyWarning}
              </Text>
            </View>

            {/* Accordion Sections */}
            <View style={styles.accordionContainer}>
              {/* Health & Nutrition */}
              <View
                style={[
                  styles.accordionItem,
                  { borderBottomColor: colors.divider },
                ]}
              >
                <Pressable
                  onPress={() => toggleSection("health")}
                  style={styles.accordionHeader}
                >
                  <Text
                    style={[styles.accordionTitle, { color: colors.text }]}
                  >
                    {t.plantsPage.healthNutrition}
                  </Text>
                  {expandedSection === "health" ? (
                    <ChevronUp size={20} color={colors.textSecondary} />
                  ) : (
                    <ChevronDown size={20} color={colors.textSecondary} />
                  )}
                </Pressable>
                {expandedSection === "health" ? (
                  <Text
                    style={[
                      styles.accordionBody,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {identifiedPlant.healthNutrition[language]}
                  </Text>
                ) : null}
              </View>

              {/* Edibility */}
              <View
                style={[
                  styles.accordionItem,
                  { borderBottomColor: colors.divider },
                ]}
              >
                <Pressable
                  onPress={() => toggleSection("edibility")}
                  style={styles.accordionHeader}
                >
                  <Text
                    style={[styles.accordionTitle, { color: colors.text }]}
                  >
                    {t.plantsPage.edibility}
                  </Text>
                  {expandedSection === "edibility" ? (
                    <ChevronUp size={20} color={colors.textSecondary} />
                  ) : (
                    <ChevronDown size={20} color={colors.textSecondary} />
                  )}
                </Pressable>
                {expandedSection === "edibility" ? (
                  <Text
                    style={[
                      styles.accordionBody,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {identifiedPlant.edibility[language]}
                  </Text>
                ) : null}
              </View>

              {/* Toxicity & Safety */}
              <View
                style={[
                  styles.accordionItem,
                  { borderBottomColor: colors.divider },
                ]}
              >
                <Pressable
                  onPress={() => toggleSection("toxicity")}
                  style={styles.accordionHeader}
                >
                  <Text
                    style={[styles.accordionTitle, { color: colors.text }]}
                  >
                    {t.plantsPage.toxicitySafety}
                  </Text>
                  {expandedSection === "toxicity" ? (
                    <ChevronUp size={20} color={colors.textSecondary} />
                  ) : (
                    <ChevronDown size={20} color={colors.textSecondary} />
                  )}
                </Pressable>
                {expandedSection === "toxicity" ? (
                  <Text
                    style={[
                      styles.accordionBody,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {identifiedPlant.toxicitySafety[language]}
                  </Text>
                ) : null}
              </View>

              {/* Origin */}
              <View
                style={[
                  styles.accordionItem,
                  { borderBottomColor: colors.divider },
                ]}
              >
                <Pressable
                  onPress={() => toggleSection("origin")}
                  style={styles.accordionHeader}
                >
                  <Text
                    style={[styles.accordionTitle, { color: colors.text }]}
                  >
                    {t.plantsPage.origin}
                  </Text>
                  {expandedSection === "origin" ? (
                    <ChevronUp size={20} color={colors.textSecondary} />
                  ) : (
                    <ChevronDown size={20} color={colors.textSecondary} />
                  )}
                </Pressable>
                {expandedSection === "origin" ? (
                  <Text
                    style={[
                      styles.accordionBody,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {identifiedPlant.origin[language]}
                  </Text>
                ) : null}
              </View>

              {/* Growing & Care */}
              <View
                style={[
                  styles.accordionItem,
                  { borderBottomColor: colors.divider },
                ]}
              >
                <Pressable
                  onPress={() => toggleSection("care")}
                  style={styles.accordionHeader}
                >
                  <Text
                    style={[styles.accordionTitle, { color: colors.text }]}
                  >
                    {t.plantsPage.growingCare}
                  </Text>
                  {expandedSection === "care" ? (
                    <ChevronUp size={20} color={colors.textSecondary} />
                  ) : (
                    <ChevronDown size={20} color={colors.textSecondary} />
                  )}
                </Pressable>
                {expandedSection === "care" ? (
                  <Text
                    style={[
                      styles.accordionBody,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {identifiedPlant.growingCare[language]}
                  </Text>
                ) : null}
              </View>
            </View>

            {/* Re-scan button */}
            <Pressable
              onPress={() => setIdentifiedPlant(null)}
              style={[
                styles.rescanButton,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                },
              ]}
            >
              <Camera size={18} color={colors.text} />
              <Text style={[styles.rescanText, { color: colors.text }]}>
                Scan another plant
              </Text>
            </Pressable>
          </View>
        )}
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
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 20,
  },
  viewfinderContainer: {
    width: "100%",
    height: 300,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
    marginBottom: 28,
  },
  viewfinderImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  viewfinderOverlay: {
    ...StyleSheet.absoluteFill,
    padding: 30,
    justifyContent: "space-between",
  },
  corner: {
    position: "absolute",
    width: 38,
    height: 38,
    borderColor: "#ffffff",
  },
  cornerTopLeft: {
    top: 30,
    left: 30,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  cornerTopRight: {
    top: 30,
    right: 30,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  cornerBottomLeft: {
    bottom: 30,
    left: 30,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  cornerBottomRight: {
    bottom: 30,
    right: 30,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  instructionBanner: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  instructionText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  cameraTriggerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginBottom: 24,
  },
  cameraCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraTriggerText: {
    fontSize: 20,
    fontWeight: "700",
  },
  secondaryActions: {
    gap: 12,
    marginBottom: 16,
  },
  whiteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
  },
  whiteButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  plantHeroImage: {
    width: "100%",
    height: 240,
    borderRadius: 20,
    resizeMode: "cover",
    marginBottom: 18,
  },
  matchStatus: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  plantCommonName: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  plantScientific: {
    fontSize: 16,
    fontStyle: "italic",
    marginBottom: 20,
  },
  listenButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 16,
  },
  listenText: {
    fontSize: 15,
    fontWeight: "700",
  },
  safetyBanner: {
    flexDirection: "row",
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
  },
  safetyText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  accordionContainer: {
    marginBottom: 24,
  },
  accordionItem: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 16,
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  accordionTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  accordionBody: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  rescanButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  rescanText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
