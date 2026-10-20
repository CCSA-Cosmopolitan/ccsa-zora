import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, router, usePathname } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";

import { initializeLocalDatabase } from "@/features/field-scouting/data/migrations";


import { getMobileAccessToken } from "@/auth/session";
import * as SecureStore from "expo-secure-store";
import { useVoiceStore } from "@/features/voice/voice-store";
import { LANGUAGES } from "@/features/i18n/languages";

export default function RootLayout() {
  const pathname=usePathname();
  useEffect(()=>{let active=true;getMobileAccessToken().then(token=>{if(active&&!token&&pathname!=="/login")router.replace("/login");});return()=>{active=false;};},[pathname]);
  useEffect(()=>{SecureStore.getItemAsync("zora.language").then(lang=>{const found=LANGUAGES.find(l=>l.code===lang);if(found)useVoiceStore.getState().setLanguage(found.code);});},[]);
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            networkMode: "offlineFirst",
            retry: 1,
            staleTime: 30_000,
          },
          mutations: {
            networkMode: "offlineFirst",
          },
        },
      }),
  );

  return (
    <SQLiteProvider databaseName="zora-field.db" onInit={initializeLocalDatabase}>
      <QueryClientProvider client={queryClient}>

        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "fade",
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="assistant" options={{ headerShown: false }} />
          <Stack.Screen name="plants" options={{ headerShown: false }} />
          <Stack.Screen name="farm" options={{ headerShown: false }} />
          <Stack.Screen name="language" options={{ headerShown: false }} />
          <Stack.Screen name="live" options={{ headerShown: false }} />
          <Stack.Screen name="subscribe" options={{ headerShown: false }} />
          <Stack.Screen name="scouting/new" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
        </Stack>
      </QueryClientProvider>
    </SQLiteProvider>
  );
}
