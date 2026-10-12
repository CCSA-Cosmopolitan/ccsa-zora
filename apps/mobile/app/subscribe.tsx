import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  FarmerTier,
  SUBSCRIPTION_PLANS,
  useSubscriptionStore,
} from "@/features/subscription/subscription-store";

export default function SubscribeScreen() {
  const router = useRouter();
  const { currentTier, weeklyQueriesUsed, maxWeeklyFreeQueries, activeUntil, upgradeTier, resetDemoQuota } =
    useSubscriptionStore();
  const [selectedTier, setSelectedTier] = useState<FarmerTier>("PRO_FARMER");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "ussd" | "transfer" | "airtime">("card");
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedPlan =
    SUBSCRIPTION_PLANS.find((p) => p.id === selectedTier) ??
    (SUBSCRIPTION_PLANS[1] as (typeof SUBSCRIPTION_PLANS)[number]);

  function handleSubscribe() {
    setIsProcessing(true);
    setTimeout(() => {
      upgradeTier(selectedTier, `ps_${Date.now()}`);
      setIsProcessing(false);
      Alert.alert(
        "Subscription Activated! 🎉",
        `You are now subscribed to ${selectedPlan.title}. You have unlimited voice questions, camera diagnosis, and severe weather SMS alerts.`,
        [
          {
            text: "Start Farming with Zora",
            onPress: () => router.push("/assistant"),
          },
        ],
      );
    }, 1200);
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header Hero */}
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>PREMIUM EXTENSION & AI ADVISORY</Text>
          <Text style={styles.title}>Unlock the full power of Zora for your farm</Text>
          <Text style={styles.subtitle}>
            Unlimited voice questions, camera pest diagnoses, and micro-climate alerts delivered directly in your mother tongue.
          </Text>

          {/* Current Status Badge */}
          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Current Plan:</Text>
              <Text style={styles.statusValue}>
                {currentTier === "FREE" ? "Zora Starter (Free)" : selectedPlan.title}
              </Text>
            </View>
            {currentTier === "FREE" ? (
              <Text style={styles.quotaText}>
                Weekly Voice Quota: {weeklyQueriesUsed} of {maxWeeklyFreeQueries} questions used
              </Text>
            ) : (
              <Text style={styles.activeUntilText}>
                Active until: {activeUntil ? new Date(activeUntil).toLocaleDateString() : "Next Month"} · Unlimited Access
              </Text>
            )}
          </View>
        </View>

        {/* Pricing Cards */}
        <Text style={styles.sectionHeading}>Choose your plan</Text>
        <View style={styles.planList}>
          {SUBSCRIPTION_PLANS.filter((p) => p.id !== "FREE").map((plan) => {
            const isSelected = selectedTier === plan.id;
            return (
              <Pressable
                key={plan.id}
                onPress={() => setSelectedTier(plan.id)}
                style={[
                  styles.planCard,
                  isSelected && styles.planCardSelected,
                  plan.popular && styles.planCardPopular,
                ]}
              >
                {plan.popular ? (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
                  </View>
                ) : null}

                <View style={styles.planHeader}>
                  <Text style={styles.planTitle}>{plan.title}</Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.currencySymbol}>₦</Text>
                    <Text style={styles.priceAmount}>{plan.priceNgn.toLocaleString()}</Text>
                    <Text style={styles.pricePeriod}>/{plan.period}</Text>
                  </View>
                </View>

                <View style={styles.featureList}>
                  {plan.features.map((feature, idx) => (
                    <View key={idx} style={styles.featureRow}>
                      <Text style={styles.checkMark}>✓</Text>
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Payment Channels */}
        <Text style={styles.sectionHeading}>Select payment method</Text>
        <View style={styles.paymentMethods}>
          {[
            { id: "card", label: "Debit Card", desc: "Mastercard, Visa, Verve (Paystack)" },
            { id: "ussd", label: "USSD Code", desc: "Dial *737#, *919#, *894# etc." },
            { id: "transfer", label: "Bank Transfer", desc: "Instant virtual account transfer" },
            { id: "airtime", label: "Airtime / Mobile", desc: "MTN, Airtel, Glo direct billing" },
          ].map((method) => {
            const isChosen = paymentMethod === method.id;
            return (
              <Pressable
                key={method.id}
                onPress={() => setPaymentMethod(method.id as typeof paymentMethod)}
                style={[styles.methodCard, isChosen && styles.methodCardSelected]}
              >
                <View style={styles.radioDot}>
                  {isChosen ? <View style={styles.radioDotInner} /> : null}
                </View>
                <View style={styles.methodCopy}>
                  <Text style={styles.methodLabel}>{method.label}</Text>
                  <Text style={styles.methodDesc}>{method.desc}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* CTA Button */}
        <Pressable
          disabled={isProcessing}
          onPress={handleSubscribe}
          style={[styles.subscribeButton, isProcessing && styles.subscribeButtonDisabled]}
        >
          <Text style={styles.subscribeButtonText}>
            {isProcessing
              ? "Connecting Paystack Secure Gateway…"
              : `Subscribe for ₦${selectedPlan.priceNgn.toLocaleString()} / month`}
          </Text>
        </Pressable>

        {/* Reset Demo Quota for testing */}
        <Pressable onPress={resetDemoQuota} style={styles.resetButton}>
          <Text style={styles.resetButtonText}>Reset Free Weekly Quota (Testing)</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f3f7f2",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  hero: {
    backgroundColor: "#063d2a",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    color: "#a9dfbf",
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
    lineHeight: 28,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: "#d4efdf",
    lineHeight: 18,
    marginBottom: 16,
  },
  statusCard: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 12,
    padding: 12,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  statusLabel: {
    color: "#d4efdf",
    fontSize: 13,
  },
  statusValue: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  quotaText: {
    color: "#f9e79f",
    fontSize: 12,
    fontWeight: "600",
  },
  activeUntilText: {
    color: "#a9dfbf",
    fontSize: 12,
    fontWeight: "600",
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e3a2f",
    marginBottom: 12,
  },
  planList: {
    gap: 14,
    marginBottom: 24,
  },
  planCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 18,
    borderWidth: 2,
    borderColor: "#e1e8e2",
  },
  planCardSelected: {
    borderColor: "#196f3d",
    backgroundColor: "#f9fcf9",
  },
  planCardPopular: {
    position: "relative",
  },
  popularBadge: {
    position: "absolute",
    top: -10,
    right: 16,
    backgroundColor: "#e67e22",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  popularBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#edf2ee",
  },
  planTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#145a32",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  currencySymbol: {
    fontSize: 14,
    fontWeight: "700",
    color: "#196f3d",
  },
  priceAmount: {
    fontSize: 22,
    fontWeight: "800",
    color: "#196f3d",
  },
  pricePeriod: {
    fontSize: 12,
    color: "#566573",
  },
  featureList: {
    gap: 8,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  checkMark: {
    color: "#27ae60",
    fontWeight: "900",
    marginRight: 8,
    fontSize: 14,
  },
  featureText: {
    fontSize: 13,
    color: "#34495e",
    flex: 1,
    lineHeight: 18,
  },
  paymentMethods: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e1e8e2",
    marginBottom: 24,
  },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f4f1",
  },
  methodCardSelected: {
    backgroundColor: "#f4fbf6",
  },
  radioDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#196f3d",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  radioDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#196f3d",
  },
  methodCopy: {
    flex: 1,
  },
  methodLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2c3e50",
  },
  methodDesc: {
    fontSize: 12,
    color: "#7f8c8d",
    marginTop: 2,
  },
  subscribeButton: {
    backgroundColor: "#1e8449",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 14,
  },
  subscribeButtonDisabled: {
    opacity: 0.6,
  },
  subscribeButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  resetButton: {
    alignItems: "center",
    padding: 10,
  },
  resetButtonText: {
    color: "#7f8c8d",
    fontSize: 12,
    textDecorationLine: "underline",
  },
});
