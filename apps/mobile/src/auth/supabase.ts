import "react-native-url-polyfill/auto";

import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const storage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

let client: SupabaseClient | null | undefined;

export function getSupabaseClient() {
  if (process.env.EXPO_PUBLIC_ZORA_DEMO_MODE === "true") return null;
  if (client !== undefined) return client;
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  client = url && anonKey
    ? createClient(url, anonKey, {
        auth: { storage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
      })
    : null;
  return client;
}

export async function getMobileAccessToken() {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export async function getDeviceId() {
  const key = "zora.device-id";
  const existing = await SecureStore.getItemAsync(key);
  if (existing) return existing;
  const created = Crypto.randomUUID();
  await SecureStore.setItemAsync(key, created);
  return created;
}
