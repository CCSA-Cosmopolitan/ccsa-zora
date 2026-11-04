import React, { useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { ImageIcon, Volume2 } from "lucide-react-native";
import { router, useFocusEffect } from "expo-router";

import { useVoiceStore } from "@/features/voice/voice-store";
import { EXTRAS } from "@/features/i18n/extras";
import { usePlantSession } from "@/features/plants/plant-session";
import { identifyPlant } from "@/services/assistant";
import { ZoraHeader } from "@/components/navigation/ZoraHeader";
import { TabBar } from "@/components/navigation/TabBar";
import { FloatingVoicePill } from "@/components/voice/FloatingVoicePill";
import { OutlineButton, ScreenTitle, layout } from "@/components/ui";
import { signOut } from "@/auth/sign-out";

const CORNER = 26;

export default function PlantsScreen() {
  const { t, colors, language, speakText, stopSpeaking, isSpeaking } = useVoiceStore();
  const extra = EXTRAS[language];
  const [permission, requestPermission] = useCameraPermissions();
  const camera = useRef<CameraView>(null);
  const [busy, setBusy] = useState(false);
  const [cameraActive, setCameraActive] = useState(true);
  const working = useRef(false);

  useFocusEffect(
    React.useCallback(() => {
      setCameraActive(true);
      return () => {
        setCameraActive(false);
        void stopSpeaking();
      };
    }, [stopSpeaking]),
  );

  async function identify(base64: string, uri: string) {
    if (working.current) return;
    working.current = true;
    setBusy(true);
    try {
      const result = await identifyPlant({ image: `data:image/jpeg;base64,${base64}`, language });
      usePlantSession.getState().set(uri, result);
      router.push("/plant-result" as never);
    } catch (e) {
      Alert.alert("Zora", e instanceof Error ? e.message : extra.tryAgain);
    } finally {
      working.current = false;
      setBusy(false);
    }
  }

  async function takePhoto() {
    if (busy) return;
    try {
      const picture = await camera.current?.takePictureAsync({ quality: 0.4, base64: true, skipProcessing: true });
      if (!picture?.base64) throw new Error(extra.photoNeeded);
      await identify(picture.base64, picture.uri);
    } catch (e) {
      Alert.alert("Zora", e instanceof Error ? e.message : extra.photoNeeded);
    }
  }

  async function choosePhoto() {
    if (busy) return;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.5,
        base64: true,
      });
      const asset = result.assets?.[0];
      if (result.canceled || !asset?.base64) return;
      await identify(asset.base64, asset.uri);
    } catch (e) {
      Alert.alert("Zora", e instanceof Error ? e.message : extra.photoNeeded);
    }
  }

  function hearGuidance() {
    if (isSpeaking) void stopSpeaking();
    else void speakText(t.plantsPage.cameraInstruction).catch(() => {});
  }

  const granted = permission?.granted;

  return (
    <SafeAreaView style={[layout.safe, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      <ZoraHeader mode="back" />
      <ScrollView style={layout.flex} contentContainerStyle={layout.content} showsVerticalScrollIndicator={false}>
        <ScreenTitle>{t.plantsPage.title}</ScreenTitle>

        <View style={styles.viewfinder}>
          {granted && cameraActive ? (
            <CameraView ref={camera} style={StyleSheet.absoluteFill} facing="back" />
          ) : (
            <View style={styles.permission}>
              <Text style={styles.permissionText}>
                {permission && !permission.canAskAgain
                  ? "Camera access is turned off. Enable it in your phone settings."
                  : "Allow camera access to identify plants."}
              </Text>
              {permission?.canAskAgain !== false ? (
                <Pressable onPress={requestPermission} style={styles.permissionButton}>
                  <Text style={styles.permissionButtonText}>OK</Text>
                </Pressable>
              ) : null}
            </View>
          )}
          <View pointerEvents="none" style={[styles.corner, styles.tl]} />
          <View pointerEvents="none" style={[styles.corner, styles.tr]} />
          <View pointerEvents="none" style={[styles.corner, styles.bl]} />
          <View pointerEvents="none" style={[styles.corner, styles.br]} />
          <View pointerEvents="none" style={styles.captionWrap}>
            <Text style={styles.caption}>{t.plantsPage.cameraInstruction}</Text>
          </View>
          {busy ? (
            <View style={styles.busy}>
              <ActivityIndicator color="#fff" size="large" />
              <Text style={styles.busyText}>{extra.identifying}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.shutterRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t.plantsPage.takePhoto}
            onPress={takePhoto}
            disabled={busy || !granted}
            style={[styles.shutterRing, { borderColor: colors.text, opacity: busy || !granted ? 0.4 : 1 }]}
          >
            <View style={[styles.shutter, { backgroundColor: colors.text }]} />
          </Pressable>
          <Text style={[styles.shutterLabel, { color: colors.text }]}>{t.plantsPage.takePhoto}</Text>
        </View>

        <View style={styles.buttons}>
          <OutlineButton Icon={ImageIcon} label={t.plantsPage.choosePhoto} onPress={choosePhoto} disabled={busy} />
          <OutlineButton
            Icon={Volume2}
            label={isSpeaking ? extra.stopListening : t.plantsPage.hearCameraGuidance}
            onPress={hearGuidance}
          />
        </View>

        <Pressable accessibilityRole="button" onPress={() => void signOut()} style={styles.signOut}>
          <Text style={[styles.signOutText, { color: colors.textSecondary }]}>{extra.signOut}</Text>
        </Pressable>
      </ScrollView>
      <FloatingVoicePill />
      <TabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  viewfinder: {
    aspectRatio: 16 / 10,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#16251c",
    marginBottom: 24,
  },
  permission: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 14 },
  permissionText: { color: "#fff", fontSize: 16, textAlign: "center", lineHeight: 22 },
  permissionButton: { backgroundColor: "#fff", borderRadius: 20, paddingHorizontal: 24, paddingVertical: 10 },
  permissionButtonText: { fontSize: 16, fontWeight: "700", color: "#111" },
  corner: { position: "absolute", width: CORNER, height: CORNER, borderColor: "#fff" },
  tl: { top: 18, left: 18, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 10 },
  tr: { top: 18, right: 18, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 10 },
  bl: { bottom: 18, left: 18, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 10 },
  br: { bottom: 18, right: 18, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 10 },
  captionWrap: { position: "absolute", left: 0, right: 0, bottom: 22, alignItems: "center" },
  caption: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    paddingHorizontal: 40,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowRadius: 4,
  },
  busy: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  busyText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  shutterRow: { alignItems: "center", gap: 10, marginBottom: 24 },
  shutterRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  shutter: { width: 62, height: 62, borderRadius: 31 },
  shutterLabel: { fontSize: 17, fontWeight: "600" },
  buttons: { gap: 12 },
  signOut: { alignSelf: "center", marginTop: 20, paddingVertical: 8 },
  signOutText: { fontSize: 15, fontWeight: "600" },
});
