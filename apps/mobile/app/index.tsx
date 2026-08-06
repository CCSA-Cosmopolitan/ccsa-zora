import * as Network from "expo-network";
import { Link } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getScoutingOverview } from "@/features/field-scouting/data/scouting.repository";
import { useSyncStore } from "@/features/field-scouting/state/sync-store";
import { runFieldSync } from "@/features/field-scouting/sync/sync-coordinator";

export default function ZoraCompanionHome() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const network = Network.useNetworkState();
  const sync = useSyncStore();
  const overview = useQuery({
    queryKey: ["scouting", "overview"],
    queryFn: () => getScoutingOverview(db),
  });
  const data = overview.data ?? { observations: [], fields: 0, pending: 0, conflicts: 0 };

  async function synchronize() {
    try {
      await runFieldSync(db);
      await queryClient.invalidateQueries({ queryKey: ["scouting"] });
    } catch {
      // The sync store presents the failure immediately below the control.
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Image source={require("../assets/brand/zora-wordmark.jpeg")} style={styles.wordmark} />
          <View style={styles.connectionBadge}>
            <View style={[styles.connectionDot, network.isInternetReachable === false && styles.connectionDotOffline]} />
            <Text style={styles.connectionText}>{network.isInternetReachable === false ? "Offline" : "Online"}</Text>
          </View>
        </View>

        <View style={styles.welcome}>
          <Text style={styles.eyebrow}>YOUR AI FARMING COMPANION</Text>
          <Text style={styles.greeting}>Good morning. What is happening on your farm?</Text>
          <Text style={styles.welcomeText}>Speak in your language, show Zora a problem, or continue your offline field work.</Text>
          <Link href="/assistant" asChild>
            <Pressable style={styles.askButton}>
              <View style={styles.voiceOrb}><Text style={styles.voiceOrbText}>●</Text></View>
              <View style={styles.askCopy}><Text style={styles.askTitle}>Ask Zora</Text><Text style={styles.askSubtitle}>Voice + field context + KGML-Ag</Text></View>
              <Text style={styles.askArrow}>›</Text>
            </Pressable>
          </Link>
        </View>

        <View style={styles.climateAlert}>
          <View style={styles.alertIcon}><Text style={styles.alertIconText}>24h</Text></View>
          <View style={styles.alertCopy}>
            <Text style={styles.alertLabel}>ZORA CLIMATE WATCH</Text>
            <Text style={styles.alertTitle}>Rainfall likely. Review fertilizer timing.</Text>
            <Text style={styles.alertText}>High runoff risk is expected in parts of the Abuja pilot area.</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Quick actions</Text>
        <View style={styles.actionGrid}>
          <ActionCard href="/assistant" label="Ask a question" mark="AI" detail="5 languages" />
          <ActionCard href="/scouting/new" label="Diagnose a crop" mark="CV" detail="Camera evidence" disabled={!data.fields} />
          <ActionCard href="/scouting/new" label="Map a field issue" mark="GIS" detail="GPS + boundary" disabled={!data.fields} />
          <ActionCard href="/scouting/new" label="Record field work" mark="LOG" detail="Works offline" disabled={!data.fields} />
        </View>

        <View style={styles.summaryHeader}><Text style={styles.sectionTitle}>Field workspace</Text><Text style={styles.sectionMeta}>FIMS connected</Text></View>
        <View style={styles.summaryGrid}>
          <SummaryCard label="Assigned fields" value={String(data.fields)} detail="Offline field pack" />
          <SummaryCard label="Pending sync" value={String(data.pending)} detail={`${data.conflicts} conflicts`} />
        </View>

        <Pressable disabled={sync.running || network.isInternetReachable === false} onPress={synchronize} style={styles.syncNotice}>
          <View style={styles.syncIcon}><Text style={styles.syncIconText}>↻</Text></View>
          <View style={styles.syncCopy}>
            <Text style={styles.syncTitle}>{sync.running ? "Synchronizing field intelligence…" : "Synchronize offline field pack"}</Text>
            <Text style={styles.syncText}>{sync.lastError ?? (sync.lastSyncedAt ? `Last completed ${formatRelative(sync.lastSyncedAt)}. Tap to refresh.` : "Download boundaries and upload queued evidence.")}</Text>
          </View>
        </Pressable>

        <View style={styles.summaryHeader}><Text style={styles.sectionTitle}>Recent observations</Text><Text style={styles.sectionMeta}>This device</Text></View>
        <View style={styles.list}>
          {data.observations.map((observation) => (
            <View key={observation.id} style={styles.row}>
              <View style={[styles.rowIndex, observation.syncStatus === "conflict" && styles.rowIndexConflict]} />
              <View style={styles.rowBody}><Text style={styles.rowTitle}>{observation.title}</Text><Text style={styles.rowMeta}>{observation.fieldName} · {formatRelative(observation.observedAt)}</Text></View>
              <Text style={[styles.rowStatus, observation.syncStatus === "synced" && styles.rowStatusSynced]}>{observation.syncStatus}</Text>
            </View>
          ))}
          {!data.observations.length ? <Text style={styles.empty}>No scouting logs are stored on this device yet.</Text> : null}
        </View>

        {!data.fields ? <Text style={styles.emptyHelp}>Synchronize once while connected to download your assigned FIMS field pack.</Text> : null}
        <Text style={styles.footer}>CCSA Zora · Centre for Climate-Smart Agriculture</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function ActionCard({ href, label, mark, detail, disabled = false }: { href: "/assistant" | "/scouting/new"; label: string; mark: string; detail: string; disabled?: boolean }) {
  return (
    <Link href={href} asChild>
      <Pressable disabled={disabled} style={[styles.actionCard, disabled && styles.disabled]}>
        <View style={styles.actionMark}><Text style={styles.actionMarkText}>{mark}</Text></View>
        <Text style={styles.actionLabel}>{label}</Text>
        <Text style={styles.actionDetail}>{detail}</Text>
      </Pressable>
    </Link>
  );
}

function SummaryCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <View style={styles.summaryCard}><Text style={styles.summaryLabel}>{label}</Text><Text style={styles.summaryValue}>{value}</Text><Text style={styles.summaryDetail}>{detail}</Text></View>;
}

function formatRelative(value: string) {
  const minutes = Math.max(0, Math.round((Date.now() - Date.parse(value)) / 60_000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  return hours < 24 ? `${hours}h ago` : new Date(value).toLocaleDateString();
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f3f7f2" },
  content: { padding: 16, paddingBottom: 34 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  wordmark: { width: 144, height: 62, resizeMode: "contain" },
  connectionBadge: { flexDirection: "row", alignItems: "center", gap: 5, borderWidth: 1, borderColor: "#d2ded5", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7, backgroundColor: "#ffffff" },
  connectionDot: { width: 7, height: 7, borderRadius: 999, backgroundColor: "#158449" },
  connectionDotOffline: { backgroundColor: "#a13d31" },
  connectionText: { color: "#52675c", fontSize: 10, fontWeight: "800" },
  welcome: { overflow: "hidden", borderRadius: 20, padding: 18, backgroundColor: "#063d2a" },
  eyebrow: { color: "#edaf1d", fontSize: 9, fontWeight: "900", letterSpacing: 1.4 },
  greeting: { color: "#ffffff", fontSize: 25, lineHeight: 30, fontWeight: "800", marginTop: 6 },
  welcomeText: { color: "#b9d3c5", fontSize: 12, lineHeight: 18, marginTop: 7 },
  askButton: { flexDirection: "row", alignItems: "center", borderRadius: 15, marginTop: 16, padding: 11, backgroundColor: "#ffffff" },
  voiceOrb: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "#e5aa20" },
  voiceOrbText: { color: "#063d2a", fontSize: 18 },
  askCopy: { flex: 1, marginLeft: 11 },
  askTitle: { color: "#063d2a", fontSize: 14, fontWeight: "900" },
  askSubtitle: { color: "#607168", fontSize: 10, marginTop: 2 },
  askArrow: { color: "#0a6840", fontSize: 26, fontWeight: "400" },
  climateAlert: { flexDirection: "row", borderWidth: 1, borderColor: "#ead49a", borderRadius: 16, marginTop: 12, padding: 13, backgroundColor: "#fff8e5" },
  alertIcon: { width: 42, height: 42, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: "#edaf1d" },
  alertIconText: { color: "#3e2d04", fontSize: 10, fontWeight: "900" },
  alertCopy: { flex: 1, marginLeft: 11 },
  alertLabel: { color: "#8b6310", fontSize: 8, fontWeight: "900", letterSpacing: 1.1 },
  alertTitle: { color: "#3f320e", fontSize: 12, fontWeight: "800", marginTop: 3 },
  alertText: { color: "#756742", fontSize: 10, lineHeight: 15, marginTop: 3 },
  sectionTitle: { color: "#123126", fontSize: 16, fontWeight: "900", marginTop: 22, marginBottom: 10 },
  actionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  actionCard: { width: "48.5%", minHeight: 128, borderWidth: 1, borderColor: "#d2ded5", borderRadius: 16, padding: 13, backgroundColor: "#ffffff" },
  actionMark: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#e5efe7" },
  actionMarkText: { color: "#087246", fontSize: 9, fontWeight: "900" },
  actionLabel: { color: "#123126", fontSize: 12, fontWeight: "900", marginTop: 12 },
  actionDetail: { color: "#607168", fontSize: 10, marginTop: 3 },
  disabled: { opacity: 0.42 },
  summaryHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionMeta: { color: "#607168", fontSize: 9, fontWeight: "700", marginTop: 22, marginBottom: 10 },
  summaryGrid: { flexDirection: "row", gap: 9 },
  summaryCard: { flex: 1, borderWidth: 1, borderColor: "#d2ded5", borderRadius: 15, padding: 13, backgroundColor: "#ffffff" },
  summaryLabel: { color: "#607168", fontSize: 9, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.6 },
  summaryValue: { color: "#063d2a", fontSize: 25, fontWeight: "900", marginTop: 6 },
  summaryDetail: { color: "#738078", fontSize: 10, marginTop: 1 },
  syncNotice: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#c8d8cc", borderRadius: 15, marginTop: 10, padding: 12, backgroundColor: "#e8f2e9" },
  syncIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#087246" },
  syncIconText: { color: "#ffffff", fontSize: 21 },
  syncCopy: { flex: 1, marginLeft: 11 },
  syncTitle: { color: "#16452f", fontSize: 11, fontWeight: "900" },
  syncText: { color: "#52675c", fontSize: 9, lineHeight: 14, marginTop: 2 },
  list: { overflow: "hidden", borderWidth: 1, borderColor: "#d2ded5", borderRadius: 15, backgroundColor: "#ffffff" },
  row: { minHeight: 68, flexDirection: "row", alignItems: "center", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#d2ded5", paddingHorizontal: 13, paddingVertical: 10 },
  rowIndex: { width: 8, height: 34, borderRadius: 4, backgroundColor: "#49a33b" },
  rowIndexConflict: { backgroundColor: "#a13d31" },
  rowBody: { flex: 1, marginLeft: 11 },
  rowTitle: { color: "#123126", fontSize: 12, fontWeight: "800" },
  rowMeta: { color: "#607168", fontSize: 10, marginTop: 4 },
  rowStatus: { color: "#8b6310", fontSize: 9, fontWeight: "900", textTransform: "uppercase" },
  rowStatusSynced: { color: "#087246" },
  empty: { padding: 18, textAlign: "center", color: "#607168", fontSize: 11 },
  emptyHelp: { marginTop: 9, color: "#607168", textAlign: "center", fontSize: 10 },
  footer: { color: "#7d8982", fontSize: 8, fontWeight: "700", textAlign: "center", marginTop: 24, textTransform: "uppercase", letterSpacing: 1 },
});
