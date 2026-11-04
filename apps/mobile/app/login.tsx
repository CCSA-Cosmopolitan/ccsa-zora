import { useState } from "react";
import {
  ActivityIndicator,
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
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { api } from "@/services/assistant";
import { saveMobileAccessToken } from "@/auth/session";
import { useVoiceStore } from "@/features/voice/voice-store";

export default function LoginScreen() {
  const colors = useVoiceStore((s) => s.colors);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = sent ? code.trim().length === 6 : phone.trim().length >= 10;

  async function submit() {
    if (busy || !canSubmit) return;
    setBusy(true);
    setError("");
    try {
      const response = await api(
        "/api/auth/phone",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: phone.trim(), code: code.trim(), action: sent ? "verify" : "start" }),
        },
        false,
      );
      const data = await response.json();
      if (sent) {
        await saveMobileAccessToken(data.token);
        router.replace("/");
      } else {
        setSent(true);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in unavailable");
    } finally {
      setBusy(false);
    }
  }

  const inputStyle = [styles.input, { borderColor: colors.cardBorder, backgroundColor: colors.inputBg, color: colors.text }];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Image source={require("../assets/brand/zora-square.jpeg")} style={styles.logo} />
          <Text style={[styles.title, { color: colors.text }]}>Sign in to Zora</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {sent
              ? "Enter the code we sent to your phone."
              : "Use the phone number registered in FIMS. Your administrator must enable Zora access for you."}
          </Text>

          <Text style={[styles.label, { color: colors.text }]}>Phone number</Text>
          <TextInput
            accessibilityLabel="Phone number"
            style={[...inputStyle, sent && { opacity: 0.6 }]}
            keyboardType="phone-pad"
            autoComplete="tel"
            value={phone}
            onChangeText={setPhone}
            editable={!sent && !busy}
            placeholder="08012345678"
            placeholderTextColor={colors.textMuted}
          />

          {sent ? (
            <>
              <Text style={[styles.label, { color: colors.text }]}>Verification code</Text>
              <TextInput
                accessibilityLabel="Verification code"
                style={inputStyle}
                keyboardType="number-pad"
                autoComplete="sms-otp"
                maxLength={6}
                value={code}
                onChangeText={setCode}
                placeholder="6-digit code"
                placeholderTextColor={colors.textMuted}
              />
            </>
          ) : null}

          {!!error && (
            <Text accessibilityRole="alert" style={[styles.error, { color: colors.dangerText }]}>
              {error}
            </Text>
          )}

          <Pressable
            accessibilityRole="button"
            disabled={busy || !canSubmit}
            onPress={submit}
            style={[styles.button, { backgroundColor: colors.voicePillBg, opacity: busy || !canSubmit ? 0.5 : 1 }]}
          >
            {busy ? (
              <ActivityIndicator color={colors.voicePillText} />
            ) : (
              <Text style={[styles.buttonText, { color: colors.voicePillText }]}>
                {sent ? "Open Zora" : "Send sign-in code"}
              </Text>
            )}
          </Pressable>

          {sent ? (
            <Pressable
              onPress={() => {
                setSent(false);
                setCode("");
                setError("");
              }}
              style={styles.link}
            >
              <Text style={[styles.linkText, { color: colors.accent }]}>Use another number</Text>
            </Pressable>
          ) : null}

          <View style={styles.footer}>
            <Text style={[styles.hint, { color: colors.textSecondary }]}>
              An agent can help you sign in the first time.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 48, paddingBottom: 24 },
  logo: { width: 64, height: 64, borderRadius: 14, marginBottom: 28 },
  title: { fontSize: 32, fontWeight: "700", letterSpacing: -0.6, marginBottom: 10 },
  subtitle: { fontSize: 17, lineHeight: 25, marginBottom: 28 },
  label: { fontSize: 15, fontWeight: "600", marginBottom: 8 },
  input: { height: 56, borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, fontSize: 17, marginBottom: 18 },
  error: { fontSize: 15, marginBottom: 14 },
  button: { height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", marginTop: 6 },
  buttonText: { fontSize: 17, fontWeight: "700" },
  link: { alignItems: "center", paddingVertical: 18 },
  linkText: { fontSize: 16, fontWeight: "600" },
  footer: { flex: 1, justifyContent: "flex-end", paddingTop: 24 },
  hint: { fontSize: 14, textAlign: "center" },
});
