import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";

import { initializeLocalDatabase } from "@/features/field-scouting/data/migrations";
import { FieldSyncCoordinator } from "@/features/field-scouting/sync/sync-coordinator";

export default function RootLayout() {
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
        <FieldSyncCoordinator />
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
