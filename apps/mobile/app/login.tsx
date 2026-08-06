import { router } from "expo-router";
import { useState } from "react";
import { Alert, Image, Linking, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getSupabaseClient } from "@/auth/supabase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [enrollmentSecret, setEnrollmentSecret] = useState<string | null>(null);
  const [enrollmentUri, setEnrollmentUri] = useState<string | null>(null);

  async function signIn() {
    const supabase = getSupabaseClient();
    if (!supabase) {
      router.replace("/");
      return;
    }
    setSubmitting(true);
    const result = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (result.error) {
      Alert.alert("Sign in failed", result.error.message);
      return;
    }
    const assurance = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    const factors = await supabase.auth.mfa.listFactors();
    if (assurance.error || !assurance.data || factors.error || !factors.data) {
      Alert.alert("MFA check failed", assurance.error?.message ?? factors.error?.message ?? "Unable to verify the session assurance level.");
      return;
    }
    if (assurance.data.currentLevel === "aal2") {
      router.replace("/");
      return;
    }
    const verifiedFactor = factors.data.totp.find((item) => item.status === "verified");
    if (verifiedFactor) {
      setFactorId(verifiedFactor.id);
      return;
    }
    for (const factor of factors.data.all.filter((item) => item.factor_type === "totp" && item.status === "unverified")) {
      await supabase.auth.mfa.unenroll({ factorId: factor.id });
    }
    const enrollment = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "CCSA Zora" });
    if (enrollment.error || !enrollment.data.totp) {
      Alert.alert("MFA enrollment failed", enrollment.error?.message ?? "Unable to start authenticator enrollment.");
      return;
    }
    setFactorId(enrollment.data.id);
    setEnrollmentSecret(enrollment.data.totp.secret);
    setEnrollmentUri(enrollment.data.totp.uri);
  }

  async function verifyMfa() {
    const supabase = getSupabaseClient();
    if (!supabase || !factorId) return;
    setSubmitting(true);
    const result = await supabase.auth.mfa.challengeAndVerify({ factorId, code: verificationCode });
    setSubmitting(false);
    if (result.error) {
      Alert.alert("Verification failed", result.error.message);
      return;
    }
    router.replace("/");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.card}>
        <Image source={require("../assets/brand/zora-wordmark.jpeg")} style={styles.wordmark} />
        <Text style={styles.eyebrow}>CCSA ZORA INTELLIGENCE</Text>
        <Text style={styles.title}>{factorId ? "Secure verification" : "Welcome back"}</Text>
        <Text style={styles.help}>{enrollmentUri ? "Open the setup link in your authenticator, then enter its six-digit code." : factorId ? "Enter your authenticator code to continue." : "Enter your FIMS organization workspace. Your session is encrypted in the device secure store."}</Text>
        {factorId ? (
          <>
            {enrollmentUri ? (
              <View style={styles.enrollment}>
                <Pressable onPress={() => void Linking.openURL(enrollmentUri)} style={styles.setupButton}>
                  <Text style={styles.setupButtonText}>Open authenticator setup</Text>
                </Pressable>
                <Text style={styles.secretLabel}>Manual setup key</Text>
                <Text selectable style={styles.secret}>{enrollmentSecret}</Text>
              </View>
            ) : null}
            <TextInput autoComplete="one-time-code" keyboardType="number-pad" maxLength={6} onChangeText={(value) => setVerificationCode(value.replace(/\D/g, ""))} placeholder="6-digit authenticator code" style={styles.input} value={verificationCode} />
          </>
        ) : (
          <>
            <TextInput autoCapitalize="none" autoComplete="email" keyboardType="email-address" onChangeText={setEmail} placeholder="Email" style={styles.input} value={email} />
            <TextInput autoCapitalize="none" autoComplete="password" onChangeText={setPassword} placeholder="Password" secureTextEntry style={styles.input} value={password} />
          </>
        )}
        <Pressable disabled={submitting || (factorId ? verificationCode.length !== 6 : !email || password.length < 8)} onPress={factorId ? verifyMfa : signIn} style={styles.button}>
          <Text style={styles.buttonText}>{submitting ? "Verifying…" : factorId ? "Verify and continue" : "Enter Zora workspace"}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, justifyContent: "center", padding: 18, backgroundColor: "#f3f7f2" },
  card: { borderWidth: 1, borderColor: "#d2ded5", borderRadius: 18, padding: 20, backgroundColor: "#ffffff" },
  wordmark: { width: 184, height: 78, resizeMode: "contain", alignSelf: "center", marginBottom: 12 },
  eyebrow: { color: "#087246", fontSize: 9, fontWeight: "900", letterSpacing: 1.4 },
  title: { color: "#063d2a", fontSize: 25, fontWeight: "900", marginTop: 5 },
  help: { color: "#607168", fontSize: 12, lineHeight: 18, marginTop: 6, marginBottom: 12 },
  enrollment: { borderWidth: 1, borderColor: "#d2ded5", borderRadius: 12, padding: 12, backgroundColor: "#f8fbf8" },
  setupButton: { minHeight: 42, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: "#e5f1e9" },
  setupButtonText: { color: "#087246", fontSize: 12, fontWeight: "900" },
  secretLabel: { color: "#607168", fontSize: 10, marginTop: 10 },
  secret: { color: "#063d2a", fontSize: 11, fontWeight: "700", marginTop: 3 },
  input: { height: 48, borderWidth: 1, borderColor: "#c3d3c8", borderRadius: 12, paddingHorizontal: 12, marginTop: 10, backgroundColor: "#ffffff" },
  button: { height: 50, alignItems: "center", justifyContent: "center", borderRadius: 12, marginTop: 16, backgroundColor: "#087246" },
  buttonText: { color: "#ffffff", fontSize: 13, fontWeight: "900" },
});
