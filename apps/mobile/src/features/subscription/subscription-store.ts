import { create } from "zustand";

export type FarmerTier = "FREE" | "PRO_FARMER" | "CLUSTER_COOP";

export interface SubscriptionPlan {
  id: FarmerTier;
  title: string;
  priceNgn: number;
  period: "month" | "year";
  weeklyVoiceQuota: number | "unlimited";
  features: string[];
  popular?: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "FREE",
    title: "Zora Starter",
    priceNgn: 0,
    period: "month",
    weeklyVoiceQuota: 3,
    features: [
      "3 voice agronomy questions per week",
      "7-day hyper-local weather forecast",
      "Basic planting & fertilizer calendar",
      "Local language voice output (Hausa, Yorùbá, Igbo, Fulfulde)",
    ],
  },
  {
    id: "PRO_FARMER",
    title: "Zora Pro Farmer",
    priceNgn: 750,
    period: "month",
    weeklyVoiceQuota: "unlimited",
    popular: true,
    features: [
      "Unlimited voice & text AI agronomy questions",
      "Camera-based leaf disease & pest diagnosis",
      "Optimal spraying window alerts (Rain/Wind)",
      "SMS & WhatsApp severe weather warnings",
      "Offline audio guides for poor-network zones",
    ],
  },
  {
    id: "CLUSTER_COOP",
    title: "Cooperative Cluster",
    priceNgn: 25000,
    period: "month",
    weeklyVoiceQuota: "unlimited",
    features: [
      "Up to 50 smallholder farmers included",
      "Group yield forecasting & scouting maps",
      "Certified PDF agronomy audit reports for bank loans",
      "Dedicated extension officer portal access",
    ],
  },
];

interface SubscriptionState {
  currentTier: FarmerTier;
  weeklyQueriesUsed: number;
  maxWeeklyFreeQueries: number;
  activeUntil: string | null;
  paymentRef: string | null;
  canAskQuery: () => boolean;
  queriesRemaining: () => number;
  recordQuery: () => boolean;
  upgradeTier: (tier: FarmerTier, ref?: string) => void;
  resetDemoQuota: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  currentTier: "FREE",
  weeklyQueriesUsed: 1, // Start with 1 used so they see quota in action (2 remaining)
  maxWeeklyFreeQueries: 3,
  activeUntil: null,
  paymentRef: null,

  canAskQuery: () => {
    const { currentTier, weeklyQueriesUsed, maxWeeklyFreeQueries } = get();
    if (currentTier !== "FREE") return true;
    return weeklyQueriesUsed < maxWeeklyFreeQueries;
  },

  queriesRemaining: () => {
    const { currentTier, weeklyQueriesUsed, maxWeeklyFreeQueries } = get();
    if (currentTier !== "FREE") return 999;
    return Math.max(0, maxWeeklyFreeQueries - weeklyQueriesUsed);
  },

  recordQuery: () => {
    const { canAskQuery, weeklyQueriesUsed } = get();
    if (!canAskQuery()) return false;
    set({ weeklyQueriesUsed: weeklyQueriesUsed + 1 });
    return true;
  },

  upgradeTier: (tier: FarmerTier, ref?: string) => {
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 1);
    set({
      currentTier: tier,
      activeUntil: expiry.toISOString(),
      paymentRef: ref ?? `paystack_sub_${Date.now()}`,
      weeklyQueriesUsed: 0,
    });
  },

  resetDemoQuota: () => {
    set({ weeklyQueriesUsed: 0 });
  },
}));
