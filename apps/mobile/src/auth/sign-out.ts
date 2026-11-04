import { router } from "expo-router";

import { clearMobileAccessToken } from "@/auth/session";
import { api, stopAudio } from "@/services/assistant";

export async function signOut() {
  stopAudio();
  try {
    await api("/api/auth/session", { method: "DELETE" });
  } catch {
    // Local sign-out still proceeds when the server is unreachable.
  } finally {
    await clearMobileAccessToken();
    router.replace("/login");
  }
}
