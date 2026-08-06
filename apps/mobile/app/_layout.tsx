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
    <SQLiteProvider
      databaseName="zora-field.db"
      onInit={initializeLocalDatabase}
    >
      <QueryClientProvider client={queryClient}>
        <FieldSyncCoordinator />
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: "#f3f7f2" },
            headerStyle: { backgroundColor: "#063d2a" },
            headerTintColor: "#ffffff",
            headerTitleStyle: { fontWeight: "700" },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="assistant" options={{ title: "Ask Zora" }} />
          <Stack.Screen
            name="scouting/new"
            options={{ title: "New scouting log" }}
          />
          <Stack.Screen name="login" options={{ title: "Sign in" }} />
        </Stack>
      </QueryClientProvider>
    </SQLiteProvider>
  );
}
