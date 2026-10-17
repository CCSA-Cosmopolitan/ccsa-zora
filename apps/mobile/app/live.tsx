import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Camera,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  X,
} from "lucide-react-native";
import { router } from "expo-router";

import { useVoiceStore } from "@/features/voice/voice-store";

const { width } = Dimensions.get("window");

export default function ZoraLiveScreen() {
  const { language, t, colors, speakText, stopSpeaking } = useVoiceStore();

  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [facing, setFacing] = useState<"front" | "back">("back");
  const [liveState, setLiveState] = useState<"listening" | "speaking" | "observing">("listening");

  const pulseAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    // Pulse animation for the glowing live orb
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.25,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Spoken greeting when entering Live mode
    const welcomeText =
      language === "ha"
        ? "Zora na saurare. Nuna min gonarka kuma ka yi magana yadda kake so."
        : language === "yo"
          ? "Zora n gbọ. Fi oko rẹ han mi ki o si sọrọ bi o ṣe fẹ."
          : language === "ig"
            ? "Zora na-ege ntị. Gosi m ugbo gị ma kwuo okwu otú ị chọrọ."
            : language === "pcm"
              ? "Zora dey live with you. Show me your farm and talk anything wey you want."
              : "Zora Live is active. Point your camera at your crops and talk with me freely.";

    speakText(welcomeText);

    return () => {
      stopSpeaking();
    };
  }, []);

  function handleEndSession() {
    stopSpeaking();
    router.back();
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Controls */}
      <View style={styles.topBar}>
        <Pressable onPress={handleEndSession} style={styles.iconCircle}>
          <ArrowLeft size={22} color="#ffffff" />
        </Pressable>

        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Zora Live</Text>
        </View>

        <Pressable onPress={handleEndSession} style={styles.iconCircle}>
          <X size={22} color="#ffffff" />
        </Pressable>
      </View>

      {/* Main Viewport: Camera or Dark Canvas */}
      <View style={styles.mainCanvas}>
        {/* Visualizer Orb */}
        <View style={styles.orbWrapper}>
          <Animated.View
            style={[
              styles.outerGlow,
              {
                transform: [{ scale: pulseAnim }],
                opacity: liveState === "speaking" ? 0.35 : 0.2,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.innerGlow,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />
          <View style={styles.coreOrb}>
            <Volume2 size={40} color="#ffffff" />
          </View>
        </View>

        {/* Live Status Subtitle */}
        <Text style={styles.statusTitle}>
          {liveState === "speaking"
            ? "Zora is talking"
            : isMicOn
              ? "Listening to you..."
              : "Microphone muted"}
        </Text>

        <Text style={styles.statusHelp}>
          {language === "ha"
            ? "Kuna iya nuna ganye ko ƙasa a kyamara"
            : language === "yo"
              ? "O le fi ewe tabi ilẹ han lori kamẹra"
              : language === "ig"
                ? "Ị nwere ike igosi akwụkwọ ma ọ bụ ala na igwefoto"
                : language === "pcm"
                  ? "You fit point camera at your leaf or sand"
                  : "Point camera at any crop or soil while talking"}
        </Text>
      </View>

      {/* Bottom Floating Control Bar */}
      <View style={styles.bottomBar}>
        {/* Toggle Video */}
        <Pressable
          onPress={() => setIsVideoOn(!isVideoOn)}
          style={[styles.controlButton, !isVideoOn && styles.controlButtonOff]}
        >
          {isVideoOn ? (
            <Video size={24} color="#ffffff" />
          ) : (
            <VideoOff size={24} color="#f87171" />
          )}
        </Pressable>

        {/* Flip Camera */}
        <Pressable
          onPress={() => setFacing(facing === "back" ? "front" : "back")}
          style={styles.controlButton}
        >
          <Camera size={24} color="#ffffff" />
        </Pressable>

        {/* Toggle Mic */}
        <Pressable
          onPress={() => setIsMicOn(!isMicOn)}
          style={[styles.controlButton, !isMicOn && styles.controlButtonOff]}
        >
          {isMicOn ? (
            <Mic size={24} color="#ffffff" />
          ) : (
            <MicOff size={24} color="#f87171" />
          )}
        </Pressable>

        {/* End Live Call */}
        <Pressable onPress={handleEndSession} style={styles.endButton}>
          <X size={26} color="#ffffff" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d0e12",
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(22, 163, 74, 0.2)",
    borderWidth: 1,
    borderColor: "#22c55e",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22c55e",
  },
  liveText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  mainCanvas: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  orbWrapper: {
    width: width * 0.55,
    height: width * 0.55,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 36,
  },
  outerGlow: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: width * 0.3,
    backgroundColor: "#22c55e",
  },
  innerGlow: {
    position: "absolute",
    width: "75%",
    height: "75%",
    borderRadius: width * 0.25,
    backgroundColor: "#16a34a",
    opacity: 0.5,
  },
  coreOrb: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#158449",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 8,
  },
  statusTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: 8,
    textAlign: "center",
  },
  statusHelp: {
    color: "#9ca3af",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  controlButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  controlButtonOff: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
  },
  endButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#dc2626",
    alignItems: "center",
    justifyContent: "center",
  },
});
